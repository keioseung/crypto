import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">CryptoAI</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-gray-900">Dashboard</a>
              <a href="/markets" className="text-gray-500 hover:text-gray-900">Markets</a>
              <a href="/predictions" className="text-gray-500 hover:text-gray-900">Predictions</a>
              <a href="/technical" className="text-gray-500 hover:text-gray-900">Technical</a>
              <a href="/backtesting" className="text-gray-500 hover:text-gray-900">Backtesting</a>
              <a href="/portfolio" className="text-gray-500 hover:text-gray-900">Portfolio</a>
              <a href="/settings" className="text-gray-500 hover:text-gray-900">Settings</a>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
