-- =====================================================
-- COMPLETE CATEGORIES SETUP FOR STEP IN STYLE
-- Εκτέλεσε αυτό το script στη Supabase SQL Editor
-- =====================================================

-- 1. Δημιουργία πίνακα κατηγοριών (αν δεν υπάρχει)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Δημιουργία indexes για καλύτερη απόδοση
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 3. Δημιουργία trigger για αυτόματη ενημέρωση του updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Καθαρισμός υπαρχόντων κατηγοριών (αν υπάρχουν)
DELETE FROM categories;

-- 5. Προσθήκη όλων των κατηγοριών
INSERT INTO categories (name, slug, description, display_order) VALUES
('Παπούτσια', 'papoutsia', 'Κλασικά και μοντέρνα παπούτσια για κάθε περίσταση. Αθλητικά, επίσημα, casual και εσπερινά παπούτσια για άνδρες και γυναίκες.', 1),
('Τσάντες', 'tsantes', 'Ελεγάντες τσάντες για καθημερινή χρήση και ειδικές περιστάσεις. Crossbody, shoulder bags, backpacks και clutch.', 2),
('Παντόφλες', 'pantofles', 'Άνετες παντόφλες για το σπίτι και την παραλία. Με memory foam, καλαμακιαρές και ελαστικές.', 3),
('Αξεσουάρ', 'aksesouar', 'Κοσμήματα και αξεσουάρ για να ολοκληρώσεις το look σου. Αλυσίδες ποδιών, κολιέ, βραχιόλια και δαχτυλίδια.', 4),
('Ζώνες', 'zones', 'Δερμάτινες και ελεγάντες ζώνες για άνδρες και γυναίκες. Κλασικές και μοντέρνες για κάθε στυλ.', 5),
('Κασκόλ', 'kaskol', 'Ζεστά κασκόλ για το χειμώνα. Μάλλινα, μετάξινα και βαμβακερά σε διάφορα χρώματα και μοτίβα.', 6),
('Γάντια', 'gantia', 'Δερμάτινα και μάλλινα γάντια για το χειμώνα. Κλασικά και μοντέρνα σχεδίαση για άνδρες και γυναίκες.', 7),
('Σκούφος', 'skoufos', 'Μάλλινοι και στυλάτοι σκούφοι. Beanie, fedora, baseball caps και άλλες μοντέρνες επιλογές.', 8),
('Πορτοφόλια', 'portofolia', 'Δερμάτινα πορτοφόλια για άνδρες και γυναίκες. Κλασικά και μοντέρνα με πολλαπλές θήκες.', 9),
('Μαντήλια', 'mantilia', 'Ελεγάντα μαντήλια για κάθε περίσταση. Μετάξινα, βαμβακερά και διακοσμητικά.', 10),
('Εσάρπες', 'esarpes', 'Μετάξινες και μάλλινες εσάρπες. Ελεγάντες και ζεστές για το χειμώνα και την άνοιξη.', 11);

-- 6. Επιβεβαίωση ότι προστέθηκαν οι κατηγορίες
SELECT '✅ Κατηγορίες που προστέθηκαν:' as info;
SELECT 
  id, 
  name, 
  slug, 
  display_order, 
  is_active,
  CASE 
    WHEN is_active THEN '✅ Ενεργή'
    ELSE '❌ Ανενεργή'
  END as status
FROM categories 
ORDER BY display_order;

-- 7. Επιβεβαίωση συνολικών στατιστικών
SELECT '📊 Συνολικές στατιστικές:' as info;
SELECT 
  COUNT(*) as total_categories,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_categories,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_categories
FROM categories;

-- 8. Επιβεβαίωση ότι όλα τα slugs είναι μοναδικά
SELECT '🔍 Έλεγχος μοναδικότητας slugs:' as info;
SELECT slug, COUNT(*) as count
FROM categories 
GROUP BY slug 
HAVING COUNT(*) > 1;

-- 9. Επιβεβαίωση ότι όλα τα ονόματα είναι μοναδικά
SELECT '🔍 Έλεγχος μοναδικότητας ονομάτων:' as info;
SELECT name, COUNT(*) as count
FROM categories 
GROUP BY name 
HAVING COUNT(*) > 1;

-- 10. Επιβεβαίωση ότι δεν υπάρχουν κενά display_order
SELECT '🔍 Έλεγχος display_order:' as info;
SELECT display_order, COUNT(*) as count
FROM categories 
GROUP BY display_order 
HAVING COUNT(*) > 1;

-- 11. Επιβεβαίωση ότι όλα τα display_order είναι διαδοχικά
SELECT '🔍 Έλεγχος διαδοχικότητας display_order:' as info;
WITH ordered_categories AS (
  SELECT display_order, ROW_NUMBER() OVER (ORDER BY display_order) as expected_order
  FROM categories
  ORDER BY display_order
)
SELECT 
  display_order,
  expected_order,
  CASE 
    WHEN display_order = expected_order THEN '✅ Σωστό'
    ELSE '❌ Λάθος'
  END as status
FROM ordered_categories;

-- 12. Τελική επιβεβαίωση
SELECT '🎉 Επιτυχής εγκατάσταση κατηγοριών!' as message;
SELECT 'Τώρα μπορείς να χρησιμοποιήσεις τις κατηγορίες στο frontend.' as next_step; 