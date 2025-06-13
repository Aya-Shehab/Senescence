import express from 'express';
import Product from '../Models/Product.js';

const router = express.Router();

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single product
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching single product:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create product
router.post('/products', async (req, res) => {
    console.log('Received product data:', req.body);
    try {
        // Validate required fields
        const requiredFields = ['name', 'category', 'pricePackWhole'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate data types
        if (isNaN(req.body.pricePackWhole) || req.body.pricePackWhole < 0) {
            return res.status(400).json({
                message: 'Invalid price value'
            });
        }

        if (req.body.pricePiece && (isNaN(req.body.pricePiece) || req.body.pricePiece < 0)) {
            return res.status(400).json({
                message: 'Invalid piece price value'
            });
        }

        if (req.body.quantity && (isNaN(req.body.quantity) || req.body.quantity < 0)) {
            return res.status(400).json({
                message: 'Invalid quantity value'
            });
        }

        // Create new product
        const product = new Product({
            name: req.body.name.trim(),
            category: req.body.category,
            imageUrl: req.body.imageUrl || '',
            pricePackWhole: parseFloat(req.body.pricePackWhole),
            pricePiece: req.body.pricePiece ? parseFloat(req.body.pricePiece) : undefined,
            description: req.body.description || '',
            ingredients: Array.isArray(req.body.ingredients) ? req.body.ingredients : [],
            inStock: req.body.inStock !== undefined ? req.body.inStock : true,
            quantity: req.body.quantity ? parseInt(req.body.quantity) : 0,
            tags: Array.isArray(req.body.tags) ? req.body.tags : []
        });

        console.log('Creating product:', product);
        const newProduct = await product.save();
        console.log('Product created successfully:', newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(400).json({ 
            message: error.message,
            details: error.errors || 'Unknown error occurred'
        });
    }
});

// Update product
router.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key !== '_id') { // Don't update the _id
                product[key] = req.body[key];
            }
        });

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ 
            message: error.message,
            details: error.errors
        });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router; 