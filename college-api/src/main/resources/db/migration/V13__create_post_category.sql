CREATE TABLE IF NOT EXISTS post_category (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

INSERT INTO post_category (name) VALUES ('geral');
