export type LoginMode = 'signIn' | 'signUp';

export interface LoginState {
  mode: LoginMode;
  email: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;
}

export const initialLoginState: LoginState = {
  mode: 'signIn',
  email: '',
  password: '',
  isSubmitting: false,
  error: null,
};

export type LoginIntent =
  | { type: 'ChangeEmail'; value: string }
  | { type: 'ChangePassword'; value: string }
  | { type: 'ToggleMode' }
  | { type: 'Submit' };

export type LoginEffect = { type: 'ShowMessage'; message: string };
