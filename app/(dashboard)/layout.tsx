'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authActions } from '@/actions/auth.actions';
import { User } from '@/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const stored = authActions.getStoredUser();
    if (!stored) {
      router.replace('/login');
      return;
    }
    setUser(stored);
    setReady(true);
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await authActions.logout();
  };

  if (!ready) return null;

  const navItems = [
    { label: 'Dashboard', href: '/', adminOnly: false },
    { label: 'Empréstimos', href: '/loans', adminOnly: false },
    { label: 'Livros', href: '/books', adminOnly: false },
    { label: 'Leitores', href: '/readers', adminOnly: false },
    { label: 'Categorias', href: '/categories', adminOnly: false },
    { label: 'Autores', href: '/authors', adminOnly: false },
    { label: 'Atendentes', href: '/users', adminOnly: true },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || user?.isAdmin
  );

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold tracking-wide">Biblioteca UNIPAR</h2>
          <span className="text-xs text-slate-400">Gestão de Acervo</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              Olá, <strong className="text-slate-900">{user?.name}</strong>
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                user?.isAdmin
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {user?.isAdmin ? 'Administrador' : 'Atendente'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            {loggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}