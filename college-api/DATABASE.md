# Database Schema

> **IMPORTANT:** This document is the authoritative reference for the database schema.
> Any change to a Flyway migration or JPA entity **must** be reflected here before the PR is merged.
> The CI Checkstyle step serves as a reminder, but keeping this file accurate is a developer responsibility.

**Database:** PostgreSQL  
**Extensions:** `pgvector` (vector similarity search)  
**Migrations:** Flyway (located at `src/main/resources/db/migration/`)  
**Current migration version:** V27

---

## Entity-Relationship Overview

```
roles ──< users ──< notices >── notice_category
                 │            └──< event_presences >── users
                 │            └──< notice_subscriptions >── users (via category)
                 └──< documents ──< document_embedding
                 │            └──< document_recipients >── users (recipient)
                 └──< password_reset_tokens

notice_category ──< notice_subscriptions >── users

route_access_rules  (standalone — loaded at startup by Spring Security)
```

---

## Tables

### `roles`

Defines the application roles assigned to users.

| Column | Type         | Constraints              |
|--------|--------------|--------------------------|
| id     | SERIAL       | PK                       |
| name   | VARCHAR(20)  | UNIQUE, NOT NULL         |

**Seeded values:** `admin`, `professor`, `aluno`

---

### `users`

Application accounts. Each user has exactly one role.

| Column         | Type         | Constraints                        |
|----------------|--------------|------------------------------------|
| id             | SERIAL       | PK                                 |
| username       | VARCHAR(20)  | UNIQUE, NOT NULL                   |
| password_hash  | VARCHAR(60)  | nullable (set on first login)      |
| email          | VARCHAR(254) | UNIQUE, NOT NULL                   |
| phone_number   | VARCHAR(20)  | UNIQUE, nullable                   |
| role_id        | INT          | NOT NULL, FK → roles(id)           |
| ra             | VARCHAR(10)  | UNIQUE, nullable                   |
| token_version  | INT          | NOT NULL, DEFAULT 1                |
| first_login_at | TIMESTAMPTZ  | nullable                           |

**Notes:**
- `token_version` is incremented on password change or explicit logout to invalidate existing JWTs.
- `ra` (Registro Acadêmico) is the student registration number; only populated for student accounts.
- `first_login_at` is set on the first successful `POST /api/auth/login` and never overwritten; used for "days on platform" calculation.

**Foreign keys:** `role_id → roles(id)`

---

### `password_reset_tokens`

One-time tokens for the forgot-password flow.

| Column     | Type         | Constraints                  |
|------------|--------------|------------------------------|
| id         | SERIAL       | PK                           |
| user_id    | INT          | NOT NULL, FK → users(id)     |
| token      | VARCHAR(64)  | UNIQUE, NOT NULL             |
| expires_at | TIMESTAMPTZ  | NOT NULL                     |
| used_at    | TIMESTAMPTZ  | nullable                     |

**Notes:**
- `used_at` is null while the token is still valid; set to the redemption timestamp on use.

**Foreign keys:** `user_id → users(id)`

---

### `notice_category`

Lookup table for notice categories.

| Column | Type        | Constraints      |
|--------|-------------|------------------|
| id     | SERIAL      | PK               |
| name   | VARCHAR(20) | UNIQUE, NOT NULL |

---

### `notices`

Content items (articles / announcements) posted by users.

| Column           | Type         | Constraints                         |
|------------------|--------------|-------------------------------------|
| id               | SERIAL       | PK                                  |
| user_id          | INT          | NOT NULL, FK → users(id)            |
| title            | VARCHAR(200) | NOT NULL                            |
| markdown_content | TEXT         | NOT NULL                            |
| cover_img_url    | TEXT         | nullable                            |
| category_id      | INT          | NOT NULL, FK → notice_category(id)  |
| created_at       | TIMESTAMPTZ  | NOT NULL                            |
| updated_at       | TIMESTAMPTZ  | NOT NULL                            |
| deleted_at       | TIMESTAMPTZ  | nullable (soft delete)              |

**Notes:**
- Soft-deleted rows have `deleted_at` set; queries must filter `WHERE deleted_at IS NULL`.

**Foreign keys:** `user_id → users(id)`, `category_id → notice_category(id)`

---

### `documents`

Files uploaded by users, stored in a local volume (previously S3).

| Column        | Type         | Constraints              |
|---------------|--------------|--------------------------|
| id            | SERIAL       | PK                       |
| user_id       | INT          | NOT NULL, FK → users(id) |
| file_name     | VARCHAR(100) | UNIQUE, NOT NULL         |
| description   | TEXT         | nullable                 |
| file_size     | INT          | NOT NULL (bytes)         |
| bucket_url    | VARCHAR(255) | UNIQUE, NOT NULL         |
| knowledge_base| BOOLEAN      | NOT NULL, DEFAULT false  |
| is_public     | BOOLEAN      | NOT NULL, DEFAULT false  |

**Notes:**
- `knowledge_base` marks documents that are included in the AI assistant's retrieval context.
- `is_public` controls whether unauthenticated users can download the file.
- `bucket_url` is a path relative to the local storage volume (not an AWS S3 URL).

**Foreign keys:** `user_id → users(id)`

---

### `document_embedding`

Vector embeddings for document chunks, used by the AI assistant for similarity search.

| Column      | Type        | Constraints                      |
|-------------|-------------|----------------------------------|
| id          | SERIAL      | PK                               |
| document_id | INT         | NOT NULL, FK → documents(id)     |
| chunk_text  | TEXT        | NOT NULL                         |
| chunk_index | INT         | NOT NULL                         |
| embedding   | vector(768) | NOT NULL (pgvector)              |

**Notes:**
- Each document is split into chunks; `chunk_index` is 0-based order within the document.
- `embedding` uses the pgvector extension; dimension is 768 (model-dependent).
- Requires `CREATE EXTENSION IF NOT EXISTS vector` (applied in V1 migration).

**Foreign keys:** `document_id → documents(id)`

---

### `route_access_rules`

Dynamic Spring Security authorization rules loaded at application startup. Adding a new rule requires only an INSERT migration — no Java code changes.

| Column        | Type         | Constraints              |
|---------------|--------------|--------------------------|
| id            | SERIAL       | PK                       |
| path_pattern  | VARCHAR(200) | NOT NULL                 |
| http_method   | VARCHAR(10)  | nullable (matches all)   |
| allowed_roles | VARCHAR(200) | NOT NULL                 |
| priority      | INT          | NOT NULL, DEFAULT 100    |

**Notes:**
- `allowed_roles` accepted values: comma-separated role names (e.g. `admin,professor`), `PUBLIC` (no auth required), or `AUTHENTICATED` (any logged-in user).
- Rules are evaluated highest-priority-first; the first matching rule wins.
- `http_method` NULL matches any HTTP method.

---

### `document_recipients`

Pivot table linking a document to its designated student recipient. A document can have at most one recipient.

| Column       | Type | Constraints                                     |
|--------------|------|-------------------------------------------------|
| id           | SERIAL | PK                                            |
| document_id  | INT  | NOT NULL, UNIQUE, FK → documents(id) ON DELETE CASCADE |
| recipient_id | INT  | NOT NULL, FK → users(id)                       |

**Notes:**
- `UNIQUE(document_id)` — enforces one recipient per document.
- `ON DELETE CASCADE` — deleting a document automatically removes the recipient record.
- Only `aluno` users may be set as recipients (enforced at the application layer).
- Documents with a recipient have `knowledge_base = false` enforced automatically.

**Foreign keys:** `document_id → documents(id)`, `recipient_id → users(id)`

---

### `notice_subscriptions`

Stores which notice categories an aluno has subscribed to for future notifications.

| Column      | Type | Constraints                                      |
|-------------|------|--------------------------------------------------|
| id          | SERIAL | PK                                             |
| user_id     | INT  | NOT NULL, FK → users(id) ON DELETE CASCADE      |
| category_id | INT  | NOT NULL, FK → notice_category(id) ON DELETE CASCADE |

**Constraints:** `UNIQUE(user_id, category_id)` — one row per user-category pair.

**Foreign keys:** `user_id → users(id)`, `category_id → notice_category(id)`

---

### `event_presences`

Records which "evento"-category notices an aluno has marked attendance for.

| Column    | Type        | Constraints                              |
|-----------|-------------|------------------------------------------|
| id        | SERIAL      | PK                                       |
| user_id   | INT         | NOT NULL, FK → users(id) ON DELETE CASCADE |
| notice_id | INT         | NOT NULL, FK → notices(id) ON DELETE CASCADE |
| marked_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                  |

**Constraints:** `UNIQUE(user_id, notice_id)` — an aluno can only mark presence once per event.

**Notes:**
- Only notices of category `evento` should be referenced here (enforced at the application layer).

**Foreign keys:** `user_id → users(id)`, `notice_id → notices(id)`

---

## Dropped Tables (historical)

The following tables existed before V25 and were dropped by `V25__redesign_authorization.sql`:

| Table                  | Replaced by             |
|------------------------|-------------------------|
| `permission_objects`   | `route_access_rules`    |
| `ui_item`              | `route_access_rules`    |
| `ui_permission_objects`| `route_access_rules`    |
| `role_permissions`     | `route_access_rules`    |

---

## Migration History Summary

| Version | File                                        | Summary                                              |
|---------|---------------------------------------------|------------------------------------------------------|
| V1      | `V1__create_college_tables.sql`             | Base tables, pgvector extension                      |
| V2      | `V2__add_password_hash_to_users.sql`        | `users.password_hash`                                |
| V3      | `V3__add_email_and_phone_to_users.sql`      | `users.email`, `users.phone_number`                  |
| V4–V5   | Seed migrations                             | Initial roles and admin user                         |
| V6      | `V6__add_title_to_posts.sql`                | `notices.title` (table was still `posts` at this point) |
| V7      | `V7__add_knowledge_base_to_documents.sql`   | `documents.knowledge_base`                           |
| V8      | `V8__add_chunk_fields_to_document_embedding.sql` | `document_embedding.chunk_text`, `.chunk_index` |
| V13     | `V13__create_post_category.sql`             | `notice_category` (created as `post_category`)       |
| V14     | `V14__add_category_and_cover_to_posts.sql`  | `notices.cover_img_url`, `notices.category_id`       |
| V15     | `V15__rename_post_tables_to_notice.sql`     | Renamed `posts` → `notices`, `post_category` → `notice_category` |
| V20     | `V20__create_password_reset_tokens.sql`     | `password_reset_tokens` table                        |
| V22     | `V22__add_token_version_to_users.sql`       | `users.token_version`                                |
| V24     | `V24__add_is_public_to_documents.sql`       | `documents.is_public`                                |
| V25     | `V25__redesign_authorization.sql`           | Drops old permission tables; creates `route_access_rules`; adds `professor` role |
| V26     | `V26__add_document_recipients.sql`          | `document_recipients` table; new route access rules for `/mine`, download, students |
| V27     | `V27__aluno_portal.sql`                     | `users.first_login_at`; `notice_subscriptions`; `event_presences`; seeds `geral` category; aluno route access rules |
