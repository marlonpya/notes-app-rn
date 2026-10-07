# notes-app-rn

App de notas **offline-first** en React Native (Expo) con **Supabase**, construida con
**Clean Architecture + MVI**, pensada como puente para equipos que vienen de Android
(Clean Architecture, MVI, Room y corrutinas).

## Stack

| Android | Este proyecto |
|---|---|
| Kotlin | TypeScript (strict) |
| Navigation Compose | Expo Router (`src/app`) |
| ViewModel MVI (State / Intent / Effect) | `createMviStore` sobre Zustand (`src/core/mvi`) |
| Room (`@Entity`, `@Dao`, migraciones) | expo-sqlite + Drizzle ORM + drizzle-kit |
| `Flow<List<T>>` | `observeNotes(listener)` → `Unsubscribe` (listener de cambios de SQLite) |
| Corrutinas / `viewModelScope` | `async/await` + `track()` / `dispose()` del store |
| Hilt | Composition root manual (`src/core/di`) + React Context |
| Retrofit + kotlinx.serialization | supabase-js + Zod |
| JUnit + fakes | Jest (jest-expo) + fakes en memoria |

## Arquitectura

```
src/
├── app/                         # Rutas (Expo Router). Solo delegan a pantallas.
│   ├── _layout.tsx              # Migraciones, DI y rutas protegidas por sesión
│   ├── index.tsx                # Lista de notas
│   ├── login.tsx
│   └── note/[id].tsx            # Editor ("new" = nota nueva)
├── core/
│   ├── config/env.ts
│   ├── db/                      # Cliente Drizzle + migraciones generadas
│   ├── di/                      # Dependencies, container (≈ módulo Hilt), Provider
│   ├── mvi/                     # createMviStore + hooks (useMviStore/State/Effect)
│   ├── supabase/client.ts
│   └── ui/                      # Tema y componentes base
└── features/
    ├── auth/
    │   ├── domain/              # AuthRepository, casos de uso, validaciones
    │   ├── data/                # SupabaseAuthRepository
    │   └── presentation/        # login (contract + store + screen), useSession
    └── notes/
        ├── domain/              # Note, NoteRepository, casos de uso
        ├── data/
        │   ├── local/           # notesTable (≈ @Entity), NoteDao, SyncCursorStore
        │   ├── remote/          # NoteDto (Zod), NoteRemoteDataSource
        │   ├── mappers/
        │   └── NoteRepositoryImpl.ts   # offline-first + sincronización
        └── presentation/        # list/ y editor/ (contract + store + screen)
```

**Regla de dependencias:** `presentation → domain ← data`. El dominio no importa
React, SQLite ni Supabase. Las pantallas obtienen los casos de uso con `useDependencies()`.

### MVI

Cada pantalla tiene un `*Contract.ts` (State, Intent, Effect) y un `*Store.ts`:

```tsx
const store = useMviStore(() => createNotesListStore(deps)); // ≈ by viewModels()
const state = useMviState(store, (s) => s);                   // ≈ collectAsState()
useMviEffect(store, (effect) => { /* navegación, toasts */ }); // ≈ LaunchedEffect
store.dispatch({ type: 'DeleteNote', id });                    // intent
```

### Sincronización offline-first

1. Toda escritura va a SQLite con `sync_status = 'pending'` (los borrados son lógicos).
2. `sync()` sube las notas pendientes (`upsert`) y luego descarga los cambios remotos
   usando `server_updated_at` (hora del servidor) como cursor incremental.
3. Conflictos: **gana el `updated_at` más reciente** (last-write-wins), en el cliente al
   descargar y en Postgres con un trigger.
4. Se sincroniza al abrir la lista, al hacer pull-to-refresh y después de guardar o borrar.

> Limitaciones conocidas de este enfoque simple: LWW depende del reloj de cada
> dispositivo y no fusiona ediciones concurrentes de la misma nota. Si necesitas algo
> más robusto, el siguiente paso natural es [PowerSync](https://www.powersync.com/)
> (mantiene SQLite + Drizzle).

## Puesta en marcha

1. **Supabase:** crea un proyecto y ejecuta
   [`supabase/migrations/20261006000000_create_notes.sql`](supabase/migrations/20261006000000_create_notes.sql)
   en el SQL Editor (o `supabase db push` con la CLI). Crea la tabla `notes`, el trigger
   y las políticas RLS.
2. **Variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   Completa `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. **Instalar y ejecutar** (funciona en Expo Go):
   ```bash
   npm install
   npx expo start
   ```

## Scripts

| Script | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm test` | Tests unitarios (dominio, mappers, stores MVI) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (config de Expo) |
| `npm run db:generate` | Genera una migración SQLite tras cambiar `notesTable.ts` |

## Añadir una feature

1. `domain/`: entidad, interfaz del repositorio y casos de uso.
2. `data/`: tabla Drizzle (exportarla en `src/core/db/schema.ts`), DAO, datasource remoto,
   mapper e implementación del repositorio. Luego `npm run db:generate`.
3. Registrar los casos de uso en `src/core/di/Dependencies.ts` y `container.ts`.
4. `presentation/`: contrato, store (`createMviStore`) y pantalla; la ruta en `src/app/`.
5. Tests del store con un repositorio fake (ver `src/testing/`).
