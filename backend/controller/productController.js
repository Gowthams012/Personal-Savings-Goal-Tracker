import Product from '../models/productModels.js';
import UserContribution from '../models/userContributeModels.js';
import { fetchProduct } from '../AI/productFetching.js';

// Add a product by scraping info from the given link
export const productAdd = async (req, res) => {
  try {
    const { link, targetDate } = req.body;
    const userId = req.userId; // set by userAuth middleware

    if (!link || !userId || !targetDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const productData = await fetchProduct(link);

    const newProduct = new Product({
      userId,
      productName: productData.name,
      productPrice: productData.price,
      productImage: productData.image,
      productType: productData.category || 'General',
      productLink: link,
      targetDate: new Date(targetDate),
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
    // Always get userId from req.userId (set by userAuth middleware)
    const userId = req.userId;
    if (!userId) return res.status(400).json({ error: "User ID is required" });
    const products = await Product.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (err) {
    console.error("Fetch User Products Error:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};


// Delete a product by ID
export const deleteProduct = async (req, res) => {
  try {
    // Always get userId from req.userId (set by userAuth middleware)
    const userId = req.userId;
    const { ids } = req.body; // product IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No product IDs provided' });
    }

    // Delete only products owned by the user
    const result = await Product.deleteMany({ _id: { $in: ids }, userId });

    // Delete contributions linked to these products for this user
    const result_contribute = await UserContribution.deleteMany({ productId: { $in: ids }, userId });

    if (result.deletedCount === 0 && result_contribute.deletedCount === 0) {
      return res.status(404).json({ error: 'No matching products or contributions found for deletion' });
    }

    return res.status(200).json({
      message: `${result.deletedCount} product(s) and ${result_contribute.deletedCount} contribution(s) deleted successfully`
    });

  } catch (err) {
    console.error('Delete Product Error:', err);
    return res.status(500).json({ error: 'Server error during deletion' });
  }
};
