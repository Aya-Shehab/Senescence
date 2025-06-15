import Product from "../models/product.js";
import Feedback from "../models/feedback.js";

export const createProduct = async (req, res) => {
  try {
    const { name, category } = req.body;
    const pricePackWholeRaw = req.body.pricePackWhole;
    const pricePackWhole = Number(pricePackWholeRaw);

    if (!name || !category || pricePackWholeRaw === undefined) {
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
    if (isNaN(pricePackWhole) || pricePackWhole < 0) {
      return res
        .status(400)
        .json({ error: "pricePackWhole must be a non-negative number." });
    }
    const product = await Product.findOne({ name });
    if (product != null) {
      return res.status(400).json({ error: "Product already exists" });
    }
    
    const parseArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      try {
        return JSON.parse(field);
      } catch {
        return String(field).split(',').map(s=>s.trim()).filter(Boolean);
      }
    };

    const newProduct = new Product({
      name: req.body.name,
      category: req.body.category,
      pricePackWhole,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || ""),
      pricePiece: req.body.pricePiece || 0,
      description: req.body.description || "",
      ingredients: parseArrayField(req.body.ingredients),
      inStock: req.body.inStock === 'false' ? false : !!req.body.inStock,
      quantity: req.body.quantity || 0,
      tags: parseArrayField(req.body.tags),
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

    // If the client explicitly wants JSON (e.g., admin panel fetch)
    const wantsJson = req.headers.accept && req.headers.accept.includes('application/json');
    if (wantsJson || req.xhr) {
      return res.status(200).json(product);
    }

    // Otherwise render the product page with feedbacks
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return res.render('product-detail', { product, feedbacks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, category } = req.body;
    const pricePackWholeRaw = req.body.pricePackWhole;
    const pricePackWhole = Number(pricePackWholeRaw);

    if (!name || !category || pricePackWholeRaw === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const validCategories = ["Cake", "Cookie", "Croissant"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: `Category must be one of: ${validCategories.join(", ")}`,
      });
    }
    if (isNaN(pricePackWhole) || pricePackWhole < 0) {
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

    const parseArrayField = (field) => {
      if (!field) return product.ingredients; // fallback
      if (Array.isArray(field)) return field;
      try {
        return JSON.parse(field);
      } catch {
        return String(field).split(',').map(s=>s.trim()).filter(Boolean);
      }
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
        pricePackWhole,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || product.imageUrl),
        pricePiece: req.body.pricePiece || product.pricePiece,
        description: req.body.description || product.description,
        ingredients: parseArrayField(req.body.ingredients),
        inStock: req.body.inStock !== undefined ? (req.body.inStock === 'false' ? false : !!req.body.inStock) : product.inStock,
        quantity: req.body.quantity || product.quantity,
        tags: parseArrayField(req.body.tags),
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