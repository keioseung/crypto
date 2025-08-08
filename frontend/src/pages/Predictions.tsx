import React from 'react';

const Predictions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Predictions</h2>
        <p className="text-gray-600">AI-powered cryptocurrency price predictions</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BTC/KRW Prediction</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Predicted Price: ₩47,500,000</p>
            <p className="text-sm text-gray-600">Confidence: 85%</p>
            <p className="text-sm text-green-600">Trend: Bullish</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ETH/KRW Prediction</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Predicted Price: ₩3,150,000</p>
            <p className="text-sm text-gray-600">Confidence: 72%</p>
            <p className="text-sm text-red-600">Trend: Bearish</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
