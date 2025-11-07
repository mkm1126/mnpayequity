/*
  # Create Admin User Account

  ## Overview
  Creates the admin user account with credentials and profile.
  
  ## Changes
  1. Insert admin user into auth.users table
     - Email: admin@admin.com
     - Password: Admin123 (hashed)
     - Email confirmed by default
     - Role: authenticated
  
  2. Create corresponding user_profile record
     - Links to auth.users via user_id
     - Sets is_admin = true
     - Sets role = 'Admin'
     - No jurisdiction_id (admin has access to all)
  
  ## Security Notes
  - Password is properly hashed using crypt extension
  - Admin has no jurisdiction restrictions
  - Profile created with admin privileges
*/

-- Enable pgcrypto extension for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert admin user into auth.users only if not exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@admin.com';
  
  -- If user doesn't exist, create it
  IF admin_user_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    )
    VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@admin.com',
      crypt('Admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO admin_user_id;
    
    RAISE NOTICE 'Created admin user with id: %', admin_user_id;
  END IF;
  
  -- Create user profile for admin if not exists
  INSERT INTO user_profiles (
    user_id,
    email,
    jurisdiction_id,
    is_admin,
    role
  )
  VALUES (
    admin_user_id,
    'admin@admin.com',
    NULL,
    true,
    'Admin'
  )
  ON CONFLICT (user_id) DO UPDATE
  SET is_admin = true, role = 'Admin';
  
  RAISE NOTICE 'Created/updated admin user profile';
END $$;