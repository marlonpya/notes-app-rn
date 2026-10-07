import { isAuthError } from '@supabase/supabase-js';

import { AuthValidationError, MIN_PASSWORD_LENGTH } from '../domain/usecases';

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthValidationError) {
    return error.reason === 'INVALID_EMAIL'
      ? 'Ingresa un correo válido.'
      : `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (isAuthError(error)) {
    switch (error.code) {
      case 'invalid_credentials':
        return 'Correo o contraseña incorrectos.';
      case 'user_already_exists':
        return 'Ya existe una cuenta con ese correo.';
      case 'email_not_confirmed':
        return 'Confirma tu correo antes de iniciar sesión.';
    }
    return error.message;
  }
  return 'No se pudo completar la operación. Revisa tu conexión.';
}
