import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Cake", "Cookie", "Croissant"],
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    pricePackWhole: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePiece: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model("Product", productSchema);
export default Product;
