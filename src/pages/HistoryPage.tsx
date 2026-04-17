import { useState } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '../store/useModels';
import { useHistory } from '../store/useHistory';
import { DiffViewer } from '../components/DiffViewer';
import { History, Zap, FlaskConical, Package, Rocket, Undo2, GitBranch } from 'lucide-react';
import { formatDate, formatNumber } from '../lib/utils';

const BORDER = 'border-white/[0.07]';
const MUTED = 'text-[#c8c8c8]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';

const EVENT_TAGS: Record<string, string> = {
  Train: 'text-white',
  Validate: 'text-white',
  Export: 'text-white',
  Deploy: 'text-emerald-500',
  Rollback: 'text-[#c8c8c8]',
};

const EVENT_ICONS: Record<string, typeof Zap> = {
  Train: Zap,
  Validate: FlaskConical,
  Export: Package,
  Deploy: Rocket,
  Rollback: Undo2,
};

export const HistoryPage = () => {
  const { models } = useModels();
  const { events } = useHistory();

  const [selectedModel1, setSelectedModel1] = useState('');
  const [selectedModel2, setSelectedModel2] = useState('');

  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const model1 = models.find(m => m.id === selectedModel1);
  const model2 = models.find(m => m.id === selectedModel2);

  const getDiffItems = () => {
    if (!model1 || !model2) return [];
    const diffs: Array<{ key: string; oldValue: string | number; newValue: string | number; type?: 'number' | 'string' }> = [];
    const allKeys = new Set([...Object.keys(model1.hyperparams || {}), ...Object.keys(model2.hyperparams || {})]);
    allKeys.forEach(key => {
      const val1 = model1.hyperparams[key];
      const val2 = model2.hyperparams[key];
      if (val1 !== val2) diffs.push({ key: `hyperparams.${key}`, oldValue: val1?.toString() || 'N/A', newValue: val2?.toString() || 'N/A', type: typeof val1 === 'number' ? 'number' : 'string' });
    });
    if (model1.metrics && model2.metrics) {
      if (model1.metrics.accuracy !== model2.metrics.accuracy) diffs.push({ key: 'metrics.accuracy', oldValue: formatNumber(model1.metrics.accuracy * 100, 2) + '%', newValue: formatNumber(model2.metrics.accuracy * 100, 2) + '%', type: 'number' });
      if (model1.metrics.loss !== model2.metrics.loss) diffs.push({ key: 'metrics.loss', oldValue: formatNumber(model1.metrics.loss, 4), newValue: formatNumber(model2.metrics.loss, 4), type: 'number' });
    }
    if (model1.framework !== model2.framework) diffs.push({ key: 'framework', oldValue: model1.framework, newValue: model2.framework, type: 'string' });
    if (model1.datasetVersion !== model2.datasetVersion) diffs.push({ key: 'dataset', oldValue: model1.datasetVersion, newValue: model2.datasetVersion, type: 'string' });
    return diffs;
  };

  const diffItems = getDiffItems();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full overflow-x-hidden md:overflow-visible">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
        {/* Header */}
        <div className={`pb-10 border-b ${BORDER}`}>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">Model History</h1>
          <p className={`text-sm ${MUTED}`}>Timeline and version comparison</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
          {/* Timeline */}
          <div>
            <p className={`text-xs ${DIMMER} uppercase tracking-widest mb-6`}>Event Timeline</p>
            <div className={`border ${BORDER} divide-y divide-white/[0.07] max-h-[600px] overflow-y-auto`}>
              {sortedEvents.length === 0 ? (
                <div className="py-16 text-center">
                  <History className={`w-8 h-8 ${DIMMER} mx-auto mb-3`} />
                  <p className={`text-sm ${MUTED}`}>No events yet</p>
                </div>
              ) : (
                sortedEvents.map((event, index) => {
                  const Icon = EVENT_ICONS[event.type] || History;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                      className="px-5 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${EVENT_TAGS[event.type] || DIMMER}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${EVENT_TAGS[event.type] || 'text-white'}`}>{event.type}</span>
                            <span className={`text-xs font-mono ${DIM}`}>{event.modelVersion}</span>
                          </div>
                          <p className={`text-sm ${MUTED} leading-relaxed`}>{event.details}</p>
                          <div className={`text-xs ${DIMMER} mt-1`}>{formatDate(event.timestamp)}</div>
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className={`mt-2 text-xs font-mono ${DIMMER} bg-white/[0.02] px-3 py-2`}>
                              {JSON.stringify(event.metadata, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Diff Viewer */}
          <div className="space-y-6">
            <p className={`text-xs ${DIMMER} uppercase tracking-widest`}>Compare Versions</p>
            <div className="space-y-4">
              {[{ label: 'Base Version', value: selectedModel1, setter: setSelectedModel1, placeholder: 'Select base model...' },
              { label: 'Compare To', value: selectedModel2, setter: setSelectedModel2, placeholder: 'Select comparison model...' }].map(({ label, value, setter, placeholder }) => (
                <div key={label}>
                  <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>{label}</label>
                  <select
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className={`w-full bg-transparent border ${BORDER} px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20`}
                  >
                    <option value="" className="bg-[#0c0c0c]">{placeholder}</option>
                    {models.map(model => (
                      <option key={model.id} value={model.id} className="bg-[#0c0c0c]" disabled={model.id === (label === 'Compare To' ? selectedModel1 : selectedModel2)}>
                        {model.version} — {model.framework}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {model1 && model2 && diffItems.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DiffViewer oldVersion={model1.version} newVersion={model2.version} diffs={diffItems} />
              </motion.div>
            ) : selectedModel1 && selectedModel2 ? (
              <div className={`border ${BORDER} p-12 text-center`}>
                <p className={`text-sm ${MUTED}`}>No differences found between these versions</p>
              </div>
            ) : (
              <div className={`border ${BORDER} p-12 text-center`}>
                <GitBranch className={`w-8 h-8 ${DIMMER} mx-auto mb-3`} />
                <p className={`text-sm ${MUTED}`}>Select two models to compare</p>
              </div>
            )}

            {(model1 || model2) && (
              <div className={`border ${BORDER} divide-y divide-white/[0.07]`}>
                {[{ m: model1, label: 'Base' }, { m: model2, label: 'Compare' }].map(({ m, label }) => m && (
                  <div key={label} className="p-4">
                    <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-2`}>{label}</div>
                    <div className="text-sm font-mono text-white mb-1">{m.version}</div>
                    <div className={`text-xs ${DIM} space-y-0.5`}>
                      <div>Framework: {m.framework}</div>
                      <div>Dataset: {m.datasetVersion}</div>
                      {m.metrics && <><div>Accuracy: {formatNumber(m.metrics.accuracy * 100, 2)}%</div><div>Loss: {formatNumber(m.metrics.loss, 4)}</div></>}
                      {m.validation && <div>Validated in: {m.validation.simulator}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
