import type { LucideIcon } from 'lucide-react';
export function EmptyState({ icon: Icon, title, sub }: { icon: LucideIcon; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="w-12 h-12 text-gray-700 mb-4" />
      <p className="text-gray-400 font-medium">{title}</p>
      {sub && <p className="text-gray-600 text-sm mt-1">{sub}</p>}
    </div>
  );
}
