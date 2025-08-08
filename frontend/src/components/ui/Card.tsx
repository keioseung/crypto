import React from 'react';

type CardProps = {
  title?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ title, actions, children }) => {
  return (
    <div className="glass-dark rounded-xl border border-dark-700">
      {(title || actions) && (
        <div className="px-5 py-3 border-b border-dark-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/90">{title}</h3>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

export default Card;
