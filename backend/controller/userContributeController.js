import UserContribution from "../models/userContributeModels.js";
import User from "../models/userModels.js";
import Product from "../models/productModels.js";

export const addUserContribution = async (req, res) => {
  try {
    const userId = req.cookies.userId || req.body.userId;
    const productId = req.params.productId || req.body.productId;
    const { contributionAmount} = req.body;

    if (!userId || !productId || contributionAmount == null) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (Number(contributionAmount) <= 0) {
      return res.status(400).json({ success: false, message: "Contribution amount must be greater than zero" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Prevent contributing the full price in one go
    if (Number(contributionAmount) >= product.productPrice) {
      return res.status(400).json({ 
        success: false, 
        message: "Contribution amount must be less than the product price" 
      });
    }

    let contribution = await UserContribution.findOne({ userId, productId });

    if (contribution) {
      const newTotal = contribution.contributionAmount + Number(contributionAmount);

      if (newTotal > product.productPrice) {
        return res.status(400).json({
          success: false,
          message: "Total contributions cannot exceed product price"
        });
      }

      contribution.contributionHistory.push({ amount: contributionAmount });
      await contribution.save(); // Auto-calculates total and remainingAmount from schema hook
    } else {
      contribution = await UserContribution.create({
        userId,
        productId,
        productName: product.productName,
        productPrice: product.productPrice,
        contributionAmount,
        contributionHistory: [{ amount: contributionAmount }],
      });
    }

    res.status(201).json({
      success: true,
      message: "Contribution added successfully",
      contribution
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserContributions = async (req, res) => {
  try {
    const userId = req.cookies.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const contributions = await UserContribution.find({ userId })
      .populate("productId", "productName productPrice")
      .sort({ createdAt: -1 });

    res.json({ success: true, contributions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUserContribution = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserContribution.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Contribution not found" });
    }
    res.json({ success: true, message: "Contribution deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
