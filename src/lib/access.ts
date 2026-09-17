export type UserRole =
  'super_admin' | 'ceo' | 'manager' | 'department_head' | 'officer' | 'employee' | 'auditor';

export const ALL_ROLES: UserRole[] = [
  'super_admin',
  'ceo',
  'manager',
  'department_head',
  'officer',
  'employee',
  'auditor',
];

/** Roles that can administer the organisation. Mirrors `public.is_management()`. */
export const MANAGEMENT_ROLES: UserRole[] = ['super_admin', 'ceo', 'manager'];

/** Roles that can read audit/compliance surfaces. Mirrors `public.is_auditor()`. */
export const AUDIT_ROLES: UserRole[] = [...MANAGEMENT_ROLES, 'auditor'];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  ceo: 'CEO / GM',
  manager: 'Manager',
  department_head: 'Department Head',
  officer: 'Officer',
  employee: 'Employee',
  auditor: 'Auditor',
};

export function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) return null;
  return (ALL_ROLES as string[]).includes(role) ? (role as UserRole) : null;
}

export function hasRole(role: string | null | undefined, allowed: UserRole[]): boolean {
  const normalized = normalizeRole(role);
  return normalized !== null && allowed.includes(normalized);
}

export const isManagement = (role?: string | null) => hasRole(role, MANAGEMENT_ROLES);
export const isSuperAdmin = (role?: string | null) => normalizeRole(role) === 'super_admin';
export const isAuditor = (role?: string | null) => normalizeRole(role) === 'auditor';

/**
 * Server-side route gate. Keys are path prefixes; the longest matching prefix
 * wins. Routes not listed are available to every authenticated user.
 */
export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  '/roles': MANAGEMENT_ROLES,
  '/user-admin': MANAGEMENT_ROLES,
  '/admin': MANAGEMENT_ROLES,
  '/users': MANAGEMENT_ROLES,
  '/cooperative-settings': MANAGEMENT_ROLES,
  '/automation': MANAGEMENT_ROLES,
  '/executive-reports': MANAGEMENT_ROLES,
  '/compliance': AUDIT_ROLES,
  '/activity-log': AUDIT_ROLES,
};

export function accessRequiredFor(pathname: string): UserRole[] | null {
  let match: { prefix: string; roles: UserRole[] } | null = null;

  for (const [prefix, roles] of Object.entries(ROUTE_ACCESS)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      if (!match || prefix.length > match.prefix.length) match = { prefix, roles };
    }
  }

  return match?.roles ?? null;
}

export function canAccessRoute(pathname: string, role: string | null | undefined): boolean {
  const required = accessRequiredFor(pathname);
  if (!required) return true;
  return hasRole(role, required);
}
