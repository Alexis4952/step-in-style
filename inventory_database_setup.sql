-- =====================================================
-- ΣΥΣΤΗΜΑ ΔΙΑΧΕΙΡΙΣΗΣ ΑΠΟΘΕΜΑΤΟΣ - STEP IN STYLE
-- =====================================================

-- 1. Δημιουργία πίνακα αποθέματος ανά μέγεθος
CREATE TABLE IF NOT EXISTS product_inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- 2. Δημιουργία indexes για γρήγορη αναζήτηση
CREATE INDEX IF NOT EXISTS idx_product_inventory_product_id ON product_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_size ON product_inventory(size);
CREATE INDEX IF NOT EXISTS idx_product_inventory_quantity ON product_inventory(quantity);

-- 3. Trigger για αυτόματη ενημέρωση του updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_inventory_updated_at 
    BEFORE UPDATE ON product_inventory 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Προσθήκη στήλης total_stock στον πίνακα products (για συμβατότητα)
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 0;

-- 5. Function για αυτόματη ενημέρωση του total_stock
CREATE OR REPLACE FUNCTION update_product_total_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Ενημέρωση total_stock στον πίνακα products
    UPDATE products 
    SET total_stock = (
        SELECT COALESCE(SUM(quantity), 0) 
        FROM product_inventory 
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 6. Triggers για αυτόματη ενημέρωση total_stock
CREATE TRIGGER update_total_stock_on_insert
    AFTER INSERT ON product_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_product_total_stock();

CREATE TRIGGER update_total_stock_on_update
    AFTER UPDATE ON product_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_product_total_stock();

CREATE TRIGGER update_total_stock_on_delete
    AFTER DELETE ON product_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_product_total_stock();

-- 7. Function για ενημέρωση total_stock για όλα τα υπάρχοντα προϊόντα
CREATE OR REPLACE FUNCTION update_all_products_total_stock()
RETURNS void AS $$
BEGIN
    UPDATE products 
    SET total_stock = (
        SELECT COALESCE(SUM(quantity), 0) 
        FROM product_inventory 
        WHERE product_id = products.id
    );
END;
$$ language 'plpgsql';

-- 8. Εκτέλεση ενημέρωσης για υπάρχοντα προϊόντα
SELECT update_all_products_total_stock();

-- 9. Δημιουργία view για εύκολη προβολή αποθέματος
CREATE OR REPLACE VIEW product_inventory_summary AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.category,
    p.total_stock,
    COUNT(pi.size) as available_sizes,
    STRING_AGG(pi.size || ':' || pi.quantity, ', ' ORDER BY pi.size) as size_breakdown
FROM products p
LEFT JOIN product_inventory pi ON p.id = pi.product_id
GROUP BY p.id, p.name, p.sku, p.category, p.total_stock;

-- 10. Function για έλεγχο διαθεσιμότητας ανά μέγεθος
CREATE OR REPLACE FUNCTION check_size_availability(product_id_param INTEGER, size_param VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    available_quantity INTEGER;
BEGIN
    SELECT quantity INTO available_quantity
    FROM product_inventory
    WHERE product_id = product_id_param AND size = size_param;
    
    RETURN COALESCE(available_quantity, 0) > 0;
END;
$$ language 'plpgsql';

-- 11. Function για μείωση αποθέματος (για μελλοντικές παραγγελίες)
CREATE OR REPLACE FUNCTION reduce_inventory(product_id_param INTEGER, size_param VARCHAR, quantity_to_reduce INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_quantity INTEGER;
BEGIN
    -- Έλεγχος αν υπάρχει αρκετό απόθεμα
    SELECT quantity INTO current_quantity
    FROM product_inventory
    WHERE product_id = product_id_param AND size = size_param;
    
    IF current_quantity IS NULL OR current_quantity < quantity_to_reduce THEN
        RETURN FALSE; -- Δεν υπάρχει αρκετό απόθεμα
    END IF;
    
    -- Μείωση αποθέματος
    UPDATE product_inventory
    SET quantity = quantity - quantity_to_reduce
    WHERE product_id = product_id_param AND size = size_param;
    
    RETURN TRUE; -- Επιτυχής μείωση
END;
$$ language 'plpgsql';

-- =====================================================
-- ΕΝΤΟΛΕΣ ΕΛΕΓΧΟΥ ΚΑΙ ΔΟΚΙΜΗΣ
-- =====================================================

-- Έλεγχος αν δημιουργήθηκαν σωστά οι πίνακες
SELECT 'product_inventory table exists' as check_result 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_inventory');

-- Έλεγχος αν υπάρχει η στήλη total_stock
SELECT 'total_stock column exists' as check_result 
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'total_stock'
);

-- Προβολή όλων των triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%inventory%' OR trigger_name LIKE '%stock%';

-- Προβολή όλων των functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%inventory%' OR routine_name LIKE '%stock%';

-- =====================================================
-- ΣΗΜΕΙΩΣΕΙΣ ΧΡΗΣΗΣ
-- =====================================================

/*
ΤΟ ΣΥΣΤΗΜΑ ΛΕΙΤΟΥΡΓΕΙ ΕΤΣΙ:

1. Όταν προσθέτεις/ενημερώνεις απόθεμα από το Admin Panel:
   - Αποθηκεύεται στον πίνακα product_inventory
   - Το trigger update_total_stock_on_insert/update ενημερώνει αυτόματα το total_stock στον πίνακα products

2. Η μπάρα αποθέματος στο Admin Panel:
   - Διαβάζει το total_stock από τον πίνακα products
   - Εμφανίζει το σωστό σύνολο αποθέματος

3. Στη σελίδα προϊόντος (για τους πελάτες):
   - Διαβάζει το product_inventory για κάθε μέγεθος
   - Εμφανίζει "Διαθέσιμο" ή "Μη διαθέσιμο" ανάλογα με το quantity

4. Για μελλοντικές παραγγελίες:
   - Χρησιμοποίησε τη function reduce_inventory() για μείωση αποθέματος
   - Χρησιμοποίησε τη function check_size_availability() για έλεγχο διαθεσιμότητας

ΕΚΤΕΛΕΣΕ ΑΥΤΟ ΤΟ SCRIPT ΣΤΗ SUPABASE SQL EDITOR!
*/ 