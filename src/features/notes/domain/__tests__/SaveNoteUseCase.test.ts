import { FakeNoteRepository } from '@/testing/FakeNoteRepository';

import { NoteValidationError } from '../NoteValidationError';
import { MAX_TITLE_LENGTH, SaveNoteUseCase } from '../usecases';

describe('SaveNoteUseCase', () => {
  let repository: FakeNoteRepository;
  let saveNote: SaveNoteUseCase;

  beforeEach(() => {
    repository = new FakeNoteRepository();
    saveNote = new SaveNoteUseCase(repository);
  });

  it('guarda la nota con título y contenido recortados', async () => {
    const note = await saveNote.execute({ title: '  Compras  ', content: ' leche \n' });

    expect(note.title).toBe('Compras');
    expect(note.content).toBe('leche');
    expect(repository.notes.size).toBe(1);
  });

  it('usa la primera línea del contenido como título si falta', async () => {
    const note = await saveNote.execute({ title: '', content: 'Idea genial\nmás detalles' });

    expect(note.title).toBe('Idea genial');
  });

  it('rechaza una nota vacía', async () => {
    await expect(saveNote.execute({ title: ' ', content: '' })).rejects.toEqual(
      new NoteValidationError('EMPTY_NOTE'),
    );
    expect(repository.notes.size).toBe(0);
  });

  it('rechaza un título demasiado largo', async () => {
    const title = 'a'.repeat(MAX_TITLE_LENGTH + 1);

    await expect(saveNote.execute({ title, content: '' })).rejects.toMatchObject({
      reason: 'TITLE_TOO_LONG',
    });
  });
});
