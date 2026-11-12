import { apiClient } from '@/shared/api/client';
import { useSessionStore } from '@/shared/state/sessionStore';

import { AuthRequestError, toAuthRequestError } from './errors';
import { parseAuthTokenResponse, parseRegisteredUser } from './parse';
import {
  loginRequestBody,
  registerRequestBody,
  type LoginInput,
  type RegisterInput,
} from './request';

const LOGIN_PATH = '/api/auth/login';
const REGISTER_PATH = '/api/auth/register';

export async function login(input: LoginInput): Promise<string> {
  try {
    const response = await apiClient.post(LOGIN_PATH, loginRequestBody(input));
    const session = parseAuthTokenResponse(response.data);
    if (!session) {
      throw new AuthRequestError(
        'The server returned an unexpected sign-in response.',
        response.status,
      );
    }

    return session.token;
  } catch (error) {
    throw toAuthRequestError(error);
  }
}

export async function register(input: RegisterInput): Promise<void> {
  try {
    const response = await apiClient.post(REGISTER_PATH, registerRequestBody(input));
    if (!parseRegisteredUser(response.data)) {
      throw new AuthRequestError(
        'The server returned an unexpected registration response.',
        response.status,
      );
    }
  } catch (error) {
    throw toAuthRequestError(error);
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
