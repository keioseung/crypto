import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
        <p className="text-gray-600">Configure your CryptoAI preferences</p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Backend URL</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://your-backend-url.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WebSocket URL</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="wss://your-websocket-url.com"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Dark Mode</span>
            <button className="bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full">
              <span className="sr-only">Enable dark mode</span>
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Real-time Updates</span>
            <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
              <span className="sr-only">Enable real-time updates</span>
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-5"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
