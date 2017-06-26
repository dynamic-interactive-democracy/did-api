CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS circles
(
    data json NOT NULL,
    id uuid DEFAULT gen_random_uuid(),
    created_at timestamp without time zone DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS circle_data_name_idx ON circles((data->>'name'));
