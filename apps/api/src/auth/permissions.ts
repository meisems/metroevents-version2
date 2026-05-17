// apps/api/src/auth/permissions.ts

export const PERMISSIONS: Record<string, string[]> = {
  admin: ['*'],
  coordinator: [
    'view_event',
    'edit_timeline',
    'manage_tasks',
    'edit_checklist',
    'view_quote',
    'manage_meetings',
    'view_clients',
    'manage_clients',
    'manage_payments',
    'view_inventory',
    'manage_suppliers',
    'manage_event_logs',
  ],
  designer: [
    'view_event',
    'edit_moodboard',
    'view_inventory',
    'view_checklist',
    'view_quote',
  ],
  warehouse: [
    'view_event',
    'edit_inventory',
    'view_checklist',
    'manage_reservations',
  ],
  client: [
    'view_proposal',
    'approve_design',
    'view_payment',
    'upload_pegs',
    'submit_feedback',
  ],
};

export function can(role: string, action: string): boolean {
  const allowed = PERMISSIONS[role] ?? [];
  return allowed.includes('*') || allowed.includes(action);
}
