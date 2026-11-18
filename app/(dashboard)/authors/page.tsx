'use client';

import { useEffect, useState } from 'react';
import { authActions } from '@/actions/auth.actions';
import { authorActions } from '@/actions/author.actions';
import { Author, User } from '@/types';

export default function AuthorsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const data = await authorActions.getAll();
      setAuthors(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar autores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(authActions.getStoredUser());
    loadAuthors();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setNationality('');
    setBirthDate('');
  };

  const handleEdit = (author: Author) => {
    setError('');
    setSuccess('');
    setEditingId(author.id);
    setName(author.name);
    setNationality(author.nationality || '');
    setBirthDate(author.birthDate ? author.birthDate.split('T')[0] : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        name,
        nationality: nationality || undefined,
        birthDate: birthDate || undefined,
      };

      if (editingId) {
        await authorActions.update(editingId, payload);
        setSuccess('Autor atualizado com sucesso!');
      } else {
        await authorActions.create(payload);
        setSuccess('Autor cadastrado com sucesso!');
      }
      resetForm();
      await loadAuthors();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar autor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este autor?')) return;
    setError('');
    setSuccess('');

    try {
      await authorActions.remove(id);
      setSuccess('Autor excluído com sucesso!');
      if (editingId === id) resetForm();
      await loadAuthors();
    } catch (err: any) {
      setError(err.message || 'Não foi possível excluir o autor');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Autores</h1>
        <p className="text-sm text-slate-500">
          Gerenciamento de autores do acervo
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

      {user?.isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4"
        >
          <h2 className="text-lg font-semibold text-slate-800">
            {editingId ? 'Editar Autor' : 'Novo Autor'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Isaac Asimov"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nacionalidade
              </label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Ex: Russo-americano"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              {submitting
                ? 'Salvando...'
                : editingId
                ? 'Atualizar Autor'
                : 'Cadastrar Autor'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-600 text-sm">Carregando autores...</p>
        ) : authors.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">
            Nenhum autor cadastrado.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Nacionalidade</th>
                <th className="py-3 px-4">Nascimento</th>
                {user?.isAdmin && <th className="py-3 px-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {authors.map((author) => (
                <tr key={author.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{author.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {author.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {author.nationality || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDate(author.birthDate)}
                  </td>
                  {user?.isAdmin && (
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(author)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(author.id)}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md cursor-pointer"
                      >
                        Excluir
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}