import Product from '../models/productModels.js';
import { fetchProduct } from '../AI/productFetching.js';

// Add a product by scraping info from the given link
export const productAdd = async (req, res) => {
  try {
    const { link, targetDate, contributionType, contributionAmount } = req.body;
    const userId = req.cookies.userId || req.body.userId;

    if (!link || !userId || !targetDate || !contributionType || !contributionAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Scrape product info
    const productData = await fetchProduct(link);

    // Build new product document
  const newProduct = new Product({
  userId,
  productName: productData.name,
  productPrice: productData.price,
  productImage: productData.image,     // change this only if your schema has productImage
  productType: productData.category || 'General',
  productLink: link,
  targetDate: new Date(targetDate),
  contributionType,
  contributionAmount,
  savedAmount: 0,
});


    const saved = await newProduct.save();

    return res.status(201).json({
      message: "Product saved successfully",
      product: saved
    });
  } catch (err) {
    console.error("Add Product Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get all products for a specific user
export const getUserProducts = async (req, res) => {
  try {
    const userId = req.cookies.userId || req.params.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const products = await Product.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ products });
  } catch (err) {
    console.error("Fetch User Products Error:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Update only the saved amount
export const updateSaved = async (req, res) => {
  try {
    const { productId } = req.params;
    const { savedAmount } = req.body;

    const updated = await Product.findByIdAndUpdate(
      productId,
      { savedAmount },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Product not found" });

    return res.status(200).json({
      message: "Saved amount updated",
      product: updated
    });
  } catch (err) {
    console.error("Update Saved Amount Error:", err);
    return res.status(500).json({ error: "Update failed" });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) return res.status(404).json({ error: "Product not found" });

    return res.status(200).json({
      message: "Product deleted successfully",
      deleted
    });
  } catch (err) {
    console.error("Delete Product Error:", err);
    return res.status(500).json({ error: "Delete failed" });
  }
};
