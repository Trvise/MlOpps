import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '../store/useModels';
import { useHistory } from '../store/useHistory';
import { useDatasets } from '../store/useDatasets';
import { simulateTraining } from '../utils/fakeJobs';
import { LogViewer } from '../components/LogViewer';
import { ProgressBar } from '../components/ProgressBar';
import { CodeEditor } from '../components/CodeEditor';
import { Zap, CheckCircle2, Database, Code, Settings } from 'lucide-react';

export const TrainPage = () => {
  const { addModel, startTraining, completeTraining, setJobProgress, clearJob, currentJob } = useModels();
  const { addEvent } = useHistory();
  const { datasets } = useDatasets();
  
  const [framework, setFramework] = useState<'PyTorch' | 'TensorFlow'>('PyTorch');
  const [learningRate, setLearningRate] = useState('0.001');
  const [batchSize, setBatchSize] = useState('32');
  const [epochs, setEpochs] = useState('10');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'form'>('code');
  const [configYaml, setConfigYaml] = useState('');

  const trainingDatasets = datasets.filter(d => d.type === 'Training');

  // Generate YAML config from form state
  const generateYamlConfig = () => {
    const dataset = datasets.find(d => d.id === selectedDataset);
    return `# ML Model Training Configuration
# Press Ctrl+F to search in code, Ctrl+S to save changes
# Edit this configuration file to customize your training parameters

framework: ${framework}
dataset_version: ${dataset?.version || 'DS-001'}

hyperparameters:
  learning_rate: ${learningRate}
  batch_size: ${batchSize}
  epochs: ${epochs}
  
optimizer:
  type: adam
  weight_decay: 0.0001
  
scheduler:
  type: cosine
  warmup_epochs: 2
  
augmentation:
  enabled: true
  rotation: 15
  brightness: 0.2
  contrast: 0.2
  
early_stopping:
  patience: 5
  min_delta: 0.001
  
checkpoint:
  save_best: true
  save_frequency: 5`;
  };

  // Update YAML when form values change
  useEffect(() => {
    const yaml = generateYamlConfig();
    setConfigYaml(yaml);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framework, learningRate, batchSize, epochs, selectedDataset, datasets]);

  // Parse YAML and update form state
  const parseYamlAndUpdateForm = (yaml: string) => {
    try {
      // Simple YAML parser for our specific config
      const lines = yaml.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('framework:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value === 'PyTorch' || value === 'TensorFlow') {
            setFramework(value);
          }
        } else if (trimmed.startsWith('learning_rate:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setLearningRate(value);
        } else if (trimmed.startsWith('batch_size:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setBatchSize(value);
        } else if (trimmed.startsWith('epochs:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setEpochs(value);
        }
      });
    } catch (error) {
      console.error('Error parsing YAML:', error);
    }
  };

  const handleStartTraining = () => {
    const dataset = datasets.find(d => d.id === selectedDataset);
    const datasetVersion = dataset?.version || 'DS-001';

    // Create a new model
    const newModel = addModel({
      framework,
      hyperparams: {
        learning_rate: parseFloat(learningRate),
        batch_size: parseInt(batchSize),
        epochs: parseInt(epochs),
      },
      datasetVersion,
    });

    // Start training
    startTraining(newModel.id);
    setIsTraining(true);
    setTrainingComplete(false);

    // Add history event
    addEvent({
      modelVersion: newModel.version,
      type: 'Train',
      details: `Started training with ${framework}`,
      metadata: {
        framework,
        hyperparams: {
          learning_rate: learningRate,
          batch_size: batchSize,
          epochs: epochs,
        },
      },
    });

    // Simulate training
    simulateTraining(
      (progress, logs) => {
        setJobProgress(progress, logs);
      },
      () => {
        completeTraining(newModel.id);
        clearJob();
        setIsTraining(false);
        setTrainingComplete(true);
        
        // Add completion event
        addEvent({
          modelVersion: newModel.version,
          type: 'Train',
          details: `Training completed successfully`,
        });
      },
      parseInt(epochs)
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col min-h-0"
      >
        {/* Header */}
        <div className="mb-4 md:mb-6 flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-amber-400" />
            Train Model
          </h1>
          <p className="text-sm md:text-base text-slate-400">Configure hyperparameters and start a new training run</p>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-4 h-4" />
              Code Editor
            </button>
            <button
              onClick={() => setViewMode('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'form'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              Form
            </button>
          </div>
          <div className="text-xs sm:text-sm text-slate-400">
            {viewMode === 'code' ? 'Edit configuration as code (Press Ctrl+F to search)' : 'Edit configuration via form'}
          </div>
        </div>

        {/* Dataset Selection (shown in both modes) */}
        <div className="mb-4 md:mb-6 bg-slate-900 border border-slate-800 rounded-lg p-3 md:p-4 flex-shrink-0">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Dataset
          </label>
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            disabled={isTraining}
            className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Choose a training dataset...</option>
            {trainingDatasets.map(dataset => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.version} - {dataset.name} ({dataset.samples.toLocaleString()} samples)
              </option>
            ))}
          </select>
          {trainingDatasets.length === 0 && (
            <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
              <Database className="w-3 h-3" />
              No training datasets available. Upload one in the Datasets page.
            </p>
          )}
        </div>

        {viewMode === 'code' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 min-h-0 flex-1">
            {/* Code Editor - Left Side */}
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex-1" style={{ minHeight: '500px', maxHeight: 'calc(100vh - 350px)' }}>
                <CodeEditor
                  value={configYaml}
                  onChange={(value) => {
                    if (value) {
                      setConfigYaml(value);
                      parseYamlAndUpdateForm(value);
                    }
                  }}
                  language="yaml"
                  height="600px"
                  onSave={() => {
                    parseYamlAndUpdateForm(configYaml);
                  }}
                  title="Model Training Configuration"
                />
              </div>
              
              {/* Start Training Button - Fixed at bottom */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleStartTraining}
                  disabled={isTraining || !selectedDataset}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTraining ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Training in Progress...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Start Training
                    </>
                  )}
                </button>

                {trainingComplete && !isTraining && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <div>
                      <div className="text-green-400 font-medium">Training Complete!</div>
                      <div className="text-sm text-slate-400">Model saved successfully</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Training Results & Logs - Right Side */}
            <div className="flex flex-col gap-4 min-h-0">
              {isTraining && currentJob && (
                <>
                  <div className="flex-shrink-0 bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Training Progress</h3>
                    <ProgressBar progress={currentJob.progress} />
                  </div>
                  <div className="flex-1 min-h-0">
                    <LogViewer logs={currentJob.logs} title="Training Logs" />
                  </div>
                </>
              )}

              {!isTraining && !trainingComplete && (
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-12 text-center flex items-center justify-center min-h-[300px]">
                  <div>
                    <Zap className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400">Training results will appear here</p>
                    <p className="text-sm text-slate-500 mt-2">Start training to see progress and logs</p>
                  </div>
                </div>
              )}

              {trainingComplete && !isTraining && (
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-4">Training Complete</h3>
                  <div className="space-y-4 flex-1">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-green-400 font-medium">Model Trained Successfully</span>
                      </div>
                      <p className="text-sm text-slate-400">Your model has been saved and is ready for validation</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Training Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Training Configuration</h2>
              
              <div className="space-y-6">
                {/* Framework Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Framework
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFramework('PyTorch')}
                      disabled={isTraining}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        framework === 'PyTorch'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      PyTorch
                    </button>
                    <button
                      onClick={() => setFramework('TensorFlow')}
                      disabled={isTraining}
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        framework === 'TensorFlow'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      TensorFlow
                    </button>
                  </div>
                </div>

                {/* Hyperparameters */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Learning Rate
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(e.target.value)}
                    disabled={isTraining}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    disabled={isTraining}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Epochs
                  </label>
                  <input
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(e.target.value)}
                    disabled={isTraining}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Start Training Button */}
                <button
                  onClick={handleStartTraining}
                  disabled={isTraining || !selectedDataset}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTraining ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Training in Progress...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Start Training
                    </>
                  )}
                </button>

                {trainingComplete && !isTraining && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="text-green-400 font-medium">Training Complete!</div>
                      <div className="text-sm text-slate-400">Model saved successfully</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Training Progress & Logs */}
            <div className="space-y-6">
              {isTraining && currentJob && (
                <>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Training Progress</h3>
                    <ProgressBar progress={currentJob.progress} />
                  </div>
                  <LogViewer logs={currentJob.logs} title="Training Logs" />
                </>
              )}

              {!isTraining && !trainingComplete && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                  <Zap className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">Configure parameters and start training</p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

