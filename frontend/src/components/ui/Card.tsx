import React from 'react';

type CardProps = {
  title?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ title, actions, children }) => {
  return (
    <div className="rounded-xl border border-dark-800 bg-dark-900/60 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
      {(title || actions) && (
        <div className="px-4 sm:px-5 py-3 border-b border-dark-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/90">{title}</h3>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
};

export default Card;
