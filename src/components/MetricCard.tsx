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
      whileHover={{ scale: 1.01 }}
      className={cn(
        'bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-colors',
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
        <div className="w-12 h-12 bg-slate-800/50 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
      </div>
    </motion.div>
  );
};

