import React from 'react';

const Markets: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Markets</h2>
        <p className="text-gray-600">Real-time cryptocurrency market data from Upbit</p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">BTC/KRW</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₩45,000,000</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+2.5%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,234 BTC</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ETH/KRW</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₩3,200,000</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">-1.2%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5,678 ETH</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Markets;
