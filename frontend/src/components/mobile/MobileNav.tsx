import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LineChart, Activity, Cpu, Wallet, FlaskConical } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/markets', icon: LineChart, label: 'Markets' },
  { to: '/predictions', icon: Cpu, label: 'AI' },
  { to: '/research', icon: FlaskConical as any, label: 'Lab' },
  { to: '/portfolio', icon: Wallet, label: 'Portfolio' },
];

const MobileNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-dark-900/80 backdrop-blur border-t border-dark-800 md:hidden">
      <div className="grid grid-cols-5">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} className={({isActive})=>`py-2 flex flex-col items-center text-xs ${isActive?'text-white':'text-dark-300'}`}>
            <t.icon className="h-5 w-5" />
            <span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
