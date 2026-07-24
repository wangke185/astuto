begin;

create type public.booking_approval_status as enum (
  'pending_approval',
  'approved',
  'denied',
  'countered',
  'expired'
);

create type public.booking_payment_status as enum (
  'held',
  'paid',
  'payment_failed'
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  floor_rate numeric(12, 2) not null check (floor_rate >= 0),
  listed_rate numeric(12, 2) not null check (listed_rate >= floor_rate),
  rate_unit text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.rate_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  rate numeric(12, 2) not null check (rate >= 0),
  effective_from timestamptz not null default now(),
  set_by text not null
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  cal_booking_id text not null unique,
  payment_status public.booking_payment_status not null default 'held',
  approval_status public.booking_approval_status,
  approval_expires_at timestamptz,
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint approval_expiry_required check (
    approval_status is distinct from 'pending_approval'
    or approval_expires_at is not null
  )
);

create table if not exists public.bookings_billed (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id),
  project_id uuid not null references public.projects(id),
  rate_snapshot numeric(12, 2) not null check (rate_snapshot >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  total_charged numeric(12, 2) not null check (total_charged >= 0),
  stripe_payment_intent_id text not null unique,
  cal_booking_id text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  booking_id uuid references public.bookings(id),
  processed_at timestamptz not null default now()
);

create index if not exists bookings_pending_approval_expiry_idx
  on public.bookings (approval_expires_at)
  where approval_status = 'pending_approval';

create or replace function public.mark_booking_paid(
  p_booking_id uuid,
  p_payment_intent_id text,
  p_stripe_event_id text,
  p_event_type text
) returns void
language plpgsql
security invoker
as $$
begin
  insert into public.stripe_webhook_events (
    stripe_event_id,
    event_type,
    booking_id
  ) values (
    p_stripe_event_id,
    p_event_type,
    p_booking_id
  );

  update public.bookings
  set payment_status = 'paid',
      stripe_payment_intent_id = p_payment_intent_id,
      updated_at = now()
  where id = p_booking_id;

  if not found then
    raise exception 'booking not found: %', p_booking_id;
  end if;
end;
$$;

create or replace function public.mark_booking_payment_failed(
  p_booking_id uuid,
  p_payment_intent_id text,
  p_stripe_event_id text,
  p_event_type text
) returns void
language plpgsql
security invoker
as $$
begin
  insert into public.stripe_webhook_events (
    stripe_event_id,
    event_type,
    booking_id
  ) values (
    p_stripe_event_id,
    p_event_type,
    p_booking_id
  );

  update public.bookings
  set payment_status = 'payment_failed',
      stripe_payment_intent_id = p_payment_intent_id,
      updated_at = now()
  where id = p_booking_id;

  if not found then
    raise exception 'booking not found: %', p_booking_id;
  end if;
end;
$$;

commit;
