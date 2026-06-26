import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Inventory from './pages/Inventory';
import ForecastDetails from './pages/ForecastDetails';
import useStore from './store/useStore';
import './styles/dashboard.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const { loading } = useStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'inventory':
        return <Inventory />;
      case 'forecasting':
        return <ForecastDetails />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={{ loading }}
      />
      
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
