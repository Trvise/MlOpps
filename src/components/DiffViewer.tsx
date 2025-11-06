import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DiffItem {
  key: string;
  oldValue: string | number;
  newValue: string | number;
  type?: 'number' | 'string';
}

interface DiffViewerProps {
  oldVersion: string;
  newVersion: string;
  diffs: DiffItem[];
}

export const DiffViewer = ({ oldVersion, newVersion, diffs }: DiffViewerProps) => {
  const getTrendIcon = (oldVal: number, newVal: number) => {
    if (newVal > oldVal) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (newVal < oldVal) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
      <div className="bg-slate-800/30 px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-slate-400">{oldVersion}</span>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-mono text-cyan-400">{newVersion}</span>
        </div>
      </div>
      <div className="divide-y divide-slate-800">
        {diffs.map((diff, index) => (
          <motion.div
            key={diff.key}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400 font-medium">{diff.key}</div>
              {diff.type === 'number' && getTrendIcon(Number(diff.oldValue), Number(diff.newValue))}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                <div className="text-xs text-red-400 mb-1">Old</div>
                <div className="font-mono text-sm text-white">{diff.oldValue}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded px-3 py-2">
                <div className="text-xs text-green-400 mb-1">New</div>
                <div className="font-mono text-sm text-white">{diff.newValue}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

