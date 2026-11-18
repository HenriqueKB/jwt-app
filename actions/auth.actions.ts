import { apiFetch, clearSession } from '@/lib/api';
import { User } from '@/types';

export const authActions = {
  login: async (email: string, password: string) => {
    const data = await apiFetch<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    document.cookie = 'biblioteca_session=true; path=/; max-age=604800';

    return data.user;
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      clearSession();
    }
  },

  me: () => apiFetch<User>('/auth/me'),

  getStoredUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  },
};