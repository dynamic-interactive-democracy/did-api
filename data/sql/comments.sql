CREATE TABLE IF NOT EXISTS comments
(
    id uuid DEFAULT gen_random_uuid() NOT NULL, -- id of the specific comment
    subject text NOT NULL, -- subject, eg. the id of the topic that has been commented
    domain text NOT NULL, -- domain, eg. that the target is in the topic domain
    bucket text NOT NULL, -- an identifier that allows us to bundle different comments together
    data json NOT NULL,
    created_at timestamp without time zone DEFAULT NOW(),
    PRIMARY KEY (id)
)
