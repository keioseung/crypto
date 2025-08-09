import React from 'react';

type ChipVariant = 'primary' | 'outline';

type ChipProps = {
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  label?: string;
  variant?: ChipVariant;
};

const Chip: React.FC<ChipProps> = ({ active = false, onClick, children, label, variant = 'outline' }) => {
  const isPrimary = variant === 'primary' || active;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
        isPrimary
          ? 'bg-primary-600/20 border-primary-600 text-white'
          : 'bg-dark-800 border-dark-700 text-dark-200 hover:bg-dark-700'
      }`}
    >
      {label ?? children}
    </button>
  );
};

export default Chip;
