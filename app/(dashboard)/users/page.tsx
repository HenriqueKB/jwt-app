'use client';

import { useEffect, useState } from 'react';
import { authActions } from '@/actions/auth.actions';
import { userActions } from '@/actions/user.actions';
import { User } from '@/types';

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados do formulário de cadastro/edição
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userActions.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar atendentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = authActions.getStoredUser();
    setCurrentUser(stored);

    if (stored?.isAdmin) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setIsAdmin(false);
  };

  const handleEdit = (user: User) => {
    setError('');
    setSuccess('');
    setEditingId(user.id);
    setName(user.name);
    setUsername((user as any).username || '');
    setEmail(user.email);
    setPassword('');
    setIsAdmin(Boolean(user.isAdmin));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingId && password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        const payload: any = {
          name,
          username,
          email,
          isAdmin,
        };
        if (password.trim()) {
          payload.password = password;
        }
        await userActions.update(editingId, payload);
        setSuccess('Atendente atualizado com sucesso!');
      } else {
        await userActions.create({
          name,
          username,
          email,
          password,
          isAdmin,
        });
        setSuccess('Atendente cadastrado com sucesso!');
      }

      resetForm();
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar atendente');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    const currentlyActive = (user as any).active !== false;
    const actionLabel = currentlyActive ? 'desativar' : 'ativar';

    if (!window.confirm(`Deseja realmente ${actionLabel} o acesso de ${user.name}?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await userActions.toggleActive(user.id, !currentlyActive);
      setSuccess(
        `Atendente ${currentlyActive ? 'desativado' : 'ativado'} com sucesso!`
      );
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar status do atendente');
    }
  };

  if (!loading && currentUser && !currentUser.isAdmin) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Acesso restrito. Apenas administradores podem gerenciar atendentes.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Atendentes</h1>
        <p className="text-sm text-slate-500">
          Cadastro e controle de acesso dos operadores e administradores do sistema
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

      {/* Formulário de Cadastro / Edição */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4"
      >
        <h2 className="text-lg font-semibold text-slate-800">
          {editingId ? 'Editar Atendente' : 'Novo Atendente'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ana Paula Souza"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Usuário (login)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: anapaula"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: ana@biblioteca.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {editingId ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
            </label>
            <input
              type="password"
              required={!editingId}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              Conceder permissão de Administrador (acesso total ao sistema)
            </label>
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
              ? 'Atualizar Atendente'
              : 'Cadastrar Atendente'}
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

      {/* Tabela de Atendentes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-600 text-sm">Carregando atendentes...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">
            Nenhum atendente cadastrado.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nome / Usuário</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {users.map((u) => {
                const isActive = (u as any).active !== false;
                const isSelf = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{u.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {u.name}{' '}
                        {isSelf && (
                          <span className="text-xs font-normal text-slate-400">
                            (Você)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        @{(u as any).username || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.isAdmin
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.isAdmin ? 'Administrador' : 'Atendente'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md cursor-pointer"
                      >
                        Editar
                      </button>
                      {!isSelf && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-3 py-1 text-xs font-medium border rounded-md cursor-pointer ${
                            isActive
                              ? 'text-amber-700 hover:bg-amber-50 border-amber-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          {isActive ? 'Desativar' : 'Ativar'}
                        </button>
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