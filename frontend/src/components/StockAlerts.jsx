import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

const StockAlerts = ({ products }) => {
  const alerts = [];

  products.forEach((product) => {
    if (product.currentStock === 0) {
      alerts.push({
        id: product._id,
        type: 'danger',
        title: 'Critical Stockout',
        message: `"${product.name}" has completely run out of stock. Immediate replenishment required!`,
        icon: <ShieldAlert className="trend-down" size={20} />,
      });
    } else if (product.currentStock < product.safetyStock) {
      alerts.push({
        id: product._id,
        type: 'warning',
        title: 'Low Stock Warning',
        message: `"${product.name}" stock is at ${product.currentStock} ${product.unit} (Safety Threshold: ${product.safetyStock}). Risk of stockout.`,
        icon: <AlertTriangle className="trend-up" size={20} />,
      });
    }
  });

  return (
    <div className="glass-card">
      <div className="card-header-flex">
        <h3 className="card-title">Replenishment Alert Center</h3>
        <span className="badge badge-danger">{alerts.length} Warnings</span>
      </div>

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="empty-state" style={{ padding: '1rem' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>✓ All Inventory Levels Secure</span>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>No products have crossed below their safety stock thresholds.</p>
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} className={`alert-item ${alert.type}`}>
              <div style={{ marginTop: '2px' }}>{alert.icon}</div>
              <div className="alert-content">
                <h4 style={{ color: alert.type === 'danger' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                  {alert.title}
                </h4>
                <p>{alert.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockAlerts;
