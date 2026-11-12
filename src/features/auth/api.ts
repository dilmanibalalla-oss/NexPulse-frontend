import { apiClient } from '@/shared/api/client';
import { bindClient } from '@/shared/api/http';
import { loginAccount, registerAccount } from '@/shared/api/services/auth';
import { useSessionStore } from '@/shared/state/sessionStore';

import { AuthRequestError } from './errors';
import type { LoginInput, RegisterInput } from './request';

export async function login(input: LoginInput): Promise<string> {
  return loginAccount(bindClient(apiClient), input);
}

export async function register(input: RegisterInput): Promise<void> {
  return registerAccount(bindClient(apiClient), input);
}

export async function logout(): Promise<void> {
  try {
    await useSessionStore.getState().clearSession();
  } catch {
    throw new AuthRequestError('Could not sign out on this device. Try again.', null);
  }
}

export async function persistSessionToken(token: string): Promise<void> {
  try {
    await useSessionStore.getState().setToken(token);
  } catch (error) {
    if (error instanceof AuthRequestError) {
      throw error;
    }

    throw new AuthRequestError('Could not save your session on this device.', null);
  }
}
