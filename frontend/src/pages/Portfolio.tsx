import React from 'react';

const Portfolio: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio</h2>
        <p className="text-gray-600">Your cryptocurrency investment portfolio</p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">₩12,450,000</p>
            <p className="text-sm text-gray-600">Total Value</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">+8.5%</p>
            <p className="text-sm text-gray-600">24h Change</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">₩1,250,000</p>
            <p className="text-sm text-gray-600">Total P&L</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Holdings</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Bitcoin (BTC)</p>
              <p className="text-sm text-gray-600">0.25 BTC</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">₩11,250,000</p>
              <p className="text-sm text-green-600">+12.3%</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Ethereum (ETH)</p>
              <p className="text-sm text-gray-600">3.5 ETH</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">₩1,200,000</p>
              <p className="text-sm text-red-600">-2.1%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
