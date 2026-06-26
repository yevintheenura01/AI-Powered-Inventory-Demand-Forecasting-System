import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Forecast from '../models/Forecast.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, sku, category, currentStock, safetyStock, price, unit } = req.body;
    const productExists = await Product.findOne({ sku });

    if (productExists) {
      return res.status(400).json({ message: 'Product SKU already exists' });
    }

    const product = await Product.create({
      name,
      sku,
      category,
      currentStock,
      safetyStock,
      price,
      unit,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(550).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, sku, category, currentStock, safetyStock, price, unit } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.sku = sku || product.sku;
      product.category = category || product.category;
      product.currentStock = currentStock !== undefined ? currentStock : product.currentStock;
      product.safetyStock = safetyStock !== undefined ? safetyStock : product.safetyStock;
      product.price = price !== undefined ? price : product.price;
      product.unit = unit || product.unit;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Clean up sales and forecasts associated with this product
      await Sale.deleteMany({ productId: product._id });
      await Forecast.deleteMany({ productId: product._id });
      await Product.findByIdAndDelete(product._id);
      res.json({ message: 'Product and all associated records deleted' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
