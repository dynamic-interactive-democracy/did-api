CREATE TABLE IF NOT EXISTS users
(
    token text NOT NULL,
    data json NOT NULL,
    happened_at timestamp without time zone DEFAULT NOW(),
    PRIMARY KEY (token)
)
