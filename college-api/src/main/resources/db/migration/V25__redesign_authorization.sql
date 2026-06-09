-- Add professor role
INSERT INTO roles (name) VALUES ('professor') ON CONFLICT (name) DO NOTHING;

-- Drop old permission infrastructure (cascade removes related join rows)
DROP TABLE IF EXISTS ui_permission_objects CASCADE;
DROP TABLE IF EXISTS ui_item CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permission_objects CASCADE;

-- Route authorization table: rules loaded at startup by Spring Security.
-- Add new API route access via INSERT migration — no Java changes needed.
-- allowed_roles: comma-separated role names | 'PUBLIC' (no auth) | 'AUTHENTICATED' (any logged-in user)
-- priority: evaluated highest-first; first matching rule wins (Spring Security order).
CREATE TABLE route_access_rules (
    id            SERIAL PRIMARY KEY,
    path_pattern  VARCHAR(200) NOT NULL,
    http_method   VARCHAR(10),
    allowed_roles VARCHAR(200) NOT NULL,
    priority      INT NOT NULL DEFAULT 100
);

INSERT INTO route_access_rules (path_pattern, http_method, allowed_roles, priority) VALUES
-- CORS preflight
('/api/**',                   'OPTIONS', 'PUBLIC',                 2000),
-- Public auth endpoints
('/api/auth/login',           'POST',    'PUBLIC',                 1000),
('/api/auth/logout',          'POST',    'PUBLIC',                 1000),
('/api/auth/set-password',    'POST',    'PUBLIC',                 1000),
('/api/auth/forgot-password', 'POST',    'PUBLIC',                 1000),
-- Public content
('/api/notices',              'GET',     'PUBLIC',                  900),
('/api/notices/**',           'GET',     'PUBLIC',                  900),
('/api/notice-categories',    'GET',     'PUBLIC',                  900),
('/api/notice-categories/**', 'GET',     'PUBLIC',                  900),
('/api/stats',                'GET',     'PUBLIC',                  900),
('/api/documents/public',     'GET',     'PUBLIC',                  900),
('/api/documents/public/**',  'GET',     'PUBLIC',                  900),
-- Swagger (admin only)
('/swagger-ui/**',            NULL,      'admin',                   800),
('/swagger-ui.html',          NULL,      'admin',                   800),
('/api-docs/**',              NULL,      'admin',                   800),
('/v3/api-docs/**',           NULL,      'admin',                   800),
-- User writes (admin only)
('/api/users',                'POST',    'admin',                   700),
('/api/users/**',             'PUT',     'admin',                   700),
('/api/users/**',             'DELETE',  'admin',                   700),
-- User reads (admin + professor)
('/api/users',                'GET',     'admin,professor',         600),
('/api/users/**',             'GET',     'admin,professor',         600),
-- Current-user info and roles list (all authenticated roles)
('/api/auth/me',              NULL,      'admin,professor,aluno',   550),
('/api/roles',                'GET',     'admin,professor,aluno',   540),
-- Everything else: admin and professor only
('/**',                       NULL,      'admin,professor',         500);
