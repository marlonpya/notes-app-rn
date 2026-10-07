export type AuthErrorReason =
  | 'INVALID_CREDENTIALS'
  | 'USER_ALREADY_EXISTS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'NETWORK'
  | 'UNKNOWN';

/** Error de autenticación del dominio. La capa data traduce los errores del proveedor a este tipo. */
export class AuthError extends Error {
  constructor(
    readonly reason: AuthErrorReason,
    message: string = reason,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
