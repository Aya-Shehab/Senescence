import Product from "../models/product.js";

export const createProduct = async (req, res) => {
  try {
    const { name, category, pricePackWhole } = req.body;
    if (!name || !category || !pricePackWhole) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const validCategories = ["Cake", "Cookie", "Croissant"];
    if (!validCategories.includes(category)) {
      return res
        .status(400)
        .json({
          error: `Category must be one of: ${validCategories.join(", ")}`,
        });
    }
    if (typeof pricePackWhole !== "number" || pricePackWhole < 0) {
      return res
        .status(400)
        .json({ error: "pricePackWhole must be a non-negative number." });
    }
    const product = await Product.findOne({ name });
    if (product != null) {
      return res.status(400).json({ error: "Product already exists" });
    }
    const newProduct = new Product({
      name: req.body.name,
      category: req.body.category,
      pricePackWhole: req.body.pricePackWhole,
      imageUrl: req.body.imageUrl || "",
      pricePiece: req.body.pricePiece || 0,
      description: req.body.description || "",
      ingredients: req.body.ingredients || [],
      inStock: req.body.inStock || true,
      quantity: req.body.quantity || 0,
      tags: req.body.tags || [],
    });
    await newProduct.save();

    return res.status(201).json({ message: "Product created successfully" });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(404).render('404');
    }
    
    // Check if the request is for API or page rendering
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.json(product);
    }
    
    // Render the product detail page
    res.render('product-detail', { product });
  } catch (error) {
    console.error('Error fetching product:', error);
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.status(500).json({ error: "Internal server error .. try again later" });
    }
    res.status(500).render('404');
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);
    if (product == null) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error .. try again later" });
  }
}; 