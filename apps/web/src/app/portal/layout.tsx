// apps/web/src/app/portal/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Metro Events — Client Portal',
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-900">Metro Events</span>
          <span className="ml-2 text-xs text-amber-600 font-medium">Client Portal</span>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
