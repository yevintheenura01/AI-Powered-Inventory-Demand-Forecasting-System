import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import MetricCard from '../components/MetricCard';
import StockAlerts from '../components/StockAlerts';
import DemandChart from '../components/DemandChart';
import { DollarSign, ShoppingCart, AlertTriangle, Layers, RefreshCw } from 'lucide-react';

const Overview = () => {
  const {
    products,
    salesStats,
    activeProductForecast,
    fetchProducts,
    fetchSalesStats,
    fetchForecast,
    generateForecast,
    loading,
  } = useStore();

  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchSalesStats();
  }, [fetchProducts, fetchSalesStats]);

  useEffect(() => {
    if (products.length > 0) {
      // Set the first product as active if none selected
      if (!selectedProductId) {
        setSelectedProductId(products[0]._id);
      }
    }
  }, [products, selectedProductId]);

  useEffect(() => {
    if (selectedProductId) {
      fetchForecast(selectedProductId);
    }
  }, [selectedProductId, fetchForecast]);

  const handleProductChange = (e) => {
    setSelectedProductId(e.target.value);
  };

  const handleRunForecast = async () => {
    if (selectedProductId) {
      try {
        await generateForecast(selectedProductId);
        alert('AI Demand forecast refreshed successfully!');
      } catch (err) {
        alert(`Failed to compute forecast: ${err.message}`);
      }
    }
  };

  const lowStockCount = products.filter(p => p.currentStock < p.safetyStock).length;
  const criticalStockoutCount = products.filter(p => p.currentStock === 0).length;

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <h1>Inventory Intelligence Command</h1>
          <p>Predictive analytics & replenishment orchestrator</p>
        </div>
      </div>

      {/* Top Level Stats */}
      <div className="stats-grid">
        <MetricCard
          title="Total Sales Revenue"
          value={`$${salesStats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          subtext="across all channels"
        />
        <MetricCard
          title="Total Demand Fulfilled"
          value={`${salesStats.totalSalesCount.toLocaleString()} units`}
          icon={<ShoppingCart size={20} />}
          subtext="historical transactions"
        />
        <MetricCard
          title="Stockout Risk Warnings"
          value={`${lowStockCount} items`}
          icon={<AlertTriangle size={20} />}
          subtext={`${criticalStockoutCount} critical stockouts`}
        />
        <MetricCard
          title="Categories Managed"
          value={`${salesStats.categoryBreakdown.length}`}
          icon={<Layers size={20} />}
          subtext="diverse product lines"
        />
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Side: Forecasting Area */}
        <div className="glass-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-title">AI Predictive Demand Forecasting</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Ridge Regression model trained on seasonality, trend, and weekend weights
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                className="select-product-dropdown"
                value={selectedProductId}
                onChange={handleProductChange}
                disabled={products.length === 0}
              >
                {products.length === 0 ? (
                  <option>No Products Available</option>
                ) : (
                  products.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku})
                    </option>
                  ))
                )}
              </select>

              <button
                className="btn btn-secondary"
                onClick={handleRunForecast}
                disabled={loading || !selectedProductId}
                title="Trigger forecasting model recalculation"
              >
                <RefreshCw size={16} className={loading ? 'spinner' : ''} />
                <span>Forecast</span>
              </button>
            </div>
          </div>

          {activeProductForecast.product ? (
            <div>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Product: </span>
                  <span style={{ fontWeight: 600 }}>{activeProductForecast.product.name}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Category: </span>
                  <span style={{ fontWeight: 600 }}>{activeProductForecast.product.category}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Stock: </span>
                  <span style={{ fontWeight: 600 }}>
                    {activeProductForecast.product.currentStock} {activeProductForecast.product.unit}
                  </span>
                </div>
                {activeProductForecast.forecast.length > 0 && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Algorithm: </span>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
                      {activeProductForecast.forecast[0].modelType}
                    </span>
                  </div>
                )}
              </div>

              {activeProductForecast.history.length === 0 ? (
                <div className="empty-state">
                  <p>Insufficient transaction logs to generate forecasts. Register more sales for this product.</p>
                </div>
              ) : (
                <DemandChart
                  history={activeProductForecast.history}
                  forecast={activeProductForecast.forecast}
                  productName={activeProductForecast.product.name}
                />
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>Select a product to view the predictive forecasting timeline.</p>
            </div>
          )}
        </div>

        {/* Right Side: Alerts */}
        <StockAlerts products={products} />

        {/* Bottom Full Width Section: Top Selling Products */}
        <div className="glass-card grid-full-width">
          <div className="card-header-flex">
            <h3 className="card-title">Top Performing Products (by Revenue)</h3>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity Sold</th>
                  <th>Revenue Generated</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {salesStats.topProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state" style={{ textAlign: 'center' }}>
                      No sales recorded yet. Add products and log transactions.
                    </td>
                  </tr>
                ) : (
                  salesStats.topProducts.map((tp) => {
                    const match = products.find(p => p._id === tp.id);
                    const stock = match ? match.currentStock : 0;
                    const safety = match ? match.safetyStock : 0;
                    
                    let badge = <span className="badge badge-success">In Stock</span>;
                    if (stock === 0) {
                      badge = <span className="badge badge-danger">Out of Stock</span>;
                    } else if (stock < safety) {
                      badge = <span className="badge badge-warning">Low Stock</span>;
                    }

                    return (
                      <tr key={tp.id}>
                        <td style={{ fontWeight: 600 }}>{tp.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{tp.sku}</td>
                        <td>{tp.quantitySold} units</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                          ${tp.revenueGenerated.toLocaleString()}
                        </td>
                        <td>{badge}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
