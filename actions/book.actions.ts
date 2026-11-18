import { apiFetch } from '@/lib/api';
import { Book } from '@/types';

export interface BookFilters {
  title?: string;
  categoryId?: string;
  authorId?: string;
  available?: boolean;
}

export const bookActions = {
  getAll: (filters?: BookFilters) => {
    const params = new URLSearchParams();
    if (filters?.title) params.set('title', filters.title);
    if (filters?.categoryId) params.set('categoryId', filters.categoryId);
    if (filters?.authorId) params.set('authorId', filters.authorId);
    if (filters?.available) params.set('available', 'true');

    const query = params.toString();
    return apiFetch<Book[]>(`/books${query ? `?${query}` : ''}`);
  },
  create: (data: {
    title: string;
    isbn: string;
    year: number;
    totalCopies: number;
    availableCopies: number;
    categoryId: number;
    authorIds: number[];
  }) => apiFetch<Book>('/books', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) =>
    apiFetch<Book>(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) =>
    apiFetch(`/books/${id}`, { method: 'DELETE' }),
};