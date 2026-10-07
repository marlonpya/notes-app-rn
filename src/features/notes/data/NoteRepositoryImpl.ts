import { randomUUID } from 'expo-crypto';

import type { Unsubscribe } from '@/core/types';

import type { Note, NoteDraft } from '../domain/Note';
import type { NoteRepository } from '../domain/NoteRepository';
import type { NoteDao } from './local/NoteDao';
import { SYNC_STATUS } from './local/notesTable';
import type { SyncCursorStore } from './local/SyncCursorStore';
import { NoteMapper } from './mappers/NoteMapper';
import type { NoteRemoteDataSource } from './remote/NoteRemoteDataSource';

/**
 * Offline-first: toda escritura va primero a SQLite marcada como `pending`
 * y `sync()` la replica en Supabase. Conflictos: gana el `updated_at` más reciente.
 */
export class NoteRepositoryImpl implements NoteRepository {
  private syncInFlight: Promise<void> | null = null;

  constructor(
    private readonly dao: NoteDao,
    private readonly remote: NoteRemoteDataSource,
    private readonly cursorStore: SyncCursorStore,
    private readonly getUserId: () => Promise<string>,
  ) {}

  observeNotes(listener: (notes: Note[]) => void): Unsubscribe {
    let unsubscribe: Unsubscribe | null = null;
    let cancelled = false;

    this.getUserId()
      .then((userId) => {
        if (cancelled) return;
        unsubscribe = this.dao.observeVisible(userId, (rows) =>
          listener(rows.map(NoteMapper.entityToDomain)),
        );
      })
      .catch((error) => console.warn('[NoteRepository] observeNotes', error));

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }

  async getNote(id: string): Promise<Note | null> {
    const entity = await this.dao.getById(id);
    return entity && !entity.deleted ? NoteMapper.entityToDomain(entity) : null;
  }

  async saveNote(draft: NoteDraft): Promise<Note> {
    const userId = await this.getUserId();
    const now = Date.now();
    const existing = draft.id ? await this.dao.getById(draft.id) : null;

    const entity = {
      id: existing?.id ?? randomUUID(),
      userId,
      title: draft.title,
      content: draft.content,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      deleted: false,
      syncStatus: SYNC_STATUS.pending,
    };
    await this.dao.upsert(entity);
    return NoteMapper.entityToDomain(entity);
  }

  async deleteNote(id: string): Promise<void> {
    const existing = await this.dao.getById(id);
    if (!existing) return;
    await this.dao.upsert({
      ...existing,
      deleted: true,
      updatedAt: Date.now(),
      syncStatus: SYNC_STATUS.pending,
    });
  }

  sync(): Promise<void> {
    // Evita dos sincronizaciones simultáneas (≈ Mutex de corrutinas).
    this.syncInFlight ??= this.runSync().finally(() => {
      this.syncInFlight = null;
    });
    return this.syncInFlight;
  }

  async clearLocal(): Promise<void> {
    const userId = await this.getUserId().catch(() => null);
    await this.dao.deleteAll();
    if (userId) await this.cursorStore.clear(userId);
  }

  private async runSync(): Promise<void> {
    const userId = await this.getUserId();
    await this.push(userId);
    await this.pull(userId);
  }

  private async push(userId: string): Promise<void> {
    const pending = await this.dao.getPending(userId);
    if (pending.length === 0) return;

    await this.remote.upsert(pending.map(NoteMapper.entityToDto));

    for (const entity of pending) {
      if (entity.deleted) {
        await this.dao.hardDelete(entity.id);
      } else {
        await this.dao.markSynced(entity.id, entity.updatedAt);
      }
    }
  }

  private async pull(userId: string): Promise<void> {
    const cursor = await this.cursorStore.get(userId);
    const changes = await this.remote.fetchChangedSince(cursor);
    if (changes.length === 0) return;

    for (const dto of changes) {
      const remote = NoteMapper.dtoToEntity(dto);
      const local = await this.dao.getById(remote.id);

      const localWins =
        local?.syncStatus === SYNC_STATUS.pending && local.updatedAt >= remote.updatedAt;
      if (localWins) continue;

      if (remote.deleted) {
        await this.dao.hardDelete(remote.id);
      } else {
        await this.dao.upsert(remote);
      }
    }

    await this.cursorStore.set(userId, changes[changes.length - 1].server_updated_at);
  }
}
