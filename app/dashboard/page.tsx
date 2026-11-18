'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authActions } from '@/actions/auth.actions';
import { loanActions } from '@/actions/loan.actions';
import { DashboardStats, User } from '@/types';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = authActions.getStoredUser();
    setUser(storedUser);

    if (storedUser?.isAdmin) {
      loanActions
        .getDashboardStats()
        .then((data) => setStats(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <p className="text-slate-600">Carregando informações...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel Geral</h1>
        <p className="text-sm text-slate-500">
          Visão geral das operações da biblioteca
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {user?.isAdmin && stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Total de Livros</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">
              {stats.totalBooks}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Empréstimos Ativos</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.activeLoans}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Empréstimos Atrasados</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats.overdueLoans}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Total em Multas</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              R$ {Number(stats.totalFines).toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Acesso Rápido do Atendente
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Utilize os atalhos abaixo para registrar empréstimos, devoluções ou cadastrar leitores.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/loans"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Gerenciar Empréstimos
            </Link>
            <Link
              href="/readers"
              className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900"
            >
              Cadastrar Leitor
            </Link>
            <Link
              href="/books"
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Consultar Acervo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}