# Inventory & Demand Forecasting Backend API

This is the Express.js and MongoDB backend service for the AI-Powered Inventory & Demand Forecasting System. It handles all product operations, inventory tracking, sales recording, and coordinates with the Python ML microservice to trigger and retrieve demand forecasting models.

---

## 🚀 Features

- **Product Inventory Management**: CRUD API for products including tracking current stock, prices, SKU codes, categories, and safety stock thresholds.
- **Sales Logging & Analytics**: Records sales transactions and calculates real-time dashboard metrics (e.g., total revenue, category distributions, top-selling products).
- **ML Integration**: Connects to the FastAPI microservice to feed raw historical sales and fetch multi-day forward-looking Ridge Regression demand predictions.
- **Database Seeding**: Easily generates 90 days of daily historical sales curves featuring realistic seasonality (e.g., weekend shopping spikes) and growth trends.

---

## 🛠️ Tech Stack

- **Node.js** & **Express.js** (ES Modules)
- **MongoDB** & **Mongoose** (ODM)
- **Axios** (for communication with the Python FastAPI service)
- **Nodemon** (for hot-reloading development environment)

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory (you can copy `.env.example` as a template):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_forecasting
ML_SERVICE_URL=http://127.0.0.1:8000
```

---

## 📦 API Endpoints

### Products (`/api/products`)
- `GET /` - Retrieve all products.
- `POST /` - Add a new product.
- `GET /:id` - Get a specific product by its ID.
- `PUT /:id` - Update product details (e.g., edit current stock or price).
- `DELETE /:id` - Remove a product from database.

### Sales (`/api/sales`)
- `GET /` - Retrieve raw list of sales records.
- `POST /` - Register a new sale (reduces current stock of the product).
- `GET /stats` - Fetch aggregated sales metrics for dashboard overview (total revenue, item counts, top products, category breakdown).

### Forecasts (`/api/forecast`)
- `POST /generate` - Generate/refresh forecasts. Accepts a JSON body:
  ```json
  {
    "productId": "OPTIONAL_MONGO_ID_STRING",
    "daysToForecast": 30
  }
  ```
  *(If `productId` is omitted, forecasts are triggered and saved for all products in the database).*
- `GET /:productId` - Retrieve a unified payload containing the product details, historical sales logs, and generated forecasts sorted chronologically.

---

## 💻 Commands

Inside the `backend/` directory, you can run the following npm scripts:

```bash
# Install dependencies
npm install

# Seed the database with sample products and 90-day history
npm run seed

# Run the API server in hot-reloading development mode
npm run dev

# Run the API server in production mode
npm start
```
