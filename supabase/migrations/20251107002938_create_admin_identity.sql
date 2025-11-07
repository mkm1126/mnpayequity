/*
  # Create Identity Record for Admin User

  ## Overview
  Creates the missing identity record required for Supabase authentication.
  
  ## Changes
  1. Create identity record for admin user
  2. Link to email provider
  
  ## Security Notes
  - Identity provider set to 'email'
  - Links to existing admin user
*/

-- Create identity for admin user
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  id,
  jsonb_build_object(
    'sub', id::text,
    'email', email,
    'email_verified', true,
    'provider', 'email'
  ),
  'email',
  id::text,
  now(),
  now(),
  now()
FROM auth.users
WHERE email = 'admin@admin.com'
ON CONFLICT DO NOTHING;