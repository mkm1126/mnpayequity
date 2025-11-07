/*
  # Create Admin User with Proper Supabase Auth

  ## Overview
  Creates admin user with all required auth fields for Supabase Auth (GoTrue) compatibility.
  
  ## Changes
  1. Create admin user in auth.users with all required fields
  2. Create corresponding identity record
  3. Create user_profile record
  
  ## Security Notes
  - Password properly hashed with bcrypt
  - Email confirmation bypassed for admin
  - All auth fields properly initialized
*/

DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
  v_encrypted_pw text;
BEGIN
  -- Generate properly encrypted password
  v_encrypted_pw := crypt('Admin123', gen_salt('bf'));
  
  -- Insert admin user with all required fields
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'admin@admin.com',
    v_encrypted_pw,
    now(),
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
  
  -- Create identity for the user
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', 'admin@admin.com',
      'email_verified', true
    ),
    'email',
    v_user_id::text,
    null,
    now(),
    now()
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
    v_user_id,
    'admin@admin.com',
    null,
    true,
    'Admin',
    now(),
    now()
  );
  
  RAISE NOTICE 'Admin user created successfully with ID: %', v_user_id;
END $$;