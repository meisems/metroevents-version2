'use client';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import Link from 'next/link';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard', '/clients': 'Clients', '/events': 'Events',
  '/inventory': 'Inventory', '/suppliers': 'Suppliers', '/meetings': 'Meetings',
  '/checklist': 'Checklist', '/tasks': 'Tasks', '/moodboard': 'Moodboard',
  '/reminders': 'Reminders', '/reports': 'Reports', '/users': 'Team Management', '/admin': 'Admin Panel',
};

export default function TopBar() {
  const pathname = usePathname();
  const base = '/' + pathname.split('/')[1];
  const title = TITLES[base] ?? 'Metro Events';
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-[#0F3460]/40 bg-[#0D1117]/80 backdrop-blur sticky top-0 z-30">
      <h1 className="font-bold text-white text-base">{title}</h1>
      <div className="flex items-center gap-2">
        <Link href="/reminders" className="p-2 rounded-lg hover:bg-[#16213E] text-gray-400 hover:text-brand-gold transition">
          <Bell className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
