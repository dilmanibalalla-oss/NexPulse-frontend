import { AuthRequestError, toAuthRequestError } from '@/features/auth/errors';
import { parseAuthTokenResponse, parseRegisteredUser } from '@/features/auth/parse';
import {
  loginRequestBody,
  registerRequestBody,
  type LoginInput,
  type RegisterInput,
} from '@/features/auth/request';

import type { ApiClient } from '../http';

export async function loginAccount(client: ApiClient, input: LoginInput): Promise<string> {
  try {
    const response = await client.post('/api/auth/login', loginRequestBody(input));
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

export async function registerAccount(client: ApiClient, input: RegisterInput): Promise<void> {
  try {
    const response = await client.post('/api/auth/register', registerRequestBody(input));
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
