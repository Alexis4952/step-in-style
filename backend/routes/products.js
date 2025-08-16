const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// GET all products with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      minPrice, 
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let query = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          description
        )
      `)
      .eq('available', true);

    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('available', true);

    if (countError) throw countError;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    res.json({
      products: data || [],
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: count,
        productsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          description
        )
      `)
      .eq('id', id)
      .eq('available', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Product not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create new product (Admin only)
router.post('/', upload.array('images', 5), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category_id').isUUID().withMessage('Valid category ID is required'),
  body('available').isBoolean().withMessage('Available must be a boolean')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      name,
      description,
      price,
      stock,
      category_id,
      available,
      color,
      size,
      brand
    } = req.body;

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id,
        available: available === 'true',
        color: color || null,
        size: size || null,
        brand: brand || null
      }])
      .select()
      .single();

    if (productError) throw productError;

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      
      for (const file of req.files) {
        const fileName = `${Date.now()}-${file.originalname}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        imageUrls.push(urlData.publicUrl);
      }

      // Update product with image URLs
      if (imageUrls.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: imageUrls })
          .eq('id', product.id);

        if (updateError) {
          console.error('Error updating product images:', updateError);
        }
      }
    }

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product (Admin only)
router.put('/:id', upload.array('images', 5), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category_id').optional().isUUID().withMessage('Valid category ID is required')
], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Prepare update data
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.stock) updateData.stock = parseInt(req.body.stock);
    if (req.body.category_id) updateData.category_id = req.body.category_id;
    if (req.body.available !== undefined) updateData.available = req.body.available === 'true';
    if (req.body.color !== undefined) updateData.color = req.body.color;
    if (req.body.size !== undefined) updateData.size = req.body.size;
    if (req.body.brand !== undefined) updateData.brand = req.body.brand;

    // Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      const imageUrls = existingProduct.images || [];
      
      for (const file of req.files) {
        const fileName = `${Date.now()}-${file.originalname}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        imageUrls.push(urlData.publicUrl);
      }

      // Update product with new image URLs
      if (imageUrls.length > 0) {
        const { error: imageUpdateError } = await supabase
          .from('products')
          .update({ images: imageUrls })
          .eq('id', id);

        if (imageUpdateError) {
          console.error('Error updating product images:', imageUpdateError);
        }
      }
    }

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Soft delete - mark as unavailable instead of hard delete
    const { error: deleteError } = await supabase
      .from('products')
      .update({ available: false })
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12 } = req.query;

    let query = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          description
        )
      `)
      .eq('category_id', categoryId)
      .eq('available', true);

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('available', true);

    if (countError) throw countError;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    res.json({
      products: data || [],
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: count,
        productsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// GET search products
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 12 } = req.query;

    let searchQuery = supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          description
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
      .eq('available', true);

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
      .eq('available', true);

    if (countError) throw countError;

    // Apply pagination
    const offset = (page - 1) * limit;
    searchQuery = searchQuery.range(offset, offset + limit - 1);

    const { data, error } = await searchQuery;

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    res.json({
      products: data || [],
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: count,
        productsPerPage: parseInt(limit)
      },
      searchQuery: query
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

module.exports = router;
