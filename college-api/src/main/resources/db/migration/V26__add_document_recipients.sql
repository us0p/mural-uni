CREATE TABLE document_recipients (
    id           SERIAL PRIMARY KEY,
    document_id  INT NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
    recipient_id INT NOT NULL REFERENCES users(id)
);

INSERT INTO route_access_rules (path_pattern, http_method, allowed_roles, priority) VALUES
('/api/documents/mine',       'GET',  'admin,professor,aluno', 910),
('/api/documents/*/download', NULL,   'admin,professor,aluno', 895),
('/api/users/students',       'GET',  'admin,professor',       610);
