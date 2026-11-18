'use client';

import { useEffect, useState } from 'react';
import { authActions } from '@/actions/auth.actions';
import { categoryActions } from '@/actions/category.actions';
import { Category, User } from '@/types';

export default function CategoriesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryActions.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(authActions.getStoredUser());
    loadCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleEdit = (category: Category) => {
    setError('');
    setSuccess('');
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (editingId) {
        await categoryActions.update(editingId, { name, description });
        setSuccess('Categoria atualizada com sucesso!');
      } else {
        await categoryActions.create({ name, description });
        setSuccess('Categoria cadastrada com sucesso!');
      }
      resetForm();
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta categoria?')) return;
    setError('');
    setSuccess('');

    try {
      await categoryActions.remove(id);
      setSuccess('Categoria excluída com sucesso!');
      if (editingId === id) resetForm();
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Não foi possível excluir a categoria');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Categorias</h1>
        <p className="text-sm text-slate-500">
          Gerenciamento das categorias do acervo
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
            {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ficção Científica"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional da categoria"
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
                ? 'Atualizar Categoria'
                : 'Cadastrar Categoria'}
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
          <p className="p-6 text-slate-600 text-sm">Carregando categorias...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">
            Nenhuma categoria cadastrada.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Descrição</th>
                {user?.isAdmin && <th className="py-3 px-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{cat.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {cat.description || '-'}
                  </td>
                  {user?.isAdmin && (
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
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