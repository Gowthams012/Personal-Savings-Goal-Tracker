import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  category: { type: String },
  productUrl: { type: String, required: true },
  targetDate: { type: Date, required: true },
  contributionType: { type: String, enum: ['monthly', 'daily'], required: true },
  contributionAmount: { type: Number, required: true },
  savedAmount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);