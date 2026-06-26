import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Forecast from '../models/Forecast.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await Product.deleteMany({});
    await Sale.deleteMany({});
    await Forecast.deleteMany({});

    console.log('Creating products...');
    const products = [
      {
        name: 'UltraBook Pro 15',
        sku: 'ELEC-UBP15',
        category: 'Electronics',
        currentStock: 45,
        safetyStock: 15,
        price: 1200,
        unit: 'units',
      },
      {
        name: 'ActiveFit Smartwatch',
        sku: 'ELEC-AFSW',
        category: 'Electronics',
        currentStock: 12, // Lower than safetyStock, should trigger reorder alert
        safetyStock: 25,
        price: 199,
        unit: 'units',
      },
      {
        name: 'EcoCotton Crewneck Hoodie',
        sku: 'APPA-ECCH',
        category: 'Apparel',
        currentStock: 110,
        safetyStock: 30,
        price: 45,
        unit: 'units',
      },
      {
        name: 'HydroFlow Steel Flask',
        sku: 'HOME-HFSF',
        category: 'Home & Kitchen',
        currentStock: 6, // Critical Stockout threat
        safetyStock: 20,
        price: 29,
        unit: 'units',
      },
      {
        name: 'Wireless ANC Headphones',
        sku: 'ELEC-WANCH',
        category: 'Electronics',
        currentStock: 75,
        safetyStock: 15,
        price: 150,
        unit: 'units',
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products.`);

    console.log('Generating 90 days of daily sales records...');
    const salesDocs = [];
    const today = new Date();

    // We want 90 days of history
    const historyDays = 90;

    for (const product of createdProducts) {
      // Setup characteristics for each product to make forecasts look realistic
      let baseSales = 0;
      let trendSlope = 0;
      let seasonalityFactor = 0;

      if (product.sku === 'ELEC-UBP15') {
        baseSales = 3;
        trendSlope = 0.01; // upward trend
        seasonalityFactor = 1.2; // slight weekly seasonality
      } else if (product.sku === 'ELEC-AFSW') {
        baseSales = 6;
        trendSlope = 0.03; // strong upward trend
        seasonalityFactor = 1.5; // strong weekly seasonality (weekend spike)
      } else if (product.sku === 'APPA-ECCH') {
        baseSales = 8;
        trendSlope = -0.01; // slightly downward trend
        seasonalityFactor = 1.1;
      } else if (product.sku === 'HOME-HFSF') {
        baseSales = 4;
        trendSlope = 0.005; // steady
        seasonalityFactor = 1.3;
      } else {
        baseSales = 5;
        trendSlope = 0.015;
        seasonalityFactor = 1.25;
      }

      for (let i = historyDays; i >= 1; i--) {
        const saleDate = new Date();
        saleDate.setDate(today.getDate() - i);

        // Day of week: 0=Sunday, 6=Saturday
        const dayOfWeek = saleDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Calculate expected sales based on base + trend + weekly seasonality
        // Day 90 is 90 days ago, day 1 is yesterday
        const dayIndex = historyDays - i;
        const trendVal = dayIndex * trendSlope;

        // Multiplier for weekend
        const dayMultiplier = isWeekend ? seasonalityFactor : 0.85;

        // Add some random Gaussian-ish noise
        const noise = (Math.random() - 0.5) * (baseSales * 0.4);

        let quantitySold = Math.round((baseSales + trendVal) * dayMultiplier + noise);
        quantitySold = Math.max(0, quantitySold); // No negative sales

        if (quantitySold > 0) {
          salesDocs.push({
            productId: product._id,
            date: saleDate,
            quantity: quantitySold,
            revenue: quantitySold * product.price,
          });
        }
      }
    }

    await Sale.insertMany(salesDocs);
    console.log(`Generated ${salesDocs.length} historical sales records.`);
    console.log('Database seeding successfully finished!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
