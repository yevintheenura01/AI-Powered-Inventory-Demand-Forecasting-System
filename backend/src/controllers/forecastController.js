import axios from 'axios';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Forecast from '../models/Forecast.js';

export const getProductForecastAndHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch history (last 12 months or similar, sorted by date)
    const sales = await Sale.find({ productId }).sort({ date: 1 });
    
    // Fetch forecast (future dates, sorted by date)
    const forecasts = await Forecast.find({ productId }).sort({ forecastDate: 1 });

    res.json({
      product,
      history: sales.map(s => ({
        date: s.date.toISOString().split('T')[0],
        quantity: s.quantity,
        revenue: s.revenue,
      })),
      forecast: forecasts.map(f => ({
        date: f.forecastDate.toISOString().split('T')[0],
        predicted: f.predictedQuantity,
        lowerBound: f.lowerBound,
        upperBound: f.upperBound,
        modelType: f.modelType,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateForecast = async (req, res) => {
  try {
    const { productId, daysToForecast = 30 } = req.body;
    const mlUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

    let productsToForecast = [];
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      productsToForecast.push(product);
    } else {
      productsToForecast = await Product.find({});
    }

    if (productsToForecast.length === 0) {
      return res.status(400).json({ message: 'No products available for forecasting' });
    }

    const forecastSummary = [];

    for (const product of productsToForecast) {
      // Gather historical sales
      const sales = await Sale.find({ productId: product._id }).sort({ date: 1 });

      if (sales.length < 5) {
        // Need at least some sales history to make a decent baseline forecast
        forecastSummary.push({
          productId: product._id,
          name: product.name,
          success: false,
          reason: 'Insufficient history (needs at least 5 sales transactions)',
        });
        continue;
      }

      // Prepare request payload for Python service
      const historyData = sales.map(s => ({
        date: s.date.toISOString().split('T')[0],
        quantity: s.quantity,
      }));

      try {
        const response = await axios.post(`${mlUrl}/forecast`, {
          history: historyData,
          days_to_forecast: parseInt(daysToForecast),
        });

        const predictions = response.data.predictions;

        // Clear existing forecasts for this product to prevent duplicates
        await Forecast.deleteMany({ productId: product._id });

        // Save new forecasts
        const forecastDocs = predictions.map(pred => ({
          productId: product._id,
          forecastDate: new Date(pred.date),
          predictedQuantity: Math.max(0, parseFloat(pred.predicted.toFixed(2))),
          lowerBound: Math.max(0, parseFloat(pred.lower_bound.toFixed(2))),
          upperBound: Math.max(0, parseFloat(pred.upper_bound.toFixed(2))),
          confidenceInterval: 0.95,
          modelType: response.data.model_type || 'ML-Regression',
        }));

        await Forecast.insertMany(forecastDocs);

        forecastSummary.push({
          productId: product._id,
          name: product.name,
          success: true,
          predictionsCount: predictions.length,
        });
      } catch (mlErr) {
        console.error(`ML Service Error for product ${product.name}:`, mlErr.message);
        forecastSummary.push({
          productId: product._id,
          name: product.name,
          success: false,
          reason: `ML service error: ${mlErr.message}`,
        });
      }
    }

    res.json({
      message: 'Forecasting jobs completed',
      results: forecastSummary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
