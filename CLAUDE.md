# Project Context

## Database Schema Documentation

The authoritative database schema is documented in `college-api/DATABASE.md`.

**Rule: any change that affects the database schema must update `college-api/DATABASE.md` in the same commit/PR.**

This includes:
- Adding, renaming, or dropping a Flyway migration file (`college-api/src/main/resources/db/migration/`)
- Adding, modifying, or removing a column, table, constraint, or index in a `.sql` migration
- Adding or removing a JPA entity (`@Entity`) class
- Adding, removing, or renaming a field mapped to a column (`@Column`, `@JoinColumn`, `@ManyToOne`, etc.)
- Changing a column's type, length, nullability, uniqueness, or default value

`DATABASE.md` must stay in sync with the running schema at all times. It is used as context by Claude Code and by developers onboarding to the project.
