import React from 'react';
import { LayoutDashboard, Boxes, TrendingUp, Cpu } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, systemStatus }) => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <Cpu size={24} className="trend-up" />
        <span className="logo-text">Aegis Forecast</span>
      </div>

      <nav className="nav-menu">
        <a
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </a>

        <a
          className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Boxes size={18} />
          <span>Inventory Manager</span>
        </a>

        <a
          className={`nav-item ${activeTab === 'forecasting' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecasting')}
        >
          <TrendingUp size={18} />
          <span>Demand Forecast</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <div className={`status-dot ${systemStatus.loading ? 'loading' : ''}`} />
          <span>
            {systemStatus.loading
              ? 'Computing Forecasts...'
              : 'ML Engines Online'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
