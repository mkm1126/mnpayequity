/*
  # Create Test User for Anoka County

  1. Creates a test user account for Anoka County
  2. Sets up user profile with jurisdiction access
  
  ## User Details
  - Email: anoka@test.com
  - Password: Test123!
  - Role: User
  - Jurisdiction: Anoka County (ID: 55555)
*/

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Create the auth user
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
    role,
    aud
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'anoka@test.com',
    crypt('Test123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO v_user_id;

  -- Create user profile linked to Anoka County
  INSERT INTO user_profiles (
    id,
    user_id,
    email,
    jurisdiction_id,
    is_admin,
    role,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    'anoka@test.com',
    '55555',
    false,
    'User',
    now(),
    now()
  );

  -- Create identity for the user with provider_id
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_user_id::text,
    jsonb_build_object('sub', v_user_id::text, 'email', 'anoka@test.com'),
    'email',
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'Created test user for Anoka County: anoka@test.com / Test123!';
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'User anoka@test.com already exists';
END $$;
