import { useState } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '../store/useModels';
import { useHistory } from '../store/useHistory';
import { DiffViewer } from '../components/DiffViewer';
import { History, Zap, FlaskConical, Package, Rocket, Undo2, GitBranch } from 'lucide-react';
import { formatDate, formatNumber } from '../lib/utils';

export const HistoryPage = () => {
  const { models } = useModels();
  const { events } = useHistory();
  
  const [selectedModel1, setSelectedModel1] = useState('');
  const [selectedModel2, setSelectedModel2] = useState('');

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const model1 = models.find(m => m.id === selectedModel1);
  const model2 = models.find(m => m.id === selectedModel2);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Train':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'Validate':
        return <FlaskConical className="w-5 h-5 text-purple-400" />;
      case 'Export':
        return <Package className="w-5 h-5 text-yellow-400" />;
      case 'Deploy':
        return <Rocket className="w-5 h-5 text-green-400" />;
      case 'Rollback':
        return <Undo2 className="w-5 h-5 text-orange-400" />;
      default:
        return <History className="w-5 h-5 text-slate-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Train':
        return 'border-cyan-500/20 bg-cyan-500/5';
      case 'Validate':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'Export':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'Deploy':
        return 'border-green-500/20 bg-green-500/5';
      case 'Rollback':
        return 'border-orange-500/20 bg-orange-500/5';
      default:
        return 'border-slate-700 bg-slate-800/30';
    }
  };

  const getDiffItems = () => {
    if (!model1 || !model2) return [];

    const diffs: Array<{ key: string; oldValue: string | number; newValue: string | number; type?: 'number' | 'string' }> = [];

    // Compare hyperparameters
    const allKeys = new Set([
      ...Object.keys(model1.hyperparams || {}),
      ...Object.keys(model2.hyperparams || {})
    ]);

    allKeys.forEach(key => {
      const val1 = model1.hyperparams[key];
      const val2 = model2.hyperparams[key];
      if (val1 !== val2) {
        diffs.push({
          key: `hyperparams.${key}`,
          oldValue: val1?.toString() || 'N/A',
          newValue: val2?.toString() || 'N/A',
          type: typeof val1 === 'number' ? 'number' : 'string'
        });
      }
    });

    // Compare metrics
    if (model1.metrics && model2.metrics) {
      if (model1.metrics.accuracy !== model2.metrics.accuracy) {
        diffs.push({
          key: 'metrics.accuracy',
          oldValue: formatNumber(model1.metrics.accuracy * 100, 2) + '%',
          newValue: formatNumber(model2.metrics.accuracy * 100, 2) + '%',
          type: 'number'
        });
      }
      if (model1.metrics.loss !== model2.metrics.loss) {
        diffs.push({
          key: 'metrics.loss',
          oldValue: formatNumber(model1.metrics.loss, 4),
          newValue: formatNumber(model2.metrics.loss, 4),
          type: 'number'
        });
      }
    }

    // Compare framework
    if (model1.framework !== model2.framework) {
      diffs.push({
        key: 'framework',
        oldValue: model1.framework,
        newValue: model2.framework,
        type: 'string'
      });
    }

    // Compare dataset
    if (model1.datasetVersion !== model2.datasetVersion) {
      diffs.push({
        key: 'dataset',
        oldValue: model1.datasetVersion,
        newValue: model2.datasetVersion,
        type: 'string'
      });
    }

    return diffs;
  };

  const diffItems = getDiffItems();

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-white mb-3 tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-slate-400" />
            Model History
          </h1>
          <p className="text-lg text-slate-400">Timeline and version comparison</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-800/50 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-slate-400" />
                <h2 className="text-xl font-medium text-white">Event Timeline</h2>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto">
                {sortedEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400">No events yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border rounded-lg p-4 ${getEventColor(event.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getEventIcon(event.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{event.type}</span>
                              <span className="text-xs font-mono text-cyan-400">{event.modelVersion}</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-2">{event.details}</p>
                            <div className="text-xs text-slate-500">{formatDate(event.timestamp)}</div>
                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs font-mono text-slate-400">
                                {JSON.stringify(event.metadata, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diff Viewer */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8">
              <h2 className="text-xl font-medium text-white mb-6">Compare Versions</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Base Version
                  </label>
                  <select
                    value={selectedModel1}
                    onChange={(e) => setSelectedModel1(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select base model...</option>
                    {models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.version} - {model.framework}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Compare To
                  </label>
                  <select
                    value={selectedModel2}
                    onChange={(e) => setSelectedModel2(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select comparison model...</option>
                    {models.map(model => (
                      <option key={model.id} value={model.id} disabled={model.id === selectedModel1}>
                        {model.version} - {model.framework}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {model1 && model2 && diffItems.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DiffViewer
                  oldVersion={model1.version}
                  newVersion={model2.version}
                  diffs={diffItems}
                />
              </motion.div>
            ) : selectedModel1 && selectedModel2 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                <p className="text-slate-400">No differences found</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                <GitBranch className="w-16 h-16 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400">Select two models to compare</p>
              </div>
            )}

            {/* Model Details */}
            {(model1 || model2) && (
              <div className="space-y-4">
                {model1 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-2">Base Model Details</div>
                    <div className="font-mono text-sm text-cyan-400 mb-2">{model1.version}</div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>Framework: {model1.framework}</div>
                      <div>Dataset: {model1.datasetVersion}</div>
                      {model1.metrics && (
                        <>
                          <div>Accuracy: {formatNumber(model1.metrics.accuracy * 100, 2)}%</div>
                          <div>Loss: {formatNumber(model1.metrics.loss, 4)}</div>
                        </>
                      )}
                      {model1.validation && (
                        <div>Validated in: {model1.validation.simulator}</div>
                      )}
                    </div>
                  </div>
                )}
                {model2 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-2">Comparison Model Details</div>
                    <div className="font-mono text-sm text-cyan-400 mb-2">{model2.version}</div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>Framework: {model2.framework}</div>
                      <div>Dataset: {model2.datasetVersion}</div>
                      {model2.metrics && (
                        <>
                          <div>Accuracy: {formatNumber(model2.metrics.accuracy * 100, 2)}%</div>
                          <div>Loss: {formatNumber(model2.metrics.loss, 4)}</div>
                        </>
                      )}
                      {model2.validation && (
                        <div>Validated in: {model2.validation.simulator}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

