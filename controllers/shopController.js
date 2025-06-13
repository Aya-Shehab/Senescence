import Product from '../models/product.js';

export const getShopPage = async (req, res) => {
    try {
        console.log('Shop page requested with query:', req.query); // Debug log
        const { category, sort } = req.query;
        let query = {};
        let sortOptions = {};

        // If category is provided, filter by category
        if (category) {
            query.category = category;
        }

        // Apply sorting based on 'sort' query parameter
        switch (sort) {
            case 'price_desc':
                sortOptions = { pricePackWhole: -1 };
                break;
            case 'price_asc':
                sortOptions = { pricePackWhole: 1 };
                break;
            case 'name_asc':
                sortOptions = { name: 1 };
                break;
            case 'name_desc':
                sortOptions = { name: -1 };
                break;
            case 'featured':
            default:
                // Default or 'featured' sort, no specific sorting applied here for now
                // You might add logic for 'featured' based on a specific product field later
                break;
        }

        // Get all products (or filtered by category) with sorting
        let products = await Product.find(query).sort(sortOptions);
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