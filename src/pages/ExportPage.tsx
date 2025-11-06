import { useState } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '../store/useModels';
import { useHistory } from '../store/useHistory';
import { simulateExport } from '../utils/fakeJobs';
import { LogViewer } from '../components/LogViewer';
import { ProgressBar } from '../components/ProgressBar';
import { Package, CheckCircle2, FileCode, HardDrive } from 'lucide-react';
import { formatNumber, formatDate } from '../lib/utils';

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
    if (model) {
      addEvent({
        modelVersion: model.version,
        type: 'Export',
        details: `Started export to ${format}`,
        metadata: { format },
      });
    }

    simulateExport(
      (progress, logs) => {
        setJobProgress(progress, logs);
      },
      () => {
        completeExport(selectedModelId, format);
        clearJob();
        setIsExporting(false);
        setExportComplete(true);

        if (model) {
          addEvent({
            modelVersion: model.version,
            type: 'Export',
            details: `Export to ${format} completed`,
          });
        }
      }
    );
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-yellow-400" />
            Export & Optimize
          </h1>
          <p className="text-slate-400">Convert models for deployment and optimization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Form */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Export Configuration</h2>
              
              <div className="space-y-6">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Model
                  </label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    disabled={isExporting}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose a validated model...</option>
                    {validatedModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.version} - {model.framework} (Safety: {formatNumber(model.validation!.safety * 100, 1)}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Export Format
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['ONNX', 'TensorRT', 'TFLite'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        disabled={isExporting}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                          format === fmt
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Model Info */}
                {selectedModel && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-2">Selected Model</div>
                    <div className="font-mono text-cyan-400">{selectedModel.version}</div>
                    <div className="text-sm text-slate-300 mt-1">
                      Framework: {selectedModel.framework}
                    </div>
                    {selectedModel.validation && (
                      <div className="text-sm text-green-400 mt-1">
                        Validated in {selectedModel.validation.simulator}
                      </div>
                    )}
                  </div>
                )}

                {/* Start Export Button */}
                <button
                  onClick={handleStartExport}
                  disabled={isExporting || !selectedModelId}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      Start Export
                    </>
                  )}
                </button>

                {exportComplete && !isExporting && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="text-green-400 font-medium">Export Complete!</div>
                      <div className="text-sm text-slate-400">Model artifact saved</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Export Progress & Logs */}
          <div className="space-y-6">
            {isExporting && currentJob && (
              <>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Export Progress</h3>
                  <ProgressBar progress={currentJob.progress} />
                </div>
                <LogViewer logs={currentJob.logs} title="Export Logs" />
              </>
            )}

            {!isExporting && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">Select a model and format to begin export</p>
              </div>
            )}
          </div>
        </div>

        {/* Exported Artifacts */}
        {exportedModels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white">Exported Artifacts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Model Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Export Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      File Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {exportedModels.map((model) => (
                    <tr key={model.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-cyan-400">{model.version}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-yellow-400">{model.export?.exportVersion}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs font-medium text-slate-300">
                          <FileCode className="w-3 h-3" />
                          {model.export?.format}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-sm text-slate-300">
                          <HardDrive className="w-4 h-4" />
                          {formatNumber(model.export?.fileSizeMB || 0, 1)} MB
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-400">
                          {model.export ? formatDate(model.export.optimizedAt) : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

