import React from 'react';
import { LucideIcon } from 'lucide-react';

type KPIProps = {
  label: string;
  value: string | number;
  delta?: string;
  icon?: LucideIcon;
  accent?: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
};

const accentToClasses: Record<NonNullable<KPIProps['accent']>, string> = {
  green: 'from-emerald-500 to-emerald-600 text-emerald-100',
  red: 'from-rose-500 to-rose-600 text-rose-100',
  blue: 'from-sky-500 to-sky-600 text-sky-100',
  yellow: 'from-amber-500 to-amber-600 text-amber-100',
  purple: 'from-violet-500 to-violet-600 text-violet-100',
};

export const KPI: React.FC<KPIProps> = ({ label, value, delta, icon: Icon, accent = 'blue' }) => {
  return (
    <div className="glass-dark rounded-xl p-5 border border-dark-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-dark-300">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          {delta && (
            <p className={`mt-1 text-xs ${String(delta).startsWith('-') ? 'text-rose-400' : 'text-emerald-400'}`}>{delta}</p>
          )}
        </div>
        {Icon && (
          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${accentToClasses[accent]} flex items-center justify-center border border-white/10`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPI;
