-- =====================================================
-- ΕΛΕΓΧΟΣ ΚΑΙ ΠΡΟΣΘΗΚΗ ΠΕΔΙΟΥ ΧΡΩΜΑΤΟΣ
-- =====================================================

-- 1. Έλεγχος αν υπάρχει το πεδίο color
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'color';

-- 2. Αν δεν υπάρχει, προσθήκη του πεδίου
ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- 3. Ενημέρωση υπάρχοντα προϊόντα με default χρώμα
UPDATE products SET color = 'Λευκό' WHERE color IS NULL;

-- 4. Επιβεβαίωση ότι προστέθηκε
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'color';

-- 5. Δημιουργία index
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);

-- 6. Εμφάνιση όλων των στηλών για επιβεβαίωση
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position; 