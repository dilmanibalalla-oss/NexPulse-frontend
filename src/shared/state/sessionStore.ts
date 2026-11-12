import { clearAuthToken, readAuthToken, saveAuthToken } from '@/shared/storage/tokenStorage';
import { createSessionStore } from '@/shared/state/createSessionStore';

export const useSessionStore = createSessionStore({
  read: readAuthToken,
  save: saveAuthToken,
  clear: clearAuthToken,
});
