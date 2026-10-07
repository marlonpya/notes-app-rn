import { AuthError } from '../domain/AuthError';
import { AuthValidationError, MIN_PASSWORD_LENGTH } from '../domain/usecases';

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthValidationError) {
    return error.reason === 'INVALID_EMAIL'
      ? 'Ingresa un correo válido.'
      : `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (error instanceof AuthError) {
    switch (error.reason) {
      case 'INVALID_CREDENTIALS':
        return 'Correo o contraseña incorrectos.';
      case 'USER_ALREADY_EXISTS':
        return 'Ya existe una cuenta con ese correo.';
      case 'EMAIL_NOT_CONFIRMED':
        return 'Confirma tu correo antes de iniciar sesión.';
      case 'NETWORK':
        return 'Sin conexión. Revisa tu red e inténtalo de nuevo.';
      case 'UNKNOWN':
        return error.message;
    }
  }
  return 'No se pudo completar la operación. Revisa tu conexión.';
}
