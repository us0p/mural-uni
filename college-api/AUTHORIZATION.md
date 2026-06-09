# Authorization Guide

## How it works (short version)

Three roles: **admin** (full access), **professor** (all writes except users), **aluno** (public content + `/aluno/*` only).

Each user's role is embedded in their JWT at login and re-validated on every request:

1. `JwtAuthFilter` extracts the JWT → validates signature + expiration + `tokenVersion` → sets `SimpleGrantedAuthority(role)` in the `SecurityContext`.
2. `SecurityConfig` loads rules from the `route_access_rules` DB table at startup (JDBC, `ORDER BY priority DESC`). First matching rule wins. `PUBLIC` → `permitAll()`, `AUTHENTICATED` → `authenticated()`, otherwise → `hasAnyAuthority(roles)`.
3. `@PreAuthorize` on controller methods adds a second layer of defense (defense-in-depth).
4. Next.js middleware decodes the JWT `role` claim and applies redirects from `college-front/lib/route-config.ts`.
5. Layout guards (`app/admin/layout.tsx`, `app/aluno/layout.tsx`) enforce role checks client-side.

Token invalidation: logout and password change call `incrementTokenVersion(userId)` → all existing JWTs become invalid on next request.

---

## Adding a new backend API route

Write a Flyway migration (next version number) inserting a row into `route_access_rules`:

```sql
-- accessible by admin and professor
INSERT INTO route_access_rules (path_pattern, http_method, allowed_roles, priority)
VALUES ('/api/my-resource/**', NULL, 'admin,professor', 500);

-- accessible by all authenticated users including aluno
INSERT INTO route_access_rules (path_pattern, http_method, allowed_roles, priority)
VALUES ('/api/my-student-resource/**', 'GET', 'admin,professor,aluno', 550);

-- admin-only write, professor read
INSERT INTO route_access_rules (path_pattern, http_method, allowed_roles, priority)
VALUES ('/api/my-resource', 'POST', 'admin', 700);
INSERT INTO route_access_rules (path_pattern, http_method, allowed_roles, priority)
VALUES ('/api/my-resource', 'GET', 'admin,professor', 600);

-- public (no auth)
INSERT INTO route_access_rules (path_pattern, http_method, allowed_roles, priority)
VALUES ('/api/my-resource', 'GET', 'PUBLIC', 900);
```

**Priority guidelines:**

| Range | Purpose |
|---|---|
| 2000 | OPTIONS preflight (always PUBLIC) |
| 1000 | Auth endpoints (login, logout, password reset) |
| 900 | Public content reads |
| 800 | Swagger/OpenAPI (admin only) |
| 700 | Admin-only writes |
| 600 | Admin+professor reads |
| 550 | All roles (e.g. `/api/auth/me`) |
| 500 | Catch-all admin+professor |

Also add `@PreAuthorize("hasAnyAuthority('admin','professor')")` on the controller method for defense-in-depth. No other Java changes needed — restart the application to pick up the new rule.

---

## Adding a new admin/professor frontend page

1. Create the page file: `college-front/app/admin/my-page/page.tsx`
2. Add one entry to `college-front/lib/route-config.ts`:
   ```typescript
   { pattern: /^\/admin\/my-page(\/.*)?$/, allowedRoles: ['admin', 'professor'] }
   ```
3. Optionally add a sidebar link in `components/layout/admin-sidebar.tsx`.

`app/admin/layout.tsx` already enforces `isAdmin || isProfessor` for the entire `/admin/*` tree.

---

## Adding a new aluno-only frontend page

1. Create the page file under: `college-front/app/aluno/my-page/page.tsx`
2. No route-config entry needed — `app/aluno/layout.tsx` enforces `isAluno` for all `/aluno/**` pages automatically.

---

## Role reference

| Role | `allowed_roles` value | Spring authority | Notes |
|---|---|---|---|
| Admin | `admin` | `admin` | Full access |
| Professor | `professor` | `professor` | No user writes (POST/PUT/DELETE `/api/users`) |
| Aluno | `aluno` | `aluno` | Public content + `/aluno/*` only |
| Any logged-in user | `admin,professor,aluno` | — | All three roles |
| No auth required | `PUBLIC` | — | `permitAll()` |
