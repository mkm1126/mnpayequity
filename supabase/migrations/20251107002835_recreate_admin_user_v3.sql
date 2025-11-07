/*
  # Recreate Admin User with Proper Auth Setup

  ## Overview
  Removes and recreates the admin user using Supabase's recommended approach
  to ensure authentication works correctly.
  
  ## Changes
  1. Delete existing admin user and profile
  2. Recreate admin user with minimal required fields
  3. Ensure password is properly hashed
  
  ## Security Notes
  - Password properly hashed with bcrypt
  - Email confirmation bypassed for admin
*/

-- Delete existing admin user if exists
DELETE FROM user_profiles WHERE email = 'admin@admin.com';
DELETE FROM auth.users WHERE email = 'admin@admin.com';

-- Recreate admin user
DO $$
DECLARE
  admin_user_id uuid := gen_random_uuid();
  encrypted_pw text;
BEGIN
  -- Generate encrypted password
  encrypted_pw := crypt('Admin123', gen_salt('bf'));
  
  -- Insert into auth.users with minimal required fields
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
  ) VALUES (
    admin_user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@admin.com',
    encrypted_pw,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    'authenticated',
    'authenticated'
  );
  
  -- Create user profile
  INSERT INTO user_profiles (
    user_id,
    email,
    jurisdiction_id,
    is_admin,
    role,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin@admin.com',
    null,
    true,
    'Admin',
    now(),
    now()
  );
  
  RAISE NOTICE 'Successfully created admin user with id: %', admin_user_id;
END $$;