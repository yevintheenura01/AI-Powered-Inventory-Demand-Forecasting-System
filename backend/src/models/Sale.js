import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    revenue: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Optional index for faster query by product and date range
saleSchema.index({ productId: 1, date: 1 });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
