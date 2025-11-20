import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useModels } from '../store/useModels';
import { useHistory } from '../store/useHistory';
import { useDatasets } from '../store/useDatasets';
import { simulateTraining } from '../utils/jobOrchestration';
import { LogViewer } from '../components/LogViewer';
import { ProgressBar } from '../components/ProgressBar';
import { CodeEditor } from '../components/CodeEditor';
import { Zap, CheckCircle2, Database, Code, Settings } from 'lucide-react';
import { ComponentType } from '../types';

export const TrainPage = () => {
  const { models, addModel, startTraining, completeTraining, setJobProgress, clearJob, currentJob } = useModels();
  const { addEvent } = useHistory();
  const { datasets } = useDatasets();
  
  const [trainingMode, setTrainingMode] = useState<'new' | 'improve'>('new');
  const [selectedBaseModel, setSelectedBaseModel] = useState('');
  const [modelName, setModelName] = useState('');
  const [componentType, setComponentType] = useState<ComponentType>('Perception');
  const [framework, setFramework] = useState<'PyTorch' | 'TensorFlow' | 'CasADi' | 'LangChain'>('PyTorch');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'form'>('code');
  const [configYaml, setConfigYaml] = useState('');

  // Component-specific hyperparameters
  // Perception (SLAM + Detection)
  const [perceptionLearningRate, setPerceptionLearningRate] = useState('0.001');
  const [perceptionBatchSize, setPerceptionBatchSize] = useState('16');
  const [perceptionEpochs, setPerceptionEpochs] = useState('50');
  const [slamKeyframeInterval, setSlamKeyframeInterval] = useState('5');
  const [slamFeaturePoints, setSlamFeaturePoints] = useState('8000');
  const [slamLoopClosureThreshold, setSlamLoopClosureThreshold] = useState('0.3');
  const [detectionAnchorScales, setDetectionAnchorScales] = useState('[8, 16, 32, 64, 128]');
  const [detectionNmsThreshold, setDetectionNmsThreshold] = useState('0.5');
  const [detectionRoiPoolSize, setDetectionRoiPoolSize] = useState('7');

  // Policy/Control (RL)
  const [policyLearningRate, setPolicyLearningRate] = useState('0.0003');
  const [policyBatchSize, setPolicyBatchSize] = useState('4096');
  const [policyIterations, setPolicyIterations] = useState('1000');
  const [rlGamma, setRlGamma] = useState('0.99');
  const [rlLambda, setRlLambda] = useState('0.95');
  const [rlClipEpsilon, setRlClipEpsilon] = useState('0.2');
  const [rlValueCoef, setRlValueCoef] = useState('0.5');
  const [rlEntropyCoef, setRlEntropyCoef] = useState('0.01');

  // Planner (MPC)
  const [mpcHorizonLength, setMpcHorizonLength] = useState('20');
  const [mpcDt, setMpcDt] = useState('0.1');
  const [mpcMaxIterations, setMpcMaxIterations] = useState('100');
  const [mpcConvergenceTolerance, setMpcConvergenceTolerance] = useState('1e-4');
  const [mpcPositionWeight, setMpcPositionWeight] = useState('1.0');
  const [mpcVelocityWeight, setMpcVelocityWeight] = useState('0.5');
  const [mpcControlWeight, setMpcControlWeight] = useState('0.1');

  // High-level reasoning (LLM)
  const [llmLearningRate, setLlmLearningRate] = useState('2e-5');
  const [llmBatchSize, setLlmBatchSize] = useState('8');
  const [llmEpochs, setLlmEpochs] = useState('3');
  const [llmTemperature, setLlmTemperature] = useState('0.7');
  const [llmMaxTokens, setLlmMaxTokens] = useState('512');
  const [llmTopP, setLlmTopP] = useState('0.9');
  const [llmTopK, setLlmTopK] = useState('50');

  // Update framework based on component type
  useEffect(() => {
    if (componentType === 'Planner') {
      setFramework('CasADi');
    } else if (componentType === 'High-level reasoning') {
      setFramework('LangChain');
    } else {
      setFramework('PyTorch');
    }
  }, [componentType]);

  // When improving, load the base model's configuration
  useEffect(() => {
    if (trainingMode === 'improve' && selectedBaseModel) {
      const baseModel = models.find(m => m.id === selectedBaseModel);
      if (baseModel) {
        setModelName(`${baseModel.name} (Improved)`);
        setComponentType(baseModel.componentType);
        setFramework(baseModel.framework);
        // Load hyperparameters from base model
        if (baseModel.hyperparams) {
          if (baseModel.componentType === 'Perception') {
            if (baseModel.hyperparams.learning_rate) setPerceptionLearningRate(String(baseModel.hyperparams.learning_rate));
            if (baseModel.hyperparams.batch_size) setPerceptionBatchSize(String(baseModel.hyperparams.batch_size));
            if (baseModel.hyperparams.epochs) setPerceptionEpochs(String(baseModel.hyperparams.epochs));
            if (baseModel.hyperparams.keyframe_interval) setSlamKeyframeInterval(String(baseModel.hyperparams.keyframe_interval));
            if (baseModel.hyperparams.feature_points) setSlamFeaturePoints(String(baseModel.hyperparams.feature_points));
            if (baseModel.hyperparams.loop_closure_threshold) setSlamLoopClosureThreshold(String(baseModel.hyperparams.loop_closure_threshold));
            if (baseModel.hyperparams.anchor_scales) setDetectionAnchorScales(String(baseModel.hyperparams.anchor_scales));
            if (baseModel.hyperparams.nms_threshold) setDetectionNmsThreshold(String(baseModel.hyperparams.nms_threshold));
            if (baseModel.hyperparams.roi_pool_size) setDetectionRoiPoolSize(String(baseModel.hyperparams.roi_pool_size));
          } else if (baseModel.componentType === 'Policy/Control') {
            if (baseModel.hyperparams.learning_rate) setPolicyLearningRate(String(baseModel.hyperparams.learning_rate));
            if (baseModel.hyperparams.batch_size) setPolicyBatchSize(String(baseModel.hyperparams.batch_size));
            if (baseModel.hyperparams.iterations) setPolicyIterations(String(baseModel.hyperparams.iterations));
            if (baseModel.hyperparams.gamma) setRlGamma(String(baseModel.hyperparams.gamma));
            if (baseModel.hyperparams.lambda) setRlLambda(String(baseModel.hyperparams.lambda));
            if (baseModel.hyperparams.clip_epsilon) setRlClipEpsilon(String(baseModel.hyperparams.clip_epsilon));
            if (baseModel.hyperparams.value_coef) setRlValueCoef(String(baseModel.hyperparams.value_coef));
            if (baseModel.hyperparams.entropy_coef) setRlEntropyCoef(String(baseModel.hyperparams.entropy_coef));
          } else if (baseModel.componentType === 'Planner') {
            if (baseModel.hyperparams.horizon_length) setMpcHorizonLength(String(baseModel.hyperparams.horizon_length));
            if (baseModel.hyperparams.dt) setMpcDt(String(baseModel.hyperparams.dt));
            if (baseModel.hyperparams.max_iterations) setMpcMaxIterations(String(baseModel.hyperparams.max_iterations));
            if (baseModel.hyperparams.convergence_tolerance) setMpcConvergenceTolerance(String(baseModel.hyperparams.convergence_tolerance));
            if (baseModel.hyperparams.position_weight) setMpcPositionWeight(String(baseModel.hyperparams.position_weight));
            if (baseModel.hyperparams.velocity_weight) setMpcVelocityWeight(String(baseModel.hyperparams.velocity_weight));
            if (baseModel.hyperparams.control_weight) setMpcControlWeight(String(baseModel.hyperparams.control_weight));
          } else if (baseModel.componentType === 'High-level reasoning') {
            if (baseModel.hyperparams.learning_rate) setLlmLearningRate(String(baseModel.hyperparams.learning_rate));
            if (baseModel.hyperparams.batch_size) setLlmBatchSize(String(baseModel.hyperparams.batch_size));
            if (baseModel.hyperparams.epochs) setLlmEpochs(String(baseModel.hyperparams.epochs));
            if (baseModel.hyperparams.temperature) setLlmTemperature(String(baseModel.hyperparams.temperature));
            if (baseModel.hyperparams.max_tokens) setLlmMaxTokens(String(baseModel.hyperparams.max_tokens));
            if (baseModel.hyperparams.top_p) setLlmTopP(String(baseModel.hyperparams.top_p));
            if (baseModel.hyperparams.top_k) setLlmTopK(String(baseModel.hyperparams.top_k));
          }
        }
      }
    }
  }, [trainingMode, selectedBaseModel, models]);

  const trainingDatasets = datasets; // All datasets have train/test/inference splits

  // Generate YAML config from form state
  const generateYamlConfig = () => {
    const dataset = datasets.find(d => d.id === selectedDataset);
    
    let config = `# ${componentType} Component Training Configuration
# Press Ctrl+F to search in code, Ctrl+S to save changes
# Edit this configuration file to customize your training parameters

component_type: ${componentType}
framework: ${framework}
dataset_version: ${dataset?.version || 'DS-001'}

`;

    if (componentType === 'Perception') {
      config += `hyperparameters:
  learning_rate: ${perceptionLearningRate}
  batch_size: ${perceptionBatchSize}
  epochs: ${perceptionEpochs}

perception_config:
  slam_type: DROID-SLAM
  detection_model: Mask R-CNN
  backbone: ResNet-50
  feature_extractor: EfficientNet-B0

slam_hyperparameters:
  keyframe_interval: ${slamKeyframeInterval}
  feature_points: ${slamFeaturePoints}
  loop_closure_threshold: ${slamLoopClosureThreshold}
  depth_scale: 1000.0
  max_keyframes: 1000

detection_hyperparameters:
  anchor_scales: ${detectionAnchorScales}
  nms_threshold: ${detectionNmsThreshold}
  roi_pool_size: ${detectionRoiPoolSize}
  num_classes: 80
  confidence_threshold: 0.5
  
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
    } else if (componentType === 'Policy/Control') {
      config += `hyperparameters:
  learning_rate: ${policyLearningRate}
  batch_size: ${policyBatchSize}
  iterations: ${policyIterations}

policy_config:
  training_env: Isaac Gym
  algorithm: PPO-LSTM
  parallel_envs: 4096
  reward_shaping: true

rl_hyperparameters:
  gamma: ${rlGamma}
  lambda: ${rlLambda}
  clip_epsilon: ${rlClipEpsilon}
  value_coef: ${rlValueCoef}
  entropy_coef: ${rlEntropyCoef}
  max_grad_norm: 0.5
  ppo_epochs: 4
  
optimizer:
  type: adam
  weight_decay: 0.0001
  
scheduler:
  type: cosine
  warmup_epochs: 2
  
checkpoint:
  save_best: true
  save_frequency: 100`;
    } else if (componentType === 'Planner') {
      config += `hyperparameters:
  horizon_length: ${mpcHorizonLength}
  dt: ${mpcDt}
  max_iterations: ${mpcMaxIterations}
  convergence_tolerance: ${mpcConvergenceTolerance}

planner_config:
  solver: CasADi (IPOPT)
  cost_function: quadratic
  constraints:
    - velocity_limit
    - acceleration_limit
    - collision_avoidance

mpc_hyperparameters:
  position_weight: ${mpcPositionWeight}
  velocity_weight: ${mpcVelocityWeight}
  control_weight: ${mpcControlWeight}
  obstacle_margin: 0.5
  max_velocity: 2.0
  max_acceleration: 1.0
  
solver_options:
  print_level: 0
  max_iter: ${mpcMaxIterations}
  tol: ${mpcConvergenceTolerance}`;
    } else if (componentType === 'High-level reasoning') {
      config += `hyperparameters:
  learning_rate: ${llmLearningRate}
  batch_size: ${llmBatchSize}
  epochs: ${llmEpochs}

reasoning_config:
  llm_type: OpenVLA
  framework: LangChain
  prompt_template: chain_of_thought

llm_hyperparameters:
  temperature: ${llmTemperature}
  max_tokens: ${llmMaxTokens}
  top_p: ${llmTopP}
  top_k: ${llmTopK}
  repetition_penalty: 1.1
  length_penalty: 1.0
  
optimizer:
  type: adamw
  weight_decay: 0.01
  
scheduler:
  type: linear
  warmup_epochs: 1
  
checkpoint:
  save_best: true
  save_frequency: 1`;
    }

    return config;
  };

  // Update YAML when form values change
  useEffect(() => {
    const yaml = generateYamlConfig();
    setConfigYaml(yaml);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    componentType, framework, selectedDataset, datasets,
    // Perception
    perceptionLearningRate, perceptionBatchSize, perceptionEpochs,
    slamKeyframeInterval, slamFeaturePoints, slamLoopClosureThreshold,
    detectionAnchorScales, detectionNmsThreshold, detectionRoiPoolSize,
    // Policy
    policyLearningRate, policyBatchSize, policyIterations,
    rlGamma, rlLambda, rlClipEpsilon, rlValueCoef, rlEntropyCoef,
    // Planner
    mpcHorizonLength, mpcDt, mpcMaxIterations, mpcConvergenceTolerance,
    mpcPositionWeight, mpcVelocityWeight, mpcControlWeight,
    // LLM
    llmLearningRate, llmBatchSize, llmEpochs,
    llmTemperature, llmMaxTokens, llmTopP, llmTopK,
  ]);

  // Parse YAML and update form state
  const parseYamlAndUpdateForm = (yaml: string) => {
    try {
      const lines = yaml.split('\n');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('component_type:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value && ['Perception', 'Policy/Control', 'Planner', 'High-level reasoning'].includes(value)) {
            setComponentType(value as ComponentType);
          }
        } else if (trimmed.startsWith('framework:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value && ['PyTorch', 'TensorFlow', 'CasADi', 'LangChain'].includes(value)) {
            setFramework(value as 'PyTorch' | 'TensorFlow' | 'CasADi' | 'LangChain');
          }
        }
        // Perception hyperparameters
        else if (trimmed.startsWith('learning_rate:') && componentType === 'Perception') {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setPerceptionLearningRate(value);
        } else if (trimmed.startsWith('batch_size:') && componentType === 'Perception') {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setPerceptionBatchSize(value);
        } else if (trimmed.startsWith('epochs:') && componentType === 'Perception') {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setPerceptionEpochs(value);
        } else if (trimmed.startsWith('keyframe_interval:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setSlamKeyframeInterval(value);
        } else if (trimmed.startsWith('feature_points:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setSlamFeaturePoints(value);
        } else if (trimmed.startsWith('loop_closure_threshold:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setSlamLoopClosureThreshold(value);
        } else if (trimmed.startsWith('anchor_scales:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setDetectionAnchorScales(value);
        } else if (trimmed.startsWith('nms_threshold:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setDetectionNmsThreshold(value);
        } else if (trimmed.startsWith('roi_pool_size:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setDetectionRoiPoolSize(value);
        }
        // Policy hyperparameters
        else if (trimmed.startsWith('learning_rate:') && componentType === 'Policy/Control') {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setPolicyLearningRate(value);
        } else if (trimmed.startsWith('batch_size:') && componentType === 'Policy/Control') {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setPolicyBatchSize(value);
        } else if (trimmed.startsWith('iterations:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setPolicyIterations(value);
        } else if (trimmed.startsWith('gamma:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setRlGamma(value);
        } else if (trimmed.startsWith('lambda:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setRlLambda(value);
        } else if (trimmed.startsWith('clip_epsilon:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setRlClipEpsilon(value);
        } else if (trimmed.startsWith('value_coef:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setRlValueCoef(value);
        } else if (trimmed.startsWith('entropy_coef:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setRlEntropyCoef(value);
        }
        // Planner hyperparameters
        else if (trimmed.startsWith('horizon_length:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setMpcHorizonLength(value);
        } else if (trimmed.startsWith('dt:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setMpcDt(value);
        } else if (trimmed.startsWith('max_iterations:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setMpcMaxIterations(value);
        } else if (trimmed.startsWith('convergence_tolerance:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setMpcConvergenceTolerance(value);
        } else if (trimmed.startsWith('position_weight:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setMpcPositionWeight(value);
        } else if (trimmed.startsWith('velocity_weight:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setMpcVelocityWeight(value);
        } else if (trimmed.startsWith('control_weight:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setMpcControlWeight(value);
        }
        // LLM hyperparameters
        else if (trimmed.startsWith('learning_rate:') && componentType === 'High-level reasoning') {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setLlmLearningRate(value);
        } else if (trimmed.startsWith('batch_size:') && componentType === 'High-level reasoning') {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setLlmBatchSize(value);
        } else if (trimmed.startsWith('epochs:') && componentType === 'High-level reasoning') {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setLlmEpochs(value);
        } else if (trimmed.startsWith('temperature:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setLlmTemperature(value);
        } else if (trimmed.startsWith('max_tokens:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setLlmMaxTokens(value);
        } else if (trimmed.startsWith('top_p:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setLlmTopP(value);
        } else if (trimmed.startsWith('top_k:')) {
          const value = trimmed.split(':')[1]?.trim();
          if (value) setLlmTopK(value);
        }
      });
    } catch (error) {
      console.error('Error parsing YAML:', error);
    }
  };

  const handleStartTraining = () => {
    const dataset = datasets.find(d => d.id === selectedDataset);
    const datasetVersion = dataset?.version || 'DS-001';

    // If improving, get the base model
    const baseModel = trainingMode === 'improve' && selectedBaseModel 
      ? models.find(m => m.id === selectedBaseModel)
      : null;

    // Build component config and hyperparameters based on component type
    const componentConfig: any = {};
    let hyperparams: Record<string, string | number> = {};
    
    // If improving, track the parent model
    if (baseModel) {
      componentConfig.parentModelId = baseModel.id;
      componentConfig.parentModelVersion = baseModel.version;
    }

    if (componentType === 'Perception') {
      componentConfig.perception = {
        slamType: 'DROID-SLAM',
        detectionModel: 'Mask R-CNN',
      };
      hyperparams = {
        learning_rate: parseFloat(perceptionLearningRate),
        batch_size: parseInt(perceptionBatchSize),
        epochs: parseInt(perceptionEpochs),
        keyframe_interval: parseInt(slamKeyframeInterval),
        feature_points: parseInt(slamFeaturePoints),
        loop_closure_threshold: parseFloat(slamLoopClosureThreshold),
        anchor_scales: detectionAnchorScales,
        nms_threshold: parseFloat(detectionNmsThreshold),
        roi_pool_size: parseInt(detectionRoiPoolSize),
      };
    } else if (componentType === 'Policy/Control') {
      componentConfig.policy = {
        trainingEnv: 'Isaac Gym',
        algorithm: 'PPO-LSTM',
      };
      hyperparams = {
        learning_rate: parseFloat(policyLearningRate),
        batch_size: parseInt(policyBatchSize),
        iterations: parseInt(policyIterations),
        gamma: parseFloat(rlGamma),
        lambda: parseFloat(rlLambda),
        clip_epsilon: parseFloat(rlClipEpsilon),
        value_coef: parseFloat(rlValueCoef),
        entropy_coef: parseFloat(rlEntropyCoef),
      };
    } else if (componentType === 'Planner') {
      componentConfig.planner = {
        solver: 'CasADi',
        mpcHorizon: parseInt(mpcHorizonLength),
      };
      hyperparams = {
        horizon_length: parseInt(mpcHorizonLength),
        dt: parseFloat(mpcDt),
        max_iterations: parseInt(mpcMaxIterations),
        convergence_tolerance: parseFloat(mpcConvergenceTolerance),
        position_weight: parseFloat(mpcPositionWeight),
        velocity_weight: parseFloat(mpcVelocityWeight),
        control_weight: parseFloat(mpcControlWeight),
      };
    } else if (componentType === 'High-level reasoning') {
      componentConfig.reasoning = {
        llmType: 'OpenVLA',
        framework: 'LangChain',
      };
      hyperparams = {
        learning_rate: parseFloat(llmLearningRate),
        batch_size: parseInt(llmBatchSize),
        epochs: parseInt(llmEpochs),
        temperature: parseFloat(llmTemperature),
        max_tokens: parseInt(llmMaxTokens),
        top_p: parseFloat(llmTopP),
        top_k: parseInt(llmTopK),
      };
    }

    // Create a new model (either from scratch or improved from existing)
    const newModel = addModel({
      name: modelName.trim() || `Model ${componentType}`,
      componentType,
      framework,
      hyperparams,
      datasetVersion,
      componentConfig,
    });

    // Start training
    startTraining(newModel.id);
    setIsTraining(true);
    setTrainingComplete(false);

    // Add history event
    const trainingDetails = baseModel
      ? `Started improving ${componentType} component from ${baseModel.version} with ${framework}`
      : `Started training ${componentType} component with ${framework}`;
    
    addEvent({
      modelVersion: newModel.version,
      type: 'Train',
      details: trainingDetails,
      metadata: {
        componentType,
        framework,
        hyperparams,
        ...(baseModel && { 
          parentModelVersion: baseModel.version,
          parentModelId: baseModel.id 
        }),
      },
    });

    // Simulate training
    const totalEpochs = componentType === 'Perception' 
      ? parseInt(perceptionEpochs)
      : componentType === 'Policy/Control'
      ? parseInt(policyIterations)
      : componentType === 'Planner'
      ? parseInt(mpcMaxIterations)
      : parseInt(llmEpochs);

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
          details: `${componentType} training completed successfully`,
        });
      },
      totalEpochs,
      componentType
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
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-4xl font-light text-white mb-3 tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-400" />
            Train Model
          </h1>
          <p className="text-lg text-slate-400">Configure hyperparameters and start a new training run</p>
        </div>

        {/* Training Mode Selection */}
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-lg p-4 flex-shrink-0">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Training Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setTrainingMode('new');
                setSelectedBaseModel('');
                setModelName('');
              }}
              disabled={isTraining}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                trainingMode === 'new'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Zap className="w-6 h-6" />
              <span className="text-sm font-medium">Create New Model</span>
            </button>
            <button
              onClick={() => setTrainingMode('improve')}
              disabled={isTraining}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                trainingMode === 'improve'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-sm font-medium">Improve Existing Model</span>
            </button>
          </div>

          {/* Model Selection for Improve Mode */}
          {trainingMode === 'improve' && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Base Model to Improve
              </label>
              <select
                value={selectedBaseModel}
                onChange={(e) => setSelectedBaseModel(e.target.value)}
                disabled={isTraining}
                className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Choose a model to improve...</option>
                {models
                  .filter(m => m.status !== 'training' && m.status !== 'validating' && m.status !== 'exporting')
                  .map(model => (
                    <option key={model.id} value={model.id}>
                      {model.version} - {model.name}
                    </option>
                  ))}
              </select>
              {models.length === 0 && (
                <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  No trained models available. Create a new model first.
                </p>
              )}
              {selectedBaseModel && (
                <p className="text-xs text-slate-400 mt-2">
                  The base model's configuration will be loaded. You can modify hyperparameters before training.
                </p>
              )}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="mb-4 md:mb-6 flex-shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 inline-flex gap-1">
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-normal transition-all ${
                viewMode === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <Code className="w-4 h-4" />
              Code Editor
            </button>
            <button
              onClick={() => setViewMode('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-normal transition-all ${
                viewMode === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <Settings className="w-4 h-4" />
              Form
            </button>
          </div>
        </div>

        {/* Model Name Input */}
        <div className="mb-4 md:mb-6 bg-slate-900 border border-slate-800 rounded-lg p-3 md:p-4 flex-shrink-0">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Model Name
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            disabled={isTraining}
            placeholder="Enter a name for your model..."
            className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
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
                {dataset.isSearchBased ? ' [Search-Based]' : ''}
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
                  disabled={isTraining || !selectedDataset || !modelName.trim() || (trainingMode === 'improve' && !selectedBaseModel)}
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
                {/* Component Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Component Type
                  </label>
                  <select
                    value={componentType}
                    onChange={(e) => setComponentType(e.target.value as ComponentType)}
                    disabled={isTraining}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Perception">Perception</option>
                    <option value="Policy/Control">Policy/Control</option>
                    <option value="Planner">Planner</option>
                    <option value="High-level reasoning">High-level reasoning</option>
                  </select>
                </div>

                {/* Framework Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Framework
                  </label>
                  <div className={`grid gap-3 ${
                    componentType === 'Planner' || componentType === 'High-level reasoning' 
                      ? 'grid-cols-1' 
                      : 'grid-cols-2'
                  }`}>
                    {componentType !== 'Planner' && componentType !== 'High-level reasoning' && (
                      <>
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
                      </>
                    )}
                    {componentType === 'Planner' && (
                      <div className="px-4 py-3 rounded-lg bg-slate-800 text-slate-300">
                        CasADi (MPC Solver)
                      </div>
                    )}
                    {componentType === 'High-level reasoning' && (
                      <div className="px-4 py-3 rounded-lg bg-slate-800 text-slate-300">
                        LangChain (LLM Framework)
                      </div>
                    )}
                  </div>
                </div>

                {/* Component-Specific Hyperparameters */}
                {componentType === 'Perception' && (
                  <>
                    <div className="border-t border-slate-700 pt-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">General Training</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Learning Rate</label>
                          <input type="number" step="0.0001" value={perceptionLearningRate} onChange={(e) => setPerceptionLearningRate(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Batch Size</label>
                          <input type="number" value={perceptionBatchSize} onChange={(e) => setPerceptionBatchSize(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Epochs</label>
                          <input type="number" value={perceptionEpochs} onChange={(e) => setPerceptionEpochs(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">SLAM (DROID-SLAM) Parameters</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Keyframe Interval</label>
                          <input type="number" value={slamKeyframeInterval} onChange={(e) => setSlamKeyframeInterval(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Feature Points</label>
                          <input type="number" value={slamFeaturePoints} onChange={(e) => setSlamFeaturePoints(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Loop Closure Threshold</label>
                          <input type="number" step="0.01" value={slamLoopClosureThreshold} onChange={(e) => setSlamLoopClosureThreshold(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">Detection (Mask R-CNN) Parameters</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Anchor Scales</label>
                          <input type="text" value={detectionAnchorScales} onChange={(e) => setDetectionAnchorScales(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" placeholder="[8, 16, 32, 64, 128]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">NMS Threshold</label>
                          <input type="number" step="0.01" value={detectionNmsThreshold} onChange={(e) => setDetectionNmsThreshold(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">ROI Pool Size</label>
                          <input type="number" value={detectionRoiPoolSize} onChange={(e) => setDetectionRoiPoolSize(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {componentType === 'Policy/Control' && (
                  <>
                    <div className="border-t border-slate-700 pt-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">General Training</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Learning Rate</label>
                          <input type="number" step="0.0001" value={policyLearningRate} onChange={(e) => setPolicyLearningRate(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Batch Size</label>
                          <input type="number" value={policyBatchSize} onChange={(e) => setPolicyBatchSize(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Iterations</label>
                          <input type="number" value={policyIterations} onChange={(e) => setPolicyIterations(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">RL (PPO-LSTM) Parameters</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Gamma (Discount)</label>
                          <input type="number" step="0.01" value={rlGamma} onChange={(e) => setRlGamma(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Lambda (GAE)</label>
                          <input type="number" step="0.01" value={rlLambda} onChange={(e) => setRlLambda(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Clip Epsilon</label>
                          <input type="number" step="0.01" value={rlClipEpsilon} onChange={(e) => setRlClipEpsilon(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Value Coefficient</label>
                          <input type="number" step="0.1" value={rlValueCoef} onChange={(e) => setRlValueCoef(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Entropy Coefficient</label>
                          <input type="number" step="0.001" value={rlEntropyCoef} onChange={(e) => setRlEntropyCoef(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                      </div>
                </div>
                  </>
                )}

                {componentType === 'Planner' && (
                  <>
                    <div className="border-t border-slate-700 pt-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">MPC Parameters</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Horizon Length</label>
                          <input type="number" value={mpcHorizonLength} onChange={(e) => setMpcHorizonLength(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Time Step (dt)</label>
                          <input type="number" step="0.01" value={mpcDt} onChange={(e) => setMpcDt(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Max Iterations</label>
                          <input type="number" value={mpcMaxIterations} onChange={(e) => setMpcMaxIterations(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Convergence Tolerance</label>
                          <input type="text" value={mpcConvergenceTolerance} onChange={(e) => setMpcConvergenceTolerance(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" placeholder="1e-4" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Position Weight</label>
                          <input type="number" step="0.1" value={mpcPositionWeight} onChange={(e) => setMpcPositionWeight(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Velocity Weight</label>
                          <input type="number" step="0.1" value={mpcVelocityWeight} onChange={(e) => setMpcVelocityWeight(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Control Weight</label>
                          <input type="number" step="0.1" value={mpcControlWeight} onChange={(e) => setMpcControlWeight(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                      </div>
                </div>
                  </>
                )}

                {componentType === 'High-level reasoning' && (
                  <>
                    <div className="border-t border-slate-700 pt-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">General Training</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Learning Rate</label>
                          <input type="text" value={llmLearningRate} onChange={(e) => setLlmLearningRate(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" placeholder="2e-5" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Batch Size</label>
                          <input type="number" value={llmBatchSize} onChange={(e) => setLlmBatchSize(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Epochs</label>
                          <input type="number" value={llmEpochs} onChange={(e) => setLlmEpochs(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">LLM Parameters</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Temperature</label>
                          <input type="number" step="0.1" value={llmTemperature} onChange={(e) => setLlmTemperature(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Max Tokens</label>
                          <input type="number" value={llmMaxTokens} onChange={(e) => setLlmMaxTokens(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Top P</label>
                          <input type="number" step="0.01" value={llmTopP} onChange={(e) => setLlmTopP(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Top K</label>
                          <input type="number" value={llmTopK} onChange={(e) => setLlmTopK(e.target.value)} disabled={isTraining} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                        </div>
                      </div>
                </div>
                  </>
                )}

                {/* Start Training Button */}
                <button
                  onClick={handleStartTraining}
                  disabled={isTraining || !selectedDataset || !modelName.trim() || (trainingMode === 'improve' && !selectedBaseModel)}
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

