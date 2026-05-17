// apps/web/src/components/layout/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useIsAdmin, useIsCoordinator } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard', roles: ['admin', 'coordinator', 'designer', 'warehouse'] },
  { href: '/clients', icon: '👥', label: 'CRM', roles: ['admin', 'coordinator'] },
  { href: '/events', icon: '📅', label: 'Events', roles: ['admin', 'coordinator', 'designer', 'warehouse'] },
  { href: '/inventory', icon: '📦', label: 'Inventory', roles: ['admin', 'coordinator', 'warehouse'] },
  { href: '/suppliers', icon: '🤝', label: 'Suppliers', roles: ['admin', 'coordinator'] },
  { href: '/meetings', icon: '📋', label: 'Meetings', roles: ['admin', 'coordinator'] },
  { href: '/reminders', icon: '🔔', label: 'Reminders', roles: ['admin', 'coordinator'] },
  { href: '/reports', icon: '📊', label: 'Reports', roles: ['admin', 'coordinator'] },
  { href: '/admin/users', icon: '⚙️', label: 'Admin', roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visibleNav = NAV.filter((n) => user?.role && n.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <p className="font-bold text-lg">Metro Events</p>
        <p className="text-amber-400 text-xs uppercase tracking-widest">Management</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-slate-500 hover:text-red-400 transition-colors px-1"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
