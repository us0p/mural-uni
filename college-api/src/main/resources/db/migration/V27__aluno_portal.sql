ALTER TABLE users ADD COLUMN first_login_at TIMESTAMPTZ;

CREATE TABLE notice_subscriptions (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES notice_category(id) ON DELETE CASCADE,
    UNIQUE(user_id, category_id)
);

CREATE TABLE event_presences (
    id        SERIAL PRIMARY KEY,
    user_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notice_id INT NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, notice_id)
);

INSERT INTO notice_category (name) VALUES ('geral') ON CONFLICT (name) DO NOTHING;

INSERT INTO route_access_rules (path_pattern, http_method, allowed_roles, priority) VALUES
('/api/aluno/dashboard',       'GET',    'aluno', 930),
('/api/aluno/subscriptions',   'GET',    'aluno', 920),
('/api/aluno/subscriptions',   'PUT',    'aluno', 920),
('/api/aluno/presences',       'GET',    'aluno', 920),
('/api/aluno/presences/**',    'POST',   'aluno', 920),
('/api/aluno/presences/**',    'DELETE', 'aluno', 920);
