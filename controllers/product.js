import Product from "../models/product.js";
import Feedback from "../models/feedback.js";

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
    return res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Get all feedbacks sorted by date
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    
    res.render('product-detail', { product, feedbacks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, category, pricePackWhole } = req.body;
    if (!name || !category || !pricePackWhole) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const validCategories = ["Cake", "Cookie", "Croissant"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: `Category must be one of: ${validCategories.join(", ")}`,
      });
    }
    if (typeof pricePackWhole !== "number" || pricePackWhole < 0) {
      return res.status(400).json({ error: "pricePackWhole must be a non-negative number." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if name is being changed and if it already exists
    if (name !== product.name) {
      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        return res.status(400).json({ error: "Product name already exists" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
        pricePackWhole: req.body.pricePackWhole,
        imageUrl: req.body.imageUrl || product.imageUrl,
        pricePiece: req.body.pricePiece || product.pricePiece,
        description: req.body.description || product.description,
        ingredients: req.body.ingredients || product.ingredients,
        inStock: req.body.inStock !== undefined ? req.body.inStock : product.inStock,
        quantity: req.body.quantity || product.quantity,
        tags: req.body.tags || product.tags,
      },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}; 