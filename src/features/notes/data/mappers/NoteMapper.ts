import type { Note } from '../../domain/Note';
import { SYNC_STATUS, type NoteEntity } from '../local/notesTable';
import type { NoteDto, NoteUpsertDto } from '../remote/NoteDto';

export const NoteMapper = {
  entityToDomain(entity: NoteEntity): Note {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      createdAt: new Date(entity.createdAt),
      updatedAt: new Date(entity.updatedAt),
      isPendingSync: entity.syncStatus === SYNC_STATUS.pending,
    };
  },

  entityToDto(entity: NoteEntity): NoteUpsertDto {
    return {
      id: entity.id,
      user_id: entity.userId,
      title: entity.title,
      content: entity.content,
      created_at: new Date(entity.createdAt).toISOString(),
      updated_at: new Date(entity.updatedAt).toISOString(),
      deleted: entity.deleted,
    };
  },

  dtoToEntity(dto: NoteDto): NoteEntity {
    return {
      id: dto.id,
      userId: dto.user_id,
      title: dto.title,
      content: dto.content,
      createdAt: Date.parse(dto.created_at),
      updatedAt: Date.parse(dto.updated_at),
      deleted: dto.deleted,
      syncStatus: SYNC_STATUS.synced,
    };
  },
};
