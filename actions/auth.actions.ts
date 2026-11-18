import { apiFetch, clearSession } from '@/lib/api';
import { User } from '@/types';

function decodeJwtUser(token: string): User | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return {
      id: payload.id ?? payload.sub ?? 1,
      name: payload.name ?? payload.username ?? 'Administrador',
      email: payload.email ?? 'admin@biblioteca.com',
      isAdmin: Boolean(payload.isAdmin),
      active: true,
    } as User;
  } catch {
    return null;
  }
}

export const authActions = {
  login: async (email: string, password: string) => {
    const data = await apiFetch<{
      token?: string;
      accessToken?: string;
      refreshToken?: string;
      user?: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const token = data.accessToken || data.token || '';
    const refreshToken = data.refreshToken || token;
    const user = data.user || decodeJwtUser(token);

    if (!token || !user) {
      throw new Error('Resposta de autenticação inválida do servidor.');
    }

    localStorage.setItem('accessToken', token);
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    document.cookie = 'biblioteca_session=true; path=/; max-age=604800';

    return user;
  },

  logout: async () => {
    try {
      const token =
        localStorage.getItem('refreshToken') ||
        localStorage.getItem('accessToken');
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ token, refreshToken: token }),
      });
    } finally {
      clearSession();
    }
  },

  me: () => apiFetch<User>('/auth/me'),

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;

    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined' && raw !== 'null') {
      try {
        return JSON.parse(raw) as User;
      } catch {
        localStorage.removeItem('user');
      }
    }

    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token');

    if (token && token !== 'undefined' && token !== 'null') {
      const fallbackUser = decodeJwtUser(token);
      if (fallbackUser) {
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
    }

    return null;
  },
};