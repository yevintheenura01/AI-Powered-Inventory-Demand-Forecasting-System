import mongoose from 'mongoose';

const forecastSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    forecastDate: {
      type: Date,
      required: true,
    },
    predictedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    lowerBound: {
      type: Number,
      required: true,
      min: 0,
    },
    upperBound: {
      type: Number,
      required: true,
      min: 0,
    },
    confidenceInterval: {
      type: Number,
      default: 0.95,
    },
    modelType: {
      type: String,
      default: 'ML-Regression',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a product's forecasts for a time window
forecastSchema.index({ productId: 1, forecastDate: 1 }, { unique: true });

const Forecast = mongoose.model('Forecast', forecastSchema);
export default Forecast;
