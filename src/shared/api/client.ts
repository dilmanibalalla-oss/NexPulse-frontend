import { create, isAxiosError } from 'axios';

import { bearerValue, shouldEndSession } from '@/shared/api/interceptors';
import { env } from '@/shared/config/env';
import { useSessionStore } from '@/shared/state/sessionStore';

export const apiClient = create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token;
  if (token) {
    config.headers.set('Authorization', bearerValue(token));
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (
      isAxiosError(error) &&
      shouldEndSession(error.response?.status, error.config?.url, useSessionStore.getState().token)
    ) {
      try {
        await useSessionStore.getState().clearSession();
      } catch {
        useSessionStore.setState({ token: null });
      }
    }

    return Promise.reject(error);
  },
);
