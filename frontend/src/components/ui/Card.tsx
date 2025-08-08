import React from 'react';

type CardProps = {
  title?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md';
};

const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5'
}

export const Card: React.FC<CardProps> = ({ title, actions, children, className, footer, padding = 'md' }) => {
  return (
    <div className={`
        bg-gray-800/50 rounded-lg border border-gray-700/50 shadow-lg backdrop-blur-sm
        flex flex-col
        ${className}
    `}>
      {(title || actions) && (
        <div className="px-5 py-4 border-b border-gray-700/50 flex items-center justify-between">
          {title && <h3 className="text-base font-bold text-white">{title}</h3>}
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      )}
      <div className={`flex-grow ${paddingStyles[padding]}`}>
        {children}
      </div>
      {footer && (
        <div className="px-5 py-3 border-t border-gray-700/50 text-sm text-gray-400">
            {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
