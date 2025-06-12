import Product from '../models/product.js';

export const getShopPage = async (req, res) => {
    try {
        console.log('Shop page requested with query:', req.query); // Debug log
        const { category } = req.query;
        let query = {};
        
        // If category is provided, filter by category
        if (category) {
            query.category = category;
        }

        // Get all products (or filtered by category)
        let products = await Product.find(query);
        console.log('Found products:', products); // Debug log

        if (!products || products.length === 0) {
            console.log('No products found in database'); // Debug log
        }

        // Determine which template to render based on the URL
        const template = req.path === '/categories' ? 'categories' : 'shop-products';

        res.render(template, {
            products: products || [], // Ensure products is always an array
            currentCategory: category || 'all'
        });
    } catch (error) {
        console.error('Error in getShopPage:', error);
        res.status(500).render('error', { 
            message: 'Error loading shop page',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
}; 