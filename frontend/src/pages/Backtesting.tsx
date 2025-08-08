import React from 'react';

const Backtesting: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Backtesting</h2>
        <p className="text-gray-600">Test your trading strategies with historical data</p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">+15.2%</p>
            <p className="text-sm text-gray-600">Total Return</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">0.85</p>
            <p className="text-sm text-gray-600">Sharpe Ratio</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">12.5%</p>
            <p className="text-sm text-gray-600">Max Drawdown</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">68%</p>
            <p className="text-sm text-gray-600">Win Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backtesting;
