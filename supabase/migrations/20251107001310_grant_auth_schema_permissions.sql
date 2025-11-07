-- Grant necessary permissions on auth schema for authentication to work
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT SELECT ON auth.users TO anon, authenticated, service_role;
GRANT SELECT ON auth.sessions TO anon, authenticated, service_role;
GRANT SELECT ON auth.refresh_tokens TO anon, authenticated, service_role;

-- Grant access to auth functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon, authenticated, service_role;