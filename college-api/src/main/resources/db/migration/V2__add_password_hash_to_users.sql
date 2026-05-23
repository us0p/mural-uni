-- BCrypt hashes are always 60 characters; empty string is a sentinel for existing rows
-- that must be migrated out-of-band before the application goes live.
ALTER TABLE users ADD COLUMN password_hash VARCHAR(60) NOT NULL DEFAULT '';
ALTER TABLE users ALTER COLUMN password_hash DROP DEFAULT;
