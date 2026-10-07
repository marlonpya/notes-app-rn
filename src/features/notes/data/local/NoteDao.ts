import { and, desc, eq } from 'drizzle-orm';
import { addDatabaseChangeListener } from 'expo-sqlite';

import type { AppDatabase } from '@/core/db/client';
import type { Unsubscribe } from '@/core/types';

import { notesTable, SYNC_STATUS, type NewNoteEntity, type NoteEntity } from './notesTable';

/** ≈ @Dao de Room. Solo SQL, sin reglas de negocio. */
export class NoteDao {
  constructor(private readonly db: AppDatabase) {}

  getVisible(userId: string): Promise<NoteEntity[]> {
    return this.db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.userId, userId), eq(notesTable.deleted, false)))
      .orderBy(desc(notesTable.updatedAt));
  }

  /** Emite el estado inicial y vuelve a consultar cada vez que cambia la tabla. */
  observeVisible(userId: string, listener: (rows: NoteEntity[]) => void): Unsubscribe {
    let active = true;
    const emit = () => {
      this.getVisible(userId)
        .then((rows) => active && listener(rows))
        .catch((error) => console.warn('[NoteDao] observeVisible', error));
    };

    emit();
    const subscription = addDatabaseChangeListener((event) => {
      if (event.tableName === 'notes') emit();
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }

  async getById(id: string): Promise<NoteEntity | null> {
    const rows = await this.db.select().from(notesTable).where(eq(notesTable.id, id)).limit(1);
    return rows[0] ?? null;
  }

  getPending(userId: string): Promise<NoteEntity[]> {
    return this.db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.userId, userId), eq(notesTable.syncStatus, SYNC_STATUS.pending)));
  }

  async upsert(entity: NewNoteEntity): Promise<void> {
    await this.db
      .insert(notesTable)
      .values(entity)
      .onConflictDoUpdate({ target: notesTable.id, set: entity });
  }

  /** Marca como sincronizada solo si nadie la editó mientras se subía. */
  async markSynced(id: string, updatedAt: number): Promise<void> {
    await this.db
      .update(notesTable)
      .set({ syncStatus: SYNC_STATUS.synced })
      .where(and(eq(notesTable.id, id), eq(notesTable.updatedAt, updatedAt)));
  }

  async hardDelete(id: string): Promise<void> {
    await this.db.delete(notesTable).where(eq(notesTable.id, id));
  }

  async deleteAll(): Promise<void> {
    await this.db.delete(notesTable);
  }
}
