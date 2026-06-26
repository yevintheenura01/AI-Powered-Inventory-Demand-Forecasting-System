import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import forecastRoutes from './routes/forecastRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/forecast', forecastRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
