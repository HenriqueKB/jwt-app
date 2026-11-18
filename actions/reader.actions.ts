import { apiFetch } from '@/lib/api';
import { Loan, Reader } from '@/types';

export const readerActions = {
  getAll: () => apiFetch<Reader[]>('/readers'),
  getLoans: (id: number) => apiFetch<Loan[]>(`/readers/${id}/loans`),
  create: (data: Omit<Reader, 'id'>) =>
    apiFetch<Reader>('/readers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Reader>) =>
    apiFetch<Reader>(`/readers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};