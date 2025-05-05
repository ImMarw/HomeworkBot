create table homework
(
    id          INTEGER
        primary key autoincrement,
    user_id     TEXT                           not null,
    subject     TEXT                           not null,
    topic       TEXT                           not null,
    description TEXT                           not null,
    due_date    TEXT,
    created_at  TEXT default current_timestamp not null,
    message_id  TEXT
);

create table test
(
    id          INTEGER
        primary key autoincrement,
    user_id     TEXT                           not null,
    subject     TEXT                           not null,
    topic       TEXT                           not null,
    description TEXT                           not null,
    due_date    TEXT,
    created_at  TEXT default current_timestamp not null,
    message_id  TEXT
);

