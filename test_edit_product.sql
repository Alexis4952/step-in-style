-- =====================================================
-- ΕΛΕΓΧΟΣ ΕΠΕΞΕΡΓΑΣΙΑΣ ΠΡΟΪΟΝΤΟΣ - STEP IN STYLE
-- =====================================================

-- 1. Έλεγχος προϊόντων πριν από αλλαγές
SELECT 
    id,
    name,
    sku,
    brand,
    price,
    old_price,
    category,
    subcategory,
    status,
    color,
    description,
    sizes,
    carousels,
    created_at
FROM products 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Έλεγχος αν υπάρχουν προϊόντα με πρόσφατες αλλαγές
SELECT 
    id,
    name,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 as minutes_ago
FROM products 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 3. Έλεγχος συγκεκριμένου προϊόντος (ανάλογα με το ID που θα αλλάξεις)
-- Αντικατέστησε το 1 με το ID του προϊόντος που θα ελέγξεις
SELECT 
    id,
    name,
    sku,
    brand,
    price,
    old_price,
    category,
    subcategory,
    status,
    color,
    description,
    sizes,
    carousels,
    image_url,
    gallery,
    created_at
FROM products 
WHERE id = 1;

-- 4. Έλεγχος αν υπάρχουν προϊόντα με συγκεκριμένα πεδία
SELECT 
    id,
    name,
    category,
    subcategory,
    color
FROM products 
WHERE category IS NOT NULL 
ORDER BY id DESC 
LIMIT 10;

-- 5. Έλεγχος αν υπάρχουν προϊόντα με carousels
SELECT 
    id,
    name,
    carousels
FROM products 
WHERE carousels IS NOT NULL 
AND carousels != '{}'
ORDER BY id DESC 
LIMIT 5;

-- 6. Έλεγχος δομής πίνακα products
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position; 