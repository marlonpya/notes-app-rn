export type NoteValidationReason = 'EMPTY_NOTE' | 'TITLE_TOO_LONG';

export class NoteValidationError extends Error {
  constructor(readonly reason: NoteValidationReason) {
    super(reason);
    this.name = 'NoteValidationError';
  }
}
