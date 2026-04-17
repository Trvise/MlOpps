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

export const MetricCard = ({ label, value, icon: Icon, className }: MetricCardProps) => {
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
      className={cn(
        'border-b border-white/[0.07] py-6 px-0 transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[#777] uppercase tracking-widest mb-3">{label}</div>
          <div className="text-2xl font-light text-[#E8B84B]">{value}</div>
        </div>
        <Icon className="w-4 h-4 text-[#E8B84B] mt-1 flex-shrink-0" />
      </div>
    </motion.div>
  );
};
