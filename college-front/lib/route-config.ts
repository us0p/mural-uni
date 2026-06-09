/**
 * Frontend route-to-role mapping.
 * This mirrors the backend's route_access_rules DB table for client-side redirects.
 *
 * To add a new protected admin/professor page:
 *   1. Create the Next.js page file under app/admin/
 *   2. Add one entry here
 *
 * To add a new aluno-only page:
 *   Create the file under app/aluno/ — app/aluno/layout.tsx already guards all /aluno/** routes.
 */
export const PROTECTED_ROUTES: Array<{ pattern: RegExp; allowedRoles: string[] }> = [
  { pattern: /^\/admin(\/.*)?$/, allowedRoles: ['admin', 'professor'] },
  { pattern: /^\/aluno(\/.*)?$/, allowedRoles: ['aluno'] },
]
