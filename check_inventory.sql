-- =====================================================
-- ΕΛΕΓΧΟΣ ΑΠΟΘΕΜΑΤΟΣ - STEP IN STYLE
-- =====================================================

-- 1. Έλεγχος προϊόντων
SELECT 
    id,
    name,
    total_stock,
    available
FROM products 
ORDER BY id 
LIMIT 10;

-- 2. Έλεγχος αποθέματος ανά μέγεθος
SELECT 
    pi.product_id,
    p.name,
    pi.size,
    pi.quantity,
    pi.updated_at
FROM product_inventory pi
JOIN products p ON pi.product_id = p.id
ORDER BY pi.product_id, pi.size
LIMIT 20;

-- 3. Έλεγχος triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'product_inventory';

-- 4. Έλεγχος functions
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name LIKE '%inventory%' OR routine_name LIKE '%stock%';

-- 5. Έλεγχος αν λειτουργεί το trigger
-- Πρώτα δες το total_stock
SELECT id, name, total_stock FROM products WHERE id = 1;

-- Μετά ενημέρωσε το απόθεμα
UPDATE product_inventory 
SET quantity = quantity + 1 
WHERE product_id = 1 AND size = '36';

-- Και δες αν ενημερώθηκε το total_stock
SELECT id, name, total_stock FROM products WHERE id = 1; 