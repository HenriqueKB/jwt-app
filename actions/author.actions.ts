import { apiFetch } from '@/lib/api';
import { Author } from '@/types';

export const authorActions = {
  getAll: () => apiFetch<Author[]>('/authors'),
  create: (data: Omit<Author, 'id'>) =>
    apiFetch<Author>('/authors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Author>) =>
    apiFetch<Author>(`/authors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) =>
    apiFetch(`/authors/${id}`, { method: 'DELETE' }),
};