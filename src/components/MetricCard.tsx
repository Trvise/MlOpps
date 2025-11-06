import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const MetricCard = ({ label, value, icon: Icon, trend, className }: MetricCardProps) => {
  const trendColor = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        'bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-blue-500/30 transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-400 mb-1">{label}</div>
          <div className={cn('text-2xl font-bold', trend ? trendColor[trend] : 'text-white')}>
            {value}
          </div>
        </div>
        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-amber-400" />
        </div>
      </div>
    </motion.div>
  );
};

