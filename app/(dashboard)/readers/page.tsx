'use client';

import { useEffect, useState } from 'react';
import { readerActions } from '@/actions/reader.actions';
import { Reader } from '@/types';

export default function ReadersPage() {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReaders = async () => {
    try {
      setLoading(true);
      const data = await readerActions.getAll();
      setReaders(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar leitores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReaders();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCpf('');
    setEmail('');
    setPhone('');
  };

  const handleEdit = (reader: Reader) => {
    setError('');
    setSuccess('');
    setEditingId(reader.id);
    setName(reader.name);
    setCpf(reader.cpf);
    setEmail(reader.email);
    setPhone(reader.phone || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        name,
        cpf,
        email,
        phone: phone || undefined,
      };

      if (editingId) {
        await readerActions.update(editingId, payload);
        setSuccess('Leitor atualizado com sucesso!');
      } else {
        await readerActions.create(payload);
        setSuccess('Leitor cadastrado com sucesso!');
      }

      resetForm();
      await loadReaders();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar leitor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Leitores</h1>
        <p className="text-sm text-slate-500">
          Cadastro e consulta de leitores da biblioteca
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

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4"
      >
        <h2 className="text-lg font-semibold text-slate-800">
          {editingId ? 'Editar Leitor' : 'Novo Leitor'}
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
              placeholder="Ex: Maria da Silva"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              CPF
            </label>
            <input
              type="text"
              required
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Ex: 123.456.789-00"
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
              placeholder="Ex: maria@email.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: (44) 99999-9999"
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
              ? 'Atualizar Leitor'
              : 'Cadastrar Leitor'}
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-600 text-sm">Carregando leitores...</p>
        ) : readers.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">
            Nenhum leitor cadastrado.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">CPF</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {readers.map((reader) => (
                <tr key={reader.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{reader.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {reader.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{reader.cpf}</td>
                  <td className="py-3 px-4 text-slate-500">{reader.email}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {reader.phone || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEdit(reader)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md cursor-pointer"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}