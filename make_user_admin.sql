-- SQL Script to make a user an admin
-- Αντικατέστησε το 'user_email@example.com' με το πραγματικό email του χρήστη

-- Επιλογή 1: Ενημέρωση με βάση το email
UPDATE users 
SET role = 'admin' 
WHERE email = 'user_email@example.com';

-- Επιλογή 2: Ενημέρωση με βάση το ID (αν το ξέρεις)
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE id = 'user_uuid_here';

-- Επιλογή 3: Εμφάνιση όλων των admin για επιβεβαίωση
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- Επιλογή 4: Εμφάνιση του συγκεκριμένου χρήστη για επιβεβαίωση
SELECT id, email, first_name, last_name, role, active, created_at 
FROM users 
WHERE email = 'user_email@example.com';
