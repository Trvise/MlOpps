import { useState } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '../store/useModels';
import { useHistory } from '../store/useHistory';
import { simulateExport } from '../utils/jobOrchestration';
import { LogViewer } from '../components/LogViewer';
import { ProgressBar } from '../components/ProgressBar';
import { Package, CheckCircle2, FileCode, HardDrive } from 'lucide-react';
import { formatNumber, formatDate } from '../lib/utils';

const BORDER = 'border-white/[0.07]';
const MUTED = 'text-[#c8c8c8]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';

export const ExportPage = () => {
  const { models, startExport, completeExport, setJobProgress, clearJob, currentJob } = useModels();
  const { addEvent } = useHistory();

  const [selectedModelId, setSelectedModelId] = useState('');
  const [format, setFormat] = useState<'ONNX' | 'TensorRT' | 'TFLite'>('ONNX');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const validatedModels = models.filter(m => m.validation);
  const selectedModel = models.find(m => m.id === selectedModelId);
  const exportedModels = models.filter(m => m.export);

  const handleStartExport = () => {
    if (!selectedModelId) return;
    startExport(selectedModelId);
    setIsExporting(true);
    setExportComplete(false);
    const model = models.find(m => m.id === selectedModelId);
    if (model) addEvent({ modelVersion: model.version, type: 'Export', details: `Started export to ${format}`, metadata: { format } });
    simulateExport(
      (progress, logs) => { setJobProgress(progress, logs); },
      () => {
        completeExport(selectedModelId, format);
        clearJob();
        setIsExporting(false);
        setExportComplete(true);
        if (model) addEvent({ modelVersion: model.version, type: 'Export', details: `Export to ${format} completed` });
      }
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full overflow-x-hidden md:overflow-visible">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
        {/* Header */}
        <div className={`pb-10 border-b ${BORDER}`}>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">Export & Optimize</h1>
          <p className={`text-sm ${MUTED}`}>Convert models for deployment and optimization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
          {/* Config */}
          <div className="space-y-8">
            <div>
              <p className={`text-xs ${DIMMER} uppercase tracking-widest mb-4`}>Configuration</p>
              <div className="space-y-6">
                <div>
                  <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Select Model</label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    disabled={isExporting}
                    className={`w-full bg-transparent border ${BORDER} px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="" className="bg-[#0c0c0c]">Choose a validated model...</option>
                    {validatedModels.map(model => (
                      <option key={model.id} value={model.id} className="bg-[#0c0c0c]">{model.version} — {model.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Export Format</label>
                  <div className={`grid grid-cols-3 gap-px bg-white/[0.07] border ${BORDER}`}>
                    {(['ONNX', 'TensorRT', 'TFLite'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        disabled={isExporting}
                        className={`px-4 py-3 text-sm transition-colors disabled:opacity-50 ${format === fmt ? 'bg-white/[0.06] text-white' : `bg-[#0c0c0c] ${DIM} hover:text-white hover:bg-white/[0.02]`}`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedModel && (
                  <div className={`border ${BORDER} p-4`}>
                    <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Selected</div>
                    <div className="text-sm font-mono text-white mb-1">{selectedModel.version}</div>
                    <div className={`text-sm ${MUTED}`}>{selectedModel.name}</div>
                    {selectedModel.validation && (
                      <div className={`text-xs ${DIM} mt-1`}>Validated in {selectedModel.validation.simulator}</div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleStartExport}
                  disabled={isExporting || !selectedModelId}
                  className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {isExporting ? (
                    <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Exporting...</>
                  ) : 'Start Export →'}
                </button>

                {exportComplete && !isExporting && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className={`text-sm ${MUTED}`}>Export complete — artifact saved</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-6">
            {isExporting && currentJob && (
              <>
                <div className={`border ${BORDER} p-6`}>
                  <p className={`text-xs ${DIMMER} uppercase tracking-widest mb-4`}>Export Progress</p>
                  <ProgressBar progress={currentJob.progress} />
                </div>
                <LogViewer logs={currentJob.logs} title="Export Logs" />
              </>
            )}
            {!isExporting && (
              <div className={`border ${BORDER} p-12 text-center`}>
                <Package className={`w-8 h-8 ${DIMMER} mx-auto mb-4`} />
                <p className={`text-sm ${MUTED}`}>Select a model and format to begin export</p>
              </div>
            )}
          </div>
        </div>

        {/* Exported Artifacts */}
        {exportedModels.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-12">
            <p className={`text-xs ${DIMMER} uppercase tracking-widest mb-6`}>Exported Artifacts</p>
            <div className={`border ${BORDER}`}>
              <div className={`grid grid-cols-5 border-b ${BORDER} px-6 py-3`}>
                {['Model', 'Export', 'Format', 'Size', 'Created'].map(col => (
                  <div key={col} className={`text-xs ${DIMMER} uppercase tracking-widest`}>{col}</div>
                ))}
              </div>
              {exportedModels.map(model => (
                <div key={model.id} className={`grid grid-cols-5 px-6 py-4 border-b last:border-0 ${BORDER} hover:bg-white/[0.02] transition-colors`}>
                  <div className="text-sm font-mono text-white">{model.version}</div>
                  <div className="text-sm font-mono text-white">{model.export?.exportVersion}</div>
                  <div className={`flex items-center gap-1 text-xs ${DIM}`}>
                    <FileCode className="w-3 h-3" />
                    {model.export?.format}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${MUTED}`}>
                    <HardDrive className="w-3 h-3" />
                    {formatNumber(model.export?.fileSizeMB || 0, 1)} MB
                  </div>
                  <div className={`text-sm ${DIMMER}`}>{model.export ? formatDate(model.export.optimizedAt) : '—'}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
