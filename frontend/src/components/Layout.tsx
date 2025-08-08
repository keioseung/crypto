import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import MobileNav from '@/components/mobile/MobileNav';

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/markets', label: 'Markets' },
  { to: '/predictions', label: 'Predictions' },
  { to: '/technical', label: 'Technical' },
  { to: '/backtesting', label: 'Backtesting' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/settings', label: 'Settings' },
];

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 text-white pb-16 md:pb-0">
      <header className="sticky top-0 z-30 bg-dark-900/70 backdrop-blur border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="font-bold">CryptoAI</div>
          <nav className="hidden md:flex gap-4 text-sm">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => `px-2 py-1 rounded ${isActive ? 'bg-dark-800 text-white' : 'text-dark-300 hover:text-white'}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default Layout;
