import Product from '../models/product.js';

export const searchProducts = async (req, res) => {
    try {
        const searchQuery = req.body['search-field'];
        
        if (!searchQuery) {
            return res.redirect('/shop');
        }

        // Search in product name and description
        const products = await Product.find({
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        });

        res.render('shop-products', {
            products,
            searchQuery,
            currentCategory: 'all'
        });
    } catch (error) {
        console.error('Error in searchProducts:', error);
        res.status(500).render('error', {
            message: 'Error performing search',
            error: process.env.NODE_ENV === 'development' ? error : {}
        });
    }
}; 