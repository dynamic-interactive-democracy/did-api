CREATE TABLE IF NOT EXISTS roles
(
    id text,
    data json NOT NULL,
    created_at timestamp without time zone DEFAULT NOW(),
    PRIMARY KEY (id)
);
