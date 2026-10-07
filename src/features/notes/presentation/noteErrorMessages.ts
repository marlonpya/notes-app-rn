import { MAX_TITLE_LENGTH } from '../domain/usecases';
import { NoteValidationError } from '../domain/NoteValidationError';

export function toNoteErrorMessage(error: unknown): string {
  if (error instanceof NoteValidationError) {
    switch (error.reason) {
      case 'EMPTY_NOTE':
        return 'La nota está vacía.';
      case 'TITLE_TOO_LONG':
        return `El título no puede superar ${MAX_TITLE_LENGTH} caracteres.`;
    }
  }
  if (error instanceof Error && /network|fetch/i.test(error.message)) {
    return 'Sin conexión. Tus cambios se sincronizarán más tarde.';
  }
  return 'Ocurrió un error inesperado.';
}
