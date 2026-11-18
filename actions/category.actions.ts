import { apiFetch } from '@/lib/api';
import { Category } from '@/types';

export const categoryActions = {
  getAll: () => apiFetch<Category[]>('/categories'),
  create: (data: Omit<Category, 'id'>) =>
    apiFetch<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Category>) =>
    apiFetch<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) =>
    apiFetch(`/categories/${id}`, { method: 'DELETE' }),
};