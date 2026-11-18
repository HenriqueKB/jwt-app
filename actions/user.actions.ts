import { apiFetch } from '@/lib/api';
import { User } from '@/types';

export const userActions = {
  getAll: () => apiFetch<User[]>('/user'),
  create: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
  }) => apiFetch<User>('/user', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<User> & { password?: string }) =>
    apiFetch<User>(`/user/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleActive: (id: number, active: boolean) =>
    apiFetch<User>(`/user/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    }),
};