import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useModels } from '../store/useModels';
import { MetricCard } from '../components/MetricCard';
import {
  Zap,
  FlaskConical,
  Package,
  Rocket,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatNumber } from '../lib/utils';

const BORDER = 'border-white/[0.07]';
const MUTED = 'text-[#c8c8c8]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    idle: 'text-[#999]',
    training: 'text-[#c8c8c8]',
    validating: 'text-[#c8c8c8]',
    exporting: 'text-[#c8c8c8]',
    deployed: 'text-emerald-500',
  };
  return styles[status] ?? 'text-[#999]';
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { models } = useModels();

  const totalModels = models.length;
  const trainedModels = models.filter(m => m.metrics).length;
  const deployedModels = models.filter(m => m.status === 'deployed').length;

  const avgAccuracy = models.length > 0
    ? models.filter(m => m.metrics).reduce((acc, m) => acc + (m.metrics?.accuracy || 0), 0) /
    (models.filter(m => m.metrics).length || 1)
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto overflow-hidden text-ellipsis">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        {/* Demo Notice */}
        <div className={`mb-8 border ${BORDER} bg-[#E8B84B]/[0.04] px-5 py-3.5 flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono font-medium tracking-widest uppercase text-[#E8B84B] border border-[#E8B84B]/30 px-1.5 py-0.5 leading-none flex-shrink-0">DEMO</span>
            <span className={`text-xs ${MUTED}`}>This is a demo environment with simulated data. All pipeline actions are non-functional.</span>
          </div>
          <span className={`text-[11px] ${DIM} flex-shrink-0`}>Real setup <span className="text-[#E8B84B]">coming soon</span></span>
        </div>

        {/* Header */}
        <div className={`pb-10 border-b ${BORDER}`}>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">Model Dashboard</h1>
          <p className={`text-sm ${MUTED}`}>Manage and monitor your ML model lifecycle</p>
        </div>

        {/* Metrics Grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-0 border-b ${BORDER} mb-0`}>
          <div className={`border-r ${BORDER} pr-8 pt-8`}>
            <MetricCard label="Total Models" value={totalModels} icon={Package} />
          </div>
          <div className={`border-r ${BORDER} px-8 pt-8`}>
            <MetricCard label="Trained Models" value={trainedModels} icon={Zap} />
          </div>
          <div className={`border-r ${BORDER} px-8 pt-8`}>
            <MetricCard label="Deployed" value={deployedModels} icon={Rocket} />
          </div>
          <div className="pl-8 pt-8">
            <MetricCard label="Avg Accuracy" value={`${formatNumber(avgAccuracy * 100, 1)}%`} icon={CheckCircle2} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`py-6 md:py-10 border-b ${BORDER}`}>
          <p className={`text-xs ${DIMMER} uppercase tracking-widest mb-6`}>Quick Actions</p>
          <div className="flex flex-wrap gap-4 md:gap-8">
            {[
              { label: 'New Training Run', path: '/dashboard/train', icon: Zap },
              { label: 'Validate Model', path: '/dashboard/validate', icon: FlaskConical },
              { label: 'Export Model', path: '/dashboard/export', icon: Package },
              { label: 'Deploy to Fleet', path: '/dashboard/deploy', icon: Rocket },
            ].map(({ label, path, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-2 text-sm ${DIM} hover:text-white transition-colors group`}
              >
                <Icon className={`w-3.5 h-3.5 ${DIMMER} group-hover:text-white transition-colors`} />
                {label} →
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 md:mt-10 overflow-hidden text-ellipsis w-[calc(100vw-2rem)] md:w-auto">
          <p className={`text-xs ${DIMMER} uppercase tracking-widest mb-6`}>All Models</p>
          <div className={`border ${BORDER} overflow-x-auto overflow-y-hidden`}>
            <div className="min-w-[800px]">
              {/* Table header */}
              <div className={`grid grid-cols-7 gap-0 border-b ${BORDER} px-6 py-3`}>
                {['Version', 'Framework', 'Dataset', 'Accuracy', 'Loss', 'Status', 'Created'].map(col => (
                  <div key={col} className={`text-xs ${DIMMER} uppercase tracking-widest`}>{col}</div>
                ))}
              </div>

              {/* Table body */}
              {models.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <AlertCircle className={`w-8 h-8 ${DIMMER} mx-auto mb-4`} />
                  <p className={`text-sm ${MUTED} mb-4`}>No models yet. Create your first training run.</p>
                  <button
                    onClick={() => navigate('/dashboard/train')}
                    className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors`}
                  >
                    Start Training →
                  </button>
                </div>
              ) : (
                models.map((model, i) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`grid grid-cols-7 gap-0 px-6 py-4 border-b last:border-0 ${BORDER} hover:bg-white/[0.02] transition-colors cursor-pointer`}
                    onClick={() => navigate('/dashboard/history')}
                  >
                    <div className="text-sm font-mono text-white">{model.version}</div>
                    <div>
                      <div className={`text-sm text-white`}>{model.framework}</div>
                      <div className={`text-xs ${DIMMER} mt-0.5`}>{model.componentType}</div>
                    </div>
                    <div className={`text-sm font-mono ${DIM}`}>{model.datasetVersion}</div>
                    <div className="text-sm text-white">
                      {model.metrics ? `${formatNumber(model.metrics.accuracy * 100, 2)}%` : '—'}
                    </div>
                    <div className={`text-sm ${MUTED}`}>
                      {model.metrics ? formatNumber(model.metrics.loss, 3) : '—'}
                    </div>
                    <div className={`text-xs font-mono ${getStatusStyle(model.status)}`}>
                      {model.status}
                    </div>
                    <div className={`text-sm ${DIMMER}`}>{formatDate(model.createdAt)}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
