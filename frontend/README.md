# Inventory & Demand Forecasting Frontend Webapp

This is the React web application for the AI-Powered Inventory & Demand Forecasting System. It provides an interactive dashboard built on top of Vite, styling with raw CSS, and global state management using Zustand.

---

## 🎨 Features & Pages

The user interface is structured into three main pages:

1. **Dashboard Overview (`Overview.jsx`)**
   - High-level metrics: Total Revenue, Total Products, Low Stock Alert Count, Forecasted Demand.
   - Low Stock warning widget displaying products that fall below safety stock limits.
   - Quick telemetry insights to ensure data is synced.

2. **Inventory Manager (`Inventory.jsx`)**
   - Interactive data table listing all products, SKUs, Categories, Prices, Stock levels, and Units.
   - Filters to search by name/SKU and filter by category or stock warning level.
   - Integrated Modals to **Create** new products and **Update** existing items (adjust pricing, restock items).

3. **Forecast Analytics (`ForecastDetails.jsx`)**
   - Product selector interface displaying details of each individual item.
   - On-demand **"Generate/Recalculate Forecast"** trigger that calls the ML engine to refresh predictions.
   - Dynamic canvas/SVG chart (`DemandChart.jsx`) mapping:
     - **Historical Sales (Blue)**: Real daily quantities sold.
     - **Predicted Forecast (Orange)**: Linear/seasonal trend projection for the next 30 days.
     - **95% Confidence Bounds (Light Orange Shaded Area)**: Showing the upper and lower range of potential inventory demands for buffer calculations.

---

## 🛠️ Tech Stack

- **React** (v19)
- **Vite** (Build Tool & Dev Server)
- **Zustand** (Flux-like micro state management)
- **Oxlint** (Ultrafast linter)
- **Vanilla CSS** (Modular component-oriented stylesheets under `src/styles/dashboard.css`)

---

## ⚡ State Management (Zustand)

Global actions and data structures are centralized in `src/store/useStore.js`. The store maintains:
- `products`: Active catalog list.
- `salesStats`: Aggregated dashboard summaries.
- `activeProductForecast`: Selected product history and forecast predictions.
- `loading` / `error`: API state tracking.

---

## 💻 Commands

Inside the `frontend/` directory, you can run the following npm scripts:

```bash
# Install dependencies
npm install

# Run Vite dev server (runs on http://localhost:5173)
npm run dev

# Run Oxlint to lint the React codebase
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
