import { apiFetch } from '@/lib/api';
import { Category } from '@/types';

export const categoryActions = {
  getAll: () => apiFetch<Category[]>('/category'),
  create: (data: Omit<Category, 'id'>) =>
    apiFetch<Category>('/category', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Category>) =>
    apiFetch<Category>(`/category/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) =>
    apiFetch(`/category/${id}`, { method: 'DELETE' }),
};