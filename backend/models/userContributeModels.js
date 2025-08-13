import mongoose from 'mongoose';

const userContributionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Product' 
  },
  productName: { 
    type: String, 
    required: true 
  },
  productPrice: { 
    type: Number, 
    required: true, 
    min: [0, "Price cannot be negative"] 
  },
  contributionAmount: { 
    type: Number, 
    required: true, 
    min: [0, "Contribution cannot be negative"] 
  },
  contributionDate: { 
    type: Date, 
    default: Date.now 
  },
  contributionHistory: [{
    amount: { 
      type: Number, 
      required: true, 
      min: [0, "Contribution amount cannot be negative"] 
    },
    date: { 
      type: Date, 
      default: Date.now 
    }
  }],
  remainingAmount: { 
    type: Number, 
    default: 0 
  },
  targetDate: { type: Date, required: false }
  
}, { timestamps: true });

// Index for faster lookups
userContributionSchema.index({ userId: 1, productId: 1 });

// Auto-calculate remainingAmount before save
userContributionSchema.pre('save', function (next) {
  const totalContributed = this.contributionHistory.reduce((sum, entry) => sum + entry.amount, 0);
  this.contributionAmount = totalContributed;
  this.remainingAmount = Math.max(this.productPrice - totalContributed, 0);
  next();
});

export default mongoose.model('UserContribution', userContributionSchema);
