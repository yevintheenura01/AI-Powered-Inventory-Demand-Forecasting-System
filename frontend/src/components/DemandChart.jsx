import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
} from 'recharts';

const DemandChart = ({ history, forecast, productName }) => {
  // Combine history and forecast into a single timeline for the chart
  const data = [];

  // Add historical sales
  history.forEach((h) => {
    data.push({
      date: h.date,
      historical: h.quantity,
      forecast: null,
      lower: null,
      upper: null,
    });
  });

  // To make a continuous line, link the last point of history to the forecast line
  if (history.length > 0 && forecast.length > 0) {
    const lastHist = history[history.length - 1];
    data.push({
      date: lastHist.date,
      historical: lastHist.quantity,
      forecast: lastHist.quantity,
      lower: lastHist.quantity,
      upper: lastHist.quantity,
    });
  }

  // Add forecasts
  forecast.forEach((f) => {
    data.push({
      date: f.date,
      historical: null,
      forecast: f.predicted,
      lower: f.lowerBound,
      upper: f.upperBound,
    });
  });

  // Custom tooltips for clean styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="custom-tooltip-title">{label}</p>
          {payload.map((item, idx) => {
            if (item.value === null || item.value === undefined) return null;
            return (
              <div key={idx} className="custom-tooltip-item" style={{ color: item.color }}>
                <span>{item.name}:</span>
                <span style={{ fontWeight: 600 }}>{parseFloat(item.value).toFixed(1)} units</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {/* Linear gradient for historical line glow */}
            <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            {/* Linear gradient for forecast range glow */}
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          
          <XAxis
            dataKey="date"
            stroke="var(--text-dim)"
            fontSize={11}
            tickLine={false}
            dy={10}
          />
          <YAxis
            stroke="var(--text-dim)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-5}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
          />

          {/* Forecast Uncertainty Envelope (shaded using upper-lower masking helper) */}
          <Area
            name="Uncertainty Range"
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="rgba(139, 92, 246, 0.08)"
            legendType="none"
          />

          {/* Historical sales line */}
          <Line
            name="Historical Sales"
            type="monotone"
            dataKey="historical"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6 }}
          />

          {/* Predicted sales line */}
          <Line
            name="Predicted Demand"
            type="monotone"
            dataKey="forecast"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DemandChart;
