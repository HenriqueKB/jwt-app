import { apiFetch } from '@/lib/api';
import { DashboardStats, Loan } from '@/types';

export const loanActions = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiFetch<Loan[]>(`/loans${query}`);
  },
  create: (data: { bookId: number; readerId: number }) =>
    apiFetch<Loan>('/loans', { method: 'POST', body: JSON.stringify(data) }),
  returnBook: (id: number) =>
    apiFetch<Loan>(`/loans/${id}/return`, { method: 'PATCH' }),
  getDashboardStats: () => apiFetch<DashboardStats>('/reports/dashboard'),
};