CREATE TABLE IF NOT EXISTS users
(
    token text NOT NULL,
    data json NOT NULL,
    created_at timestamp without time zone DEFAULT NOW(),
    PRIMARY KEY (token)
)
