import { apiFetch } from '@/lib/api';
import { Loan, Reader } from '@/types';

export const readerActions = {
  getAll: () => apiFetch<Reader[]>('/reader'),
  getLoans: (id: number) => apiFetch<Loan[]>(`/reader/${id}/loans`),
  create: (data: Omit<Reader, 'id'>) =>
    apiFetch<Reader>('/reader', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Reader>) =>
    apiFetch<Reader>(`/reader/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};