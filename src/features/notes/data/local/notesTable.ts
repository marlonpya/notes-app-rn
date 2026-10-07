import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const SYNC_STATUS = { synced: 'synced', pending: 'pending' } as const;
export type SyncStatus = (typeof SYNC_STATUS)[keyof typeof SYNC_STATUS];

// ≈ @Entity de Room. Fuente de verdad local; Supabase es la réplica remota.
export const notesTable = sqliteTable(
  'notes',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull().default(''),
    createdAt: integer('created_at').notNull(), // epoch ms
    updatedAt: integer('updated_at').notNull(), // epoch ms
    // Borrado lógico: la fila se conserva hasta que el borrado llega a Supabase.
    deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false),
    syncStatus: text('sync_status').$type<SyncStatus>().notNull().default(SYNC_STATUS.pending),
  },
  (table) => [
    index('notes_user_updated_idx').on(table.userId, table.updatedAt),
    index('notes_sync_status_idx').on(table.syncStatus),
  ],
);

export type NoteEntity = typeof notesTable.$inferSelect;
export type NewNoteEntity = typeof notesTable.$inferInsert;
