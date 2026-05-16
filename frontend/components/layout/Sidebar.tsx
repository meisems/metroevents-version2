'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, CalendarDays, Package, Truck, Coffee,
  CheckSquare, ListTodo, Image, FileText, BarChart3, Bell,
  LogOut, Settings, Sparkles, ShieldCheck, ClipboardList,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/clients',     label: 'Clients',     icon: Users },
  { href: '/events',      label: 'Events',      icon: CalendarDays },
  { href: '/inventory',   label: 'Inventory',   icon: Package },
  { href: '/suppliers',   label: 'Suppliers',   icon: Truck },
  { href: '/meetings',    label: 'Meetings',    icon: Coffee },
  { href: '/checklist',   label: 'Checklist',   icon: CheckSquare },
  { href: '/tasks',       label: 'Tasks',       icon: ListTodo },
  { href: '/moodboard',   label: 'Moodboard',   icon: Image },
  { href: '/reminders',   label: 'Reminders',   icon: Bell },
  { href: '/reports',     label: 'Reports',     icon: BarChart3, adminOnly: true },
];

const BOTTOM_NAV = [
  { href: '/users',        label: 'Team',   icon: Settings, adminOnly: true },
  { href: '/admin',        label: 'Admin',  icon: ShieldCheck, adminOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const visibleNav = NAV.filter(n => !n.adminOnly || isAdmin);
  const visibleBottom = BOTTOM_NAV.filter(n => !n.adminOnly || isAdmin);

  return (
    <aside className="w-64 shrink-0 h-screen flex flex-col bg-[#0D1117] border-r border-[#0F3460]/40 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#0F3460]/40">
        <div className="w-9 h-9 rounded-xl bg-brand-gold flex items-center justify-center text-lg shrink-0"><Sparkles className="w-5 h-5 text-white" /></div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">Metro Events</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">ERM System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {visibleNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group',
              active ? 'bg-brand-gold/15 text-brand-gold font-semibold border border-brand-gold/20' : 'text-gray-400 hover:text-white hover:bg-[#16213E]')}>
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-brand-gold' : 'text-gray-500 group-hover:text-gray-300')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#0F3460]/40 p-3 space-y-0.5">
        {visibleBottom.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn('flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-[#16213E] transition group',
            pathname.startsWith(href) && 'bg-brand-gold/15 text-brand-gold')}>
            <Icon className="w-4 h-4 shrink-0" />{label}
          </Link>
        ))}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-[#0F3460]/30">
          <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-bold shrink-0">
            {user?.name?.[0] ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button onClick={logout} className="p-1 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>
    </aside>
  );
}
