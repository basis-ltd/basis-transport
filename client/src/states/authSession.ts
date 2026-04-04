import { localStorageAdapter } from '@/adapters/storage/localStorage.adapter';
import { User } from '@/types/user.type';

interface PersistedAuthSession {
  user?: User;
  token?: string;
}

let currentAuthToken: string | undefined;

export const getCurrentAuthToken = () => currentAuthToken;

export const setCurrentAuthToken = (token?: string) => {
  currentAuthToken = token;
};

export const loadPersistedAuthSession = async (): Promise<PersistedAuthSession> => {
  const [user, token] = await Promise.all([
    localStorageAdapter.getItem<User>('user'),
    localStorageAdapter.getItem<string>('token'),
  ]);

  setCurrentAuthToken(token ?? undefined);

  return {
    user: user ?? undefined,
    token: token ?? undefined,
  };
};

export const persistAuthSession = async ({
  user,
  token,
}: PersistedAuthSession): Promise<void> => {
  setCurrentAuthToken(token);

  await Promise.all([
    user !== undefined
      ? localStorageAdapter.setItem('user', user)
      : Promise.resolve(localStorageAdapter.removeItem('user')),
    token !== undefined
      ? localStorageAdapter.setItem('token', token)
      : Promise.resolve(localStorageAdapter.removeItem('token')),
  ]);
};

export const clearPersistedAuthSession = async (): Promise<void> => {
  setCurrentAuthToken(undefined);

  await Promise.all([
    Promise.resolve(localStorageAdapter.removeItem('user')),
    Promise.resolve(localStorageAdapter.removeItem('token')),
  ]);
};
