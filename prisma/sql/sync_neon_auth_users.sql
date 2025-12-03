-- This script syncs users from neon_auth.users_sync to public.users
-- Run this in your Neon SQL Editor or via psql

-- 1. Create a function to sync user data
CREATE OR REPLACE FUNCTION public.sync_neon_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT or UPDATE in neon_auth.users_sync
  INSERT INTO public.users (id, stack_auth_id, email, display_name, avatar_url, created_at, updated_at)
  VALUES (
    gen_random_uuid()::text,
    NEW.id,
    NEW.email,
    NEW.name,
    NEW.profile_image_url,
    COALESCE(NEW.created_at, NOW()),
    NOW()
  )
  ON CONFLICT (stack_auth_id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a function to handle user deletion
CREATE OR REPLACE FUNCTION public.delete_synced_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE stack_auth_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create triggers on neon_auth.users_sync table
DROP TRIGGER IF EXISTS sync_user_on_insert_update ON neon_auth.users_sync;
CREATE TRIGGER sync_user_on_insert_update
  AFTER INSERT OR UPDATE ON neon_auth.users_sync
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_neon_auth_user();

DROP TRIGGER IF EXISTS sync_user_on_delete ON neon_auth.users_sync;
CREATE TRIGGER sync_user_on_delete
  AFTER DELETE ON neon_auth.users_sync
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_synced_user();

-- 4. Initial sync: Copy existing users from neon_auth to public.users
INSERT INTO public.users (id, stack_auth_id, email, display_name, avatar_url, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  id,
  email,
  name,
  profile_image_url,
  COALESCE(created_at, NOW()),
  NOW()
FROM neon_auth.users_sync
ON CONFLICT (stack_auth_id) 
DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- Verify the sync
SELECT 'Synced users:' as status, COUNT(*) as count FROM public.users;
