create or replace function ping() returns boolean
language sql
as $$
  select true;
$$;
