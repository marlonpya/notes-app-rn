-- Tabla remota de notas. La app es offline-first: SQLite es la fuente de verdad local
-- y esta tabla es la réplica compartida entre dispositivos.
create table if not exists public.notes (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  content text not null default '',
  created_at timestamptz not null,
  -- Hora del cliente: decide conflictos (last-write-wins).
  updated_at timestamptz not null,
  deleted boolean not null default false,
  -- Hora del servidor: cursor del pull incremental. Solo la escribe el trigger.
  server_updated_at timestamptz not null default now()
);

create index if not exists notes_user_server_updated_idx
  on public.notes (user_id, server_updated_at);

-- Mantiene server_updated_at y descarta escrituras más antiguas que la versión guardada.
create or replace function public.notes_before_write()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return old; -- gana la versión más reciente
  end if;
  new.server_updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists notes_before_write on public.notes;
create trigger notes_before_write
  before insert or update on public.notes
  for each row execute function public.notes_before_write();

-- Row Level Security: cada usuario solo ve y modifica sus notas.
alter table public.notes enable row level security;

create policy "notes_select_own" on public.notes
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "notes_insert_own" on public.notes
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "notes_update_own" on public.notes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Sin política de DELETE: los borrados son lógicos (deleted = true) para que se sincronicen.
