-- SQL Script to add role column to user_profiles table
-- Εκτέλεσε αυτό το script στο Supabase SQL Editor

-- Προσθήκη στήλης role στον πίνακα user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Ενημέρωση υπάρχοντος admin user (αν υπάρχει)
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'worktube.gr@gmail.com';

-- Εμφάνιση όλων των χρηστών με τους ρόλους τους
SELECT 
  id,
  user_id,
  email,
  full_name,
  phone,
  role,
  created_at,
  updated_at
FROM user_profiles 
ORDER BY created_at DESC;

-- Εμφάνιση μόνο των admin users
SELECT 
  id,
  user_id,
  email,
  full_name,
  phone,
  role,
  created_at
FROM user_profiles 
WHERE role IN ('admin', 'superadmin')
ORDER BY created_at DESC;
