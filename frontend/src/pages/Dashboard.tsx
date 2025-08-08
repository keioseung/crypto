import React from 'react';
import { KPI } from '@/components/ui/KPI';
import Card from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Market Cap" value="$1.23T" delta="+2.4%" icon={TrendingUp} accent="green" />
        <KPI label="24h Volume" value="$68.4B" delta="-1.1%" icon={Activity} accent="yellow" />
        <KPI label="BTC Dominance" value="52.1%" delta="+0.3%" icon={BarChart3} accent="blue" />
        <KPI label="Active Markets" value={384} icon={Activity} accent="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Market Performance">
          <div className="h-64 grid place-items-center text-dark-300">
            {/* TODO: Insert chart.js line chart */}
            <SkeletonCard />
          </div>
        </Card>
        <Card title="Top Gainers">
          <div className="space-y-3 text-sm">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-white/80">COIN{i}</span>
                <span className="text-emerald-400 font-medium">+{(Math.random()*8+2).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Top Losers">
          <div className="space-y-3 text-sm">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-white/80">COIN{i+5}</span>
                <span className="text-rose-400 font-medium">-{(Math.random()*8+2).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
