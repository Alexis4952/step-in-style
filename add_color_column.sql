-- =====================================================
-- ΠΡΟΣΘΗΚΗ ΠΕΔΙΟΥ ΧΡΩΜΑΤΟΣ ΣΤΟΝ ΠΙΝΑΚΑ PRODUCTS
-- =====================================================

-- Έλεγχος αν υπάρχει ήδη το πεδίο color
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'color'
    ) THEN
        -- Προσθήκη του πεδίου color αν δεν υπάρχει
        ALTER TABLE products ADD COLUMN color VARCHAR(50);
        
        -- Ενημέρωση υπάρχοντα προϊόντα με default χρώμα
        UPDATE products SET color = 'Λευκό' WHERE color IS NULL;
        
        RAISE NOTICE 'Προστέθηκε το πεδίο color στον πίνακα products';
    ELSE
        RAISE NOTICE 'Το πεδίο color υπάρχει ήδη στον πίνακα products';
    END IF;
END $$;

-- Δημιουργία index για γρήγορη αναζήτηση με χρώμα
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);

-- Εμφάνιση της δομής του πίνακα products
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position; 