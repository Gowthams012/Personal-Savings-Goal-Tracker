import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  productImage: { type: String }, // optional
  productType: { type: String, default: 'General' },
  productLink: { type: String, required: true },
  targetDate: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
