import { useState } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '../store/useModels';
import { useHistory } from '../store/useHistory';
import { simulateValidation } from '../utils/fakeJobs';
import { LogViewer } from '../components/LogViewer';
import { ProgressBar } from '../components/ProgressBar';
import { MetricCard } from '../components/MetricCard';
import { FlaskConical, Shield, Clock, Gauge, CheckCircle2 } from 'lucide-react';
import { formatNumber } from '../lib/utils';

export const ValidatePage = () => {
  const { models, startValidation, completeValidation, setJobProgress, clearJob, currentJob } = useModels();
  const { addEvent } = useHistory();
  
  const [selectedModelId, setSelectedModelId] = useState('');
  const [simulator, setSimulator] = useState<'Isaac Sim' | 'Gazebo'>('Isaac Sim');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  const trainedModels = models.filter(m => m.metrics && !m.validation);
  const selectedModel = models.find(m => m.id === selectedModelId);

  const handleStartValidation = () => {
    if (!selectedModelId) return;

    startValidation(selectedModelId);
    setIsValidating(true);
    setValidationResults(null);

    const model = models.find(m => m.id === selectedModelId);
    if (model) {
      addEvent({
        modelVersion: model.version,
        type: 'Validate',
        details: `Started validation in ${simulator}`,
        metadata: { simulator },
      });
    }

    simulateValidation(
      (progress, logs) => {
        setJobProgress(progress, logs);
      },
      () => {
        completeValidation(selectedModelId, simulator);
        const updatedModel = models.find(m => m.id === selectedModelId);
        if (updatedModel?.validation) {
          setValidationResults(updatedModel.validation);
        }
        clearJob();
        setIsValidating(false);

        if (model) {
          addEvent({
            modelVersion: model.version,
            type: 'Validate',
            details: `Validation completed in ${simulator}`,
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
            <FlaskConical className="w-8 h-8 text-purple-400" />
            Validate Model
          </h1>
          <p className="text-slate-400">Test model performance in simulation environments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Validation Form */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Validation Configuration</h2>
              
              <div className="space-y-6">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Model
                  </label>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    disabled={isValidating}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose a trained model...</option>
                    {trainedModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.version} - {model.framework} (Acc: {formatNumber(model.metrics!.accuracy * 100, 1)}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Simulator Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Simulator
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSimulator('Isaac Sim')}
                      disabled={isValidating}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        simulator === 'Isaac Sim'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Isaac Sim
                    </button>
                    <button
                      onClick={() => setSimulator('Gazebo')}
                      disabled={isValidating}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        simulator === 'Gazebo'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Gazebo
                    </button>
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
                    <div className="text-sm text-slate-300">
                      Dataset: {selectedModel.datasetVersion}
                    </div>
                  </div>
                )}

                {/* Start Validation Button */}
                <button
                  onClick={handleStartValidation}
                  disabled={isValidating || !selectedModelId}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <FlaskConical className="w-5 h-5" />
                      Start Validation
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Validation Results */}
            {validationResults && !isValidating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-lg p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Validation Complete</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <MetricCard
                    label="Safety Score"
                    value={`${formatNumber(validationResults.safety * 100, 1)}%`}
                    icon={Shield}
                    trend={validationResults.safety > 0.95 ? 'up' : 'neutral'}
                  />
                  <MetricCard
                    label="Latency"
                    value={`${formatNumber(validationResults.latency, 1)}ms`}
                    icon={Clock}
                    trend={validationResults.latency < 20 ? 'up' : 'down'}
                  />
                  <MetricCard
                    label="FPS"
                    value={formatNumber(validationResults.fps, 0)}
                    icon={Gauge}
                    trend={validationResults.fps > 100 ? 'up' : 'neutral'}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Validation Progress & Logs */}
          <div className="space-y-6">
            {isValidating && currentJob && (
              <>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Validation Progress</h3>
                  <ProgressBar progress={currentJob.progress} />
                </div>
                <LogViewer logs={currentJob.logs} title={`${simulator} Logs`} />
              </>
            )}

            {!isValidating && !validationResults && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                <FlaskConical className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400">Select a model and simulator to begin validation</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

