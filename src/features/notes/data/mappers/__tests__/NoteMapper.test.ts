import { SYNC_STATUS, type NoteEntity } from '../../local/notesTable';
import { NoteMapper } from '../NoteMapper';

const entity: NoteEntity = {
  id: '6f1c2a54-8a4e-4d5b-9f0e-1a2b3c4d5e6f',
  userId: '0b7d9c1e-2f3a-4b5c-8d6e-7f8091a2b3c4',
  title: 'Título',
  content: 'Contenido',
  createdAt: Date.UTC(2026, 0, 1),
  updatedAt: Date.UTC(2026, 0, 2),
  deleted: false,
  syncStatus: SYNC_STATUS.pending,
};

describe('NoteMapper', () => {
  it('convierte entidad a dominio', () => {
    const note = NoteMapper.entityToDomain(entity);

    expect(note.updatedAt.toISOString()).toBe('2026-01-02T00:00:00.000Z');
    expect(note.isPendingSync).toBe(true);
  });

  it('ida y vuelta entidad → DTO → entidad conserva los datos y marca synced', () => {
    const dto = { ...NoteMapper.entityToDto(entity), server_updated_at: '2026-01-02T00:00:01Z' };

    expect(NoteMapper.dtoToEntity(dto)).toEqual({ ...entity, syncStatus: SYNC_STATUS.synced });
  });
});
