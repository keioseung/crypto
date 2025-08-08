import React from 'react';

const TechnicalAnalysis: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Analysis</h2>
        <p className="text-gray-600">Advanced technical indicators and chart analysis</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">RSI</h3>
          <p className="text-2xl font-bold text-blue-600">65.4</p>
          <p className="text-sm text-gray-600">Neutral</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">MACD</h3>
          <p className="text-2xl font-bold text-green-600">+0.023</p>
          <p className="text-sm text-gray-600">Bullish</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bollinger Bands</h3>
          <p className="text-2xl font-bold text-yellow-600">Middle</p>
          <p className="text-sm text-gray-600">Normal Volatility</p>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;
