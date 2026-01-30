-- Enable required extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Create a table to track sent notifications
create table if not exists sent_notifications (
    task_id uuid references tasks(id) on delete cascade,
    sent_at timestamp with time zone default now(),
    primary key (task_id)
);

-- RLS
alter table sent_notifications enable row level security;
