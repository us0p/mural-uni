-- Force the admin password hash to match APP_ADMIN_PASSWORD=admin.
-- BCrypt(12) of "admin" — generated with BCryptPasswordEncoder(12).
-- Bootstrap will recreate the user if they don't exist; this migration
-- handles the case where a stale hash from a previous volume is present.
UPDATE users
SET password_hash = '$2a$12$q8JkUh4WL73hb.3bF7L3huwC6KNMyQl0ixb5O2SRG5etBeBzLL7SO'
WHERE username = 'llopes';
