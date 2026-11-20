'use client';

import { useEffect, useState } from 'react';
import { loanActions } from '@/actions/loan.actions';
import { bookActions } from '@/actions/book.actions';
import { readerActions } from '@/actions/reader.actions';
import { Book, Loan, Reader } from '@/types';

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  const [statusFilter, setStatusFilter] = useState('');

  
  const [readerId, setReaderId] = useState('');
  const [bookId, setBookId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getLoanId = (loan: any): number =>
    Number(loan.loanId ?? loan.id);

  const getBookId = (book: any): number =>
    Number(book.id ?? book.Id ?? book.bookId);

  const getReaderId = (reader: any): number =>
    Number(reader.id ?? reader.Id ?? reader.readerId);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const clean = String(dateStr).split('T')[0];
    const parts = clean.split('-');
    if (parts.length !== 3) return clean;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const loadAllData = async (status?: string) => {
    try {
      setLoading(true);
      const [loansData, booksData, readersData] = await Promise.all([
        loanActions.getAll(status || undefined),
        bookActions.getAll(),
        readerActions.getAll(),
      ]);
      setLoans(loansData);
      setBooks(booksData);
      setReaders(readersData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados de empréstimos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleFilterChange = async (newStatus: string) => {
    setStatusFilter(newStatus);
    setError('');
    try {
      setLoading(true);
      const data = await loanActions.getAll(newStatus || undefined);
      setLoans(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao filtrar empréstimos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!readerId || !bookId) {
      setError('Selecione o leitor e o livro.');
      return;
    }

    setSubmitting(true);

    try {
      await loanActions.create({
        readerId: Number(readerId),
        bookId: Number(bookId),
      });
      setSuccess('Empréstimo registrado com sucesso! Prazo de devolução: 7 dias.');
      setReaderId('');
      setBookId('');
      await loadAllData(statusFilter);
    } catch (err: any) {
      setError(err.message || 'Não foi possível registrar o empréstimo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (loan: Loan) => {
    const id = getLoanId(loan);
    const bookTitle = (loan as any).book?.title || `Livro #${(loan as any).bookId}`;

    if (!window.confirm(`Confirmar a devolução de "${bookTitle}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const updated = await loanActions.returnBook(id);
      const fineValue = Number((updated as any).fine || 0);
      if (fineValue > 0) {
        setSuccess(
          `Livro devolvido com sucesso! Multa por atraso calculada: R$ ${fineValue.toFixed(2)}`
        );
      } else {
        setSuccess('Livro devolvido com sucesso! Exemplar reposto no acervo.');
      }
      await loadAllData(statusFilter);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar devolução');
    }
  };

  const availableBooks = books.filter((b) => b.availableCopies > 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATRASADO':
        return 'bg-red-100 text-red-700';
      case 'DEVOLVIDO':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Empréstimos</h1>
        <p className="text-sm text-slate-500">
          Registro de retiradas, acompanhamento de prazos e devoluções
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      {/* Formulário de Novo Empréstimo */}
      <form
        onSubmit={handleCreateLoan}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
          <h2 className="text-lg font-semibold text-slate-800">
            Novo Empréstimo
          </h2>
          <span className="text-xs text-slate-500">
            Prazo padrão: 7 dias • Limite: até 3 livros ativos por leitor • Multa: R$ 1,00/dia
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Leitor
            </label>
            <select
              required
              value={readerId}
              onChange={(e) => setReaderId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Selecione um leitor...</option>
              {readers.map((reader) => {
                const rId = getReaderId(reader);
                return (
                  <option key={rId} value={rId}>
                    {reader.name} {reader.cpf ? `(CPF: ${reader.cpf})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Livro (apenas com exemplares disponíveis)
            </label>
            <select
              required
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Selecione um livro...</option>
              {availableBooks.map((book) => {
                const bId = getBookId(book);
                return (
                  <option key={bId} value={bId}>
                    {book.title} — {book.availableCopies} disp.
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            {submitting ? 'Registrando...' : 'Registrar Empréstimo'}
          </button>
        </div>
      </form>

      {/* Filtro rápido por Status */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 mr-1">
          Filtrar por status:
        </span>
        {[
          { label: 'Todos', value: '' },
          { label: 'Ativos', value: 'ATIVO' },
          { label: 'Atrasados', value: 'ATRASADO' },
          { label: 'Devolvidos', value: 'DEVOLVIDO' },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => handleFilterChange(item.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              statusFilter === item.value
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tabela de Empréstimos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-600 text-sm">Carregando empréstimos...</p>
        ) : loans.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">
            Nenhum empréstimo encontrado.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Livro</th>
                <th className="py-3 px-4">Leitor</th>
                <th className="py-3 px-4">Retirada</th>
                <th className="py-3 px-4">Prev. Devolução</th>
                <th className="py-3 px-4">Devolvido em</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Multa</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {loans.map((loan) => {
               const id = getLoanId(loan);
               const bookObj = (loan as any).Book ?? (loan as any).book;
               const readerObj = (loan as any).Reader ?? (loan as any).reader;
                const isReturned =
                  loan.status === 'DEVOLVIDO' || Boolean((loan as any).returnDate);
                const fine = Number((loan as any).fine || 0);

                return (
                  <tr key={id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {bookObj?.title || `Livro #${(loan as any).bookId}`}
                      </div>
                      {bookObj?.isbn && (
                        <div className="text-xs text-slate-400">
                          ISBN: {bookObj.isbn}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">
                        {readerObj?.name || `Leitor #${(loan as any).readerId}`}
                      </div>
                      {readerObj?.cpf && (
                        <div className="text-xs text-slate-400">
                          CPF: {readerObj.cpf}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate((loan as any).loanDate)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate((loan as any).dueDate)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate((loan as any).returnDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          loan.status
                        )}`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {fine > 0 ? `R$ ${fine.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isReturned ? (
                        <button
                          onClick={() => handleReturn(loan)}
                          className="px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-md cursor-pointer"
                        >
                          Devolver
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Concluído</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}