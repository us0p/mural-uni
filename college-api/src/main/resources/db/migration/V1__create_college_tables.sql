-- Enable pgvector extension (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- permission_objects: defines named permission objects (e.g. "posts", "documents")
CREATE TABLE IF NOT EXISTS permission_objects (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- roles: named roles assigned to users (e.g. "admin", "student")
CREATE TABLE IF NOT EXISTS roles (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- role_permissions: many-to-many between roles and permission_objects
CREATE TABLE IF NOT EXISTS role_permissions (
    id            SERIAL PRIMARY KEY,
    role_id       INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permission_objects(id) ON DELETE CASCADE,
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

-- users: college users; username is the business key, id is the surrogate key
-- Note: DATABASE.md uses username as PK but posts/documents reference users(id).
-- Resolution: id is the surrogate PK; username is a unique business key.
CREATE TABLE IF NOT EXISTS users (
    id       SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    role_id  INT NOT NULL REFERENCES roles(id),
    ra       VARCHAR(10) UNIQUE
);

-- posts: user-authored markdown posts with soft-delete support
CREATE TABLE IF NOT EXISTS posts (
    id               SERIAL PRIMARY KEY,
    user_id          INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    markdown_content TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);

-- documents: file metadata stored with a reference to an external bucket
CREATE TABLE IF NOT EXISTS documents (
    id          SERIAL PRIMARY KEY,
    user_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name   VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    file_size   INT          NOT NULL,
    bucket_url  VARCHAR(255) UNIQUE NOT NULL
);

-- document_embedding: pgvector embeddings linked to documents
CREATE TABLE IF NOT EXISTS document_embedding (
    id          SERIAL PRIMARY KEY,
    document_id INT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    embedding   vector(768) NOT NULL
);
