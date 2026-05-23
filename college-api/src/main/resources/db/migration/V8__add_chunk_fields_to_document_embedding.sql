ALTER TABLE document_embedding
    ADD COLUMN chunk_text  TEXT NOT NULL DEFAULT '',
    ADD COLUMN chunk_index INT  NOT NULL DEFAULT 0;

ALTER TABLE document_embedding
    ALTER COLUMN chunk_text  DROP DEFAULT,
    ALTER COLUMN chunk_index DROP DEFAULT;
