-- SQL Script to check user_profiles table structure
-- Εκτέλεσε αυτό για να δεις τι έχει ο πίνακας

-- Έλεγχος δομής του πίνακα user_profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Έλεγχος περιεχομένου του user_profiles
SELECT * FROM user_profiles LIMIT 5;

-- Έλεγχος αν υπάρχει στήλη role
SELECT 
  column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public' 
AND column_name = 'role';
