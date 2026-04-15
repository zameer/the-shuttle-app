-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for allowed Admin users
CREATE TABLE public.admin_users (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Player Table
CREATE TABLE public.players (
    phone_number VARCHAR(20) PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Booking Table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_phone_number VARCHAR(20) REFERENCES public.players(phone_number) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'PENDING', 'CONFIRMED', 'UNAVAILABLE')),
    hourly_rate NUMERIC,
    total_price NUMERIC,
    payment_status TEXT CHECK (payment_status IN ('PENDING', 'PAID')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Function to handle auto-updating `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Setup
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Admins can do everything policy function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
   RETURN EXISTS (
     SELECT 1 FROM public.admin_users 
     WHERE email = (SELECT auth.jwt() ->> 'email')
   );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Booking Policies
CREATE POLICY "Public Readonly Bookings"
ON public.bookings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admin All Access Bookings"
ON public.bookings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Player Policies
CREATE POLICY "Admin All Access Players"
ON public.players FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin Users Table policies
CREATE POLICY "Admin Readonly Allowed List"
ON public.admin_users FOR SELECT
TO authenticated
USING (true);
