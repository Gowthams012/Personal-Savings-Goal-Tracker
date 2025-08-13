import mongoose from 'mongoose';
import UserContribution from './userContributeModels.js'; // import your contribution model

const productSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productImage: { type: String }, // optional
  productType: { type: String, default: 'General' },
  productLink: { type: String, required: true },
  targetDate: { type: Date, required: true }
}, { timestamps: true });

// Cascade delete contributions when a product is deleted
productSchema.pre("findOneAndDelete", async function (next) {
  const productId = this.getQuery()._id;
  await UserContribution.deleteMany({ productId });
  next();
});

export default mongoose.model("Product", productSchema);
