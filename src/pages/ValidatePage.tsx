import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '../store/useModels';
import { useHistory } from '../store/useHistory';
import { simulateValidation } from '../utils/jobOrchestration';
import { LogViewer } from '../components/LogViewer';
import { ProgressBar } from '../components/ProgressBar';
import { MetricCard } from '../components/MetricCard';
import { FlaskConical, Shield, Clock, Gauge, CheckCircle2 } from 'lucide-react';
import { formatNumber } from '../lib/utils';

const BORDER = 'border-white/[0.07]';
const MUTED = 'text-[#c8c8c8]';
const DIM = 'text-[#999]';
const DIMMER = 'text-[#777]';

export const ValidatePage = () => {
  const { models, startValidation, completeValidation, setJobProgress, clearJob, currentJob } = useModels();
  const { addEvent } = useHistory();

  const [selectedModelId, setSelectedModelId] = useState('');
  const [simulator, setSimulator] = useState<'Isaac Sim' | 'Gazebo' | 'Isaac Gym'>('Isaac Sim');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  const trainedModels = models.filter(m => m.metrics && !m.validation);
  const selectedModel = models.find(m => m.id === selectedModelId);

  useEffect(() => {
    if (selectedModel) {
      if (selectedModel.componentType === 'Policy/Control') {
        setSimulator('Isaac Gym');
      } else {
        setSimulator('Isaac Sim');
      }
    }
  }, [selectedModel]);

  const handleStartValidation = () => {
    if (!selectedModelId) return;
    startValidation(selectedModelId);
    setIsValidating(true);
    setValidationResults(null);
    const model = models.find(m => m.id === selectedModelId);
    if (model) {
      addEvent({ modelVersion: model.version, type: 'Validate', details: `Started validation in ${simulator}`, metadata: { simulator } });
    }
    simulateValidation(
      (progress, logs) => { setJobProgress(progress, logs); },
      () => {
        completeValidation(selectedModelId, simulator);
        const updatedModel = models.find(m => m.id === selectedModelId);
        if (updatedModel?.validation) setValidationResults(updatedModel.validation);
        clearJob();
        setIsValidating(false);
        if (model) addEvent({ modelVersion: model.version, type: 'Validate', details: `Validation completed in ${simulator}` });
      },
      simulator,
      model?.componentType
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full overflow-x-hidden md:overflow-visible">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
        {/* Header */}
        <div className={`pb-10 border-b ${BORDER}`}>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">Validate Model</h1>
          <p className={`text-sm ${MUTED}`}>Test model performance in simulation environments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
          {/* Config */}
          <div className="space-y-8">
            <div>
              <p className={`text-xs ${DIMMER} uppercase tracking-widest mb-4`}>Configuration</p>
              <div className="space-y-6">
                {/* Model Selection */}
                <div>
                  <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Select Model</label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    disabled={isValidating}
                    className={`w-full bg-transparent border ${BORDER} px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="" className="bg-[#0c0c0c]">Choose a trained model...</option>
                    {trainedModels.map(model => (
                      <option key={model.id} value={model.id} className="bg-[#0c0c0c]">{model.version} — {model.name}</option>
                    ))}
                  </select>
                </div>

                {/* Simulator Selection */}
                <div>
                  <label className={`block text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Simulator</label>
                  <div className={`grid gap-px bg-white/[0.07] border ${BORDER} ${selectedModel?.componentType === 'Policy/Control' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {selectedModel?.componentType === 'Policy/Control' ? (
                      <div className="px-4 py-3 bg-white/[0.05] text-sm text-white">Isaac Gym (RL Training Environment)</div>
                    ) : (
                      <>
                        {(['Isaac Sim', 'Gazebo'] as const).map(sim => (
                          <button
                            key={sim}
                            onClick={() => setSimulator(sim)}
                            disabled={isValidating}
                            className={`px-4 py-3 text-sm transition-colors disabled:opacity-50 ${simulator === sim ? 'bg-white/[0.06] text-white' : `bg-[#0c0c0c] ${DIM} hover:text-white hover:bg-white/[0.02]`}`}
                          >
                            {sim}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Selected Model Info */}
                {selectedModel && (
                  <div className={`border ${BORDER} p-4`}>
                    <div className={`text-xs ${DIMMER} uppercase tracking-widest mb-2`}>Selected</div>
                    <div className="text-sm font-mono text-white mb-1">{selectedModel.version}</div>
                    <div className={`text-sm ${MUTED}`}>{selectedModel.name}</div>
                    <div className={`text-xs ${DIM} mt-1`}>Component: {selectedModel.componentType}</div>
                    <div className={`text-xs ${DIM}`}>Dataset: {selectedModel.datasetVersion}</div>
                  </div>
                )}

                {/* Action */}
                <button
                  onClick={handleStartValidation}
                  disabled={isValidating || !selectedModelId}
                  className={`text-sm text-white border-b ${BORDER} hover:border-white/30 pb-px transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {isValidating ? (
                    <><div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Validating...</>
                  ) : (
                    'Start Validation →'
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            {validationResults && !isValidating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`border-t ${BORDER} pt-8`}>
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <p className={`text-xs ${DIMMER} uppercase tracking-widest`}>Validation Complete</p>
                </div>
                <div className="space-y-0">
                  <MetricCard label="Safety Score" value={`${formatNumber(validationResults.safety * 100, 1)}%`} icon={Shield} />
                  <MetricCard label="Latency" value={`${formatNumber(validationResults.latency, 1)}ms`} icon={Clock} />
                  <MetricCard label="FPS" value={formatNumber(validationResults.fps, 0)} icon={Gauge} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Progress & Logs */}
          <div className="space-y-6">
            {isValidating && currentJob && (
              <>
                <div className={`border ${BORDER} p-6`}>
                  <p className={`text-xs ${DIMMER} uppercase tracking-widest mb-4`}>Validation Progress</p>
                  <ProgressBar progress={currentJob.progress} />
                </div>
                <LogViewer logs={currentJob.logs} title={`${simulator} Logs`} />
              </>
            )}
            {!isValidating && !validationResults && (
              <div className={`border ${BORDER} p-12 text-center`}>
                <FlaskConical className={`w-8 h-8 ${DIMMER} mx-auto mb-4`} />
                <p className={`text-sm ${MUTED}`}>Select a model and simulator to begin</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
