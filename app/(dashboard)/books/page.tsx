'use client';

import { useEffect, useState } from 'react';
import { authActions } from '@/actions/auth.actions';
import { bookActions, BookFilters } from '@/actions/book.actions';
import { categoryActions } from '@/actions/category.actions';
import { authorActions } from '@/actions/author.actions';
import { Author, Book, Category, User } from '@/types';

export default function BooksPage() {
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados dos filtros de busca
  const [filterTitle, setFilterTitle] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterAuthorId, setFilterAuthorId] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);

  // Estados do formulário de cadastro/edição
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [totalCopies, setTotalCopies] = useState('1');
  const [availableCopies, setAvailableCopies] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [authorIds, setAuthorIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadBooks = async (filters?: BookFilters) => {
    try {
      setLoading(true);
      const data = await bookActions.getAll(filters);
      setBooks(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar livros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(authActions.getStoredUser());

    const init = async () => {
      try {
        setLoading(true);
        const [booksData, categoriesData, authorsData] = await Promise.all([
          bookActions.getAll(),
          categoryActions.getAll(),
          authorActions.getAll(),
        ]);
        setBooks(booksData);
        setCategories(categoriesData);
        setAuthors(authorsData);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados iniciais');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    await loadBooks({
      title: filterTitle || undefined,
      categoryId: filterCategoryId || undefined,
      authorId: filterAuthorId || undefined,
      available: filterAvailable || undefined,
    });
  };

  const handleClearFilters = async () => {
    setFilterTitle('');
    setFilterCategoryId('');
    setFilterAuthorId('');
    setFilterAvailable(false);
    setError('');
    await loadBooks();
  };

  const toggleAuthor = (id: number) => {
    setAuthorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

const getAuthorId = (author: any): number =>
    Number(author.id ?? author.Id ?? author.authorId);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setIsbn('');
    setDescription('');
    setYear('');
    setTotalCopies('1');
    setAvailableCopies('1');
    setCategoryId('');
    setAuthorIds([]);
  };

  const handleEdit = (book: Book) => {
    setError('');
    setSuccess('');
    setEditingId(book.id);
    setTitle(book.title);
    setIsbn(book.isbn);
    setDescription((book as any).description || '');
    setYear(String(book.year));
    setTotalCopies(String(book.totalCopies));
    setAvailableCopies(String(book.availableCopies));

    const currentCatId =
      (book as any).categoryId ??
      (book as any).Category?.id ??
      (book as any).category?.id ??
      '';
    setCategoryId(currentCatId ? String(currentCatId) : '');

const rawAuthors = (book as any).Authors ?? (book as any).authors ?? [];
    setAuthorIds(
      Array.isArray(rawAuthors)
        ? rawAuthors.map((a: any) => getAuthorId(a)).filter((id) => !Number.isNaN(id))
        : []
    )
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!categoryId) {
      setError('Selecione uma categoria.');
      return;
    }

    if (authorIds.length === 0) {
      setError('Selecione pelo menos um autor.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title,
        isbn,
        description: description || undefined,
        year: Number(year),
        totalCopies: Number(totalCopies),
        availableCopies: Number(availableCopies),
        categoryId: Number(categoryId),
        authorIds,
      };

      if (editingId) {
        await bookActions.update(editingId, payload);
        setSuccess('Livro atualizado com sucesso!');
      } else {
        await bookActions.create(payload);
        setSuccess('Livro cadastrado com sucesso!');
      }

      resetForm();
      await loadBooks();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar livro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este livro?')) return;
    setError('');
    setSuccess('');

    try {
      await bookActions.remove(id);
      setSuccess('Livro excluído com sucesso!');
      if (editingId === id) resetForm();
      await loadBooks();
    } catch (err: any) {
      setError(err.message || 'Não foi possível excluir o livro');
    }
  };

  const getCategoryName = (book: Book) => {
    const direct = (book as any).Category?.name || (book as any).category?.name;
    if (direct) return direct;
    const catId = (book as any).categoryId;
    return categories.find((c) => c.id === catId)?.name || '-';
  };

  const getAuthorsNames = (book: Book) => {
    const list = (book as any).Authors || (book as any).authors || [];
    if (!Array.isArray(list) || list.length === 0) return '-';
    return list.map((a: any) => a.name).join(', ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Livros</h1>
        <p className="text-sm text-slate-500">
          Gerenciamento e consulta do acervo bibliográfico
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
            {editingId ? 'Editar Livro' : 'Novo Livro'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Título
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Fundação"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ISBN
              </label>
              <input
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Ex: 978-8576572008"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Categoria
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ano de Publicação
              </label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Ex: 1951"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Qtd. Total
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={totalCopies}
                  onChange={(e) => {
                    setTotalCopies(e.target.value);
                    if (!editingId) setAvailableCopies(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Disponíveis
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={availableCopies}
                  onChange={(e) => setAvailableCopies(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve sinopse ou edição do livro"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Autores (selecione um ou mais)
              </label>
              {authors.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Nenhum autor cadastrado. Cadastre autores antes de criar um livro.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                 {authors.map((author) => {
                    const aId = getAuthorId(author);
                    const selected = authorIds.includes(aId);
                    return (
                      <button
                        key={aId}
                        type="button"
                        onClick={() => toggleAuthor(aId)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          selected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {selected ? `✓ ${author.name}` : author.name}
                      </button>
                    );
                  })}
                </div>
              )}
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
                ? 'Atualizar Livro'
                : 'Cadastrar Livro'}
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

      {/* Barra de Filtros */}
      <form
        onSubmit={handleFilter}
        className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Buscar por título
          </label>
          <input
            type="text"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
            placeholder="Digite o título..."
            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Categoria
          </label>
          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white"
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Autor
          </label>
          <select
            value={filterAuthorId}
            onChange={(e) => setFilterAuthorId(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-800 bg-white"
          >
            <option value="">Todos</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center h-9">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.checked)}
              className="rounded border-slate-300 text-blue-600"
            />
            Apenas disponíveis
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg cursor-pointer"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3 py-1.5 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Limpar
          </button>
        </div>
      </form>

      {/* Tabela de Livros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-600 text-sm">Carregando livros...</p>
        ) : books.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">
            Nenhum livro encontrado.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Título / ISBN</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Autor(es)</th>
                <th className="py-3 px-4">Ano</th>
                <th className="py-3 px-4">Exemplares</th>
                {user?.isAdmin && <th className="py-3 px-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{book.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">
                      {book.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      ISBN: {book.isbn}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {getCategoryName(book)}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {getAuthorsNames(book)}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{book.year}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        book.availableCopies > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {book.availableCopies} / {book.totalCopies}
                    </span>
                  </td>
                  {user?.isAdmin && (
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
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