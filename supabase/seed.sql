-- Seed: Create default admin user in Supabase Auth + admin_users whitelist
-- This uses Supabase's built-in auth.users table via the auth schema

-- Insert the admin user into auth.users with email/password
-- Password is hashed by Supabase — we use a plaintext trigger via the admin API
-- Instead, we seed the admin_users whitelist here, 
-- and the actual Supabase auth user is created via supabase CLI or Studio UI.

-- Whitelisted admin email (must match the Supabase auth user email)
INSERT INTO public.admin_users (email)
VALUES ('admin@theshuttle.local')
ON CONFLICT (email) DO NOTHING;
