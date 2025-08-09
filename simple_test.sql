-- =====================================================
-- ΑΠΛΟΣ ΕΛΕΓΧΟΣ ΠΡΟΪΟΝΤΩΝ - STEP IN STYLE
-- =====================================================

-- 1. Έλεγχος δομής πίνακα products
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Έλεγχος προϊόντων
SELECT 
    id,
    name,
    sku,
    brand,
    price,
    category,
    subcategory,
    color,
    created_at
FROM products 
ORDER BY id DESC 
LIMIT 5;

-- 3. Έλεγχος συγκεκριμένου προϊόντος (αντικατέστησε το 1 με το ID που θέλεις)
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