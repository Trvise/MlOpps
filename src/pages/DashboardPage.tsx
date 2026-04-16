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
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatNumber } from '../lib/utils';

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      idle: { bg: 'bg-slate-700', text: 'text-slate-300', icon: Clock },
      training: { bg: 'bg-blue-500', text: 'text-white', icon: Zap },
      validating: { bg: 'bg-purple-500', text: 'text-white', icon: FlaskConical },
      exporting: { bg: 'bg-yellow-500', text: 'text-white', icon: Package },
      deployed: { bg: 'bg-green-500', text: 'text-white', icon: CheckCircle2 },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.idle;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-white mb-3 tracking-tight">Model Dashboard</h1>
          <p className="text-slate-400 text-lg">Manage and monitor your ML model lifecycle</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCard
            label="Total Models"
            value={totalModels}
            icon={Package}
          />
          <MetricCard
            label="Trained Models"
            value={trainedModels}
            icon={Zap}
            trend="up"
          />
          <MetricCard
            label="Deployed Models"
            value={deployedModels}
            icon={Rocket}
            trend="up"
          />
          <MetricCard
            label="Avg Accuracy"
            value={`${formatNumber(avgAccuracy * 100, 1)}%`}
            icon={CheckCircle2}
            trend={avgAccuracy > 0.9 ? 'up' : 'neutral'}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 mb-12">
          <h2 className="text-xl font-medium text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/dashboard/train')}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
            >
              <Zap className="w-5 h-5" />
              New Training
            </button>
            <button
              onClick={() => navigate('/dashboard/validate')}
              className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all border border-slate-700/50"
            >
              <FlaskConical className="w-5 h-5" />
              Validate Model
            </button>
            <button
              onClick={() => navigate('/dashboard/export')}
              className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all border border-slate-700/50"
            >
              <Package className="w-5 h-5" />
              Export Model
            </button>
            <button
              onClick={() => navigate('/dashboard/deploy')}
              className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all border border-slate-700/50"
            >
              <Rocket className="w-5 h-5" />
              Deploy to Fleet
            </button>
          </div>
        </div>

        {/* Models Table */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-800/50">
            <h2 className="text-xl font-medium text-white">All Models</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/20">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Framework
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Dataset
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Loss
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {models.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No models yet. Create your first training run!</p>
                      <button
                        onClick={() => navigate('/dashboard/train')}
                        className="mt-4 text-amber-400 hover:text-amber-300 font-medium"
                      >
                        Start Training →
                      </button>
                    </td>
                  </tr>
                ) : (
                  models.map((model) => (
                    <motion.tr
                      key={model.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-800/20 transition-colors cursor-pointer"
                      onClick={() => navigate('/dashboard/history')}
                    >
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-amber-400">{model.version}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{model.framework}</div>
                        <div className="text-xs text-slate-500 mt-1">{model.componentType}</div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-blue-400">{model.datasetVersion}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm text-green-400">
                          {model.metrics ? `${formatNumber(model.metrics.accuracy * 100, 2)}%` : '-'}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm text-orange-400">
                          {model.metrics ? formatNumber(model.metrics.loss, 3) : '-'}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        {getStatusBadge(model.status)}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-400">{formatDate(model.createdAt)}</span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

