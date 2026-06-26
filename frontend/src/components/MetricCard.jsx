import React from 'react';

const MetricCard = ({ title, value, icon, subtext, trend, isTrendUp }) => {
  return (
    <div className="glass-card">
      <div className="stat-header">
        <span>{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      {subtext && (
        <div className="stat-meta">
          {trend && (
            <span className={isTrendUp ? 'trend-up' : 'trend-down'} style={{ marginRight: '4px', fontWeight: 600 }}>
              {trend}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
