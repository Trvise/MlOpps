import { generateTrainingMetrics, generateValidationMetrics, generateExportSize } from './randomMetrics';
import { ComponentType } from '../types';

const getComponentTrainingLogs = (componentType: ComponentType, epochs: number = 10): string[] => {
  const baseLogs: Record<ComponentType, string[]> = {
    'Perception': [
      'Initializing DROID-SLAM environment...',
      'Loading visual odometry dataset...',
      'Configuring Mask R-CNN backbone (ResNet-50)...',
      'Setting up feature extractor...',
      'Initializing SLAM frontend...',
      'Starting perception training loop...',
      ...Array.from({ length: epochs }, (_, i) => `Epoch ${i + 1}/${epochs}: SLAM loss=0.${(523 - i * 35).toString().padStart(3, '0')}, Detection mAP=0.${(845 + i * 13).toString().padStart(3, '0')}`),
      'Optimizing feature matching...',
      'Saving DROID-SLAM checkpoint...',
      'Saving Mask R-CNN weights...',
      'Training completed successfully!',
    ],
    'Policy/Control': [
      'Initializing Isaac Gym environment...',
      'Loading robot URDF and assets...',
      'Setting up RL environment (PyTorch)...',
      'Configuring PPO/PPO-LSTM agent...',
      'Spawning parallel environments (4096)...',
      'Starting RL training loop...',
      ...Array.from({ length: epochs }, (_, i) => `Iteration ${i + 1}/${epochs}: Reward=${(523 + i * 45).toFixed(1)}, Policy Loss=0.${(523 - i * 35).toString().padStart(3, '0')}`),
      'Updating policy network...',
      'Saving policy checkpoint...',
      'Training completed successfully!',
    ],
    'Planner': [
      'Initializing CasADi optimization framework...',
      'Loading robot dynamics model...',
      'Setting up MPC problem formulation...',
      'Configuring cost function and constraints...',
      'Initializing solver (IPOPT)...',
      'Starting optimization loop...',
      ...Array.from({ length: epochs }, (_, i) => `Iteration ${i + 1}/${epochs}: Cost=${(523 - i * 35).toFixed(2)}, Convergence=${(85 + i * 1.3).toFixed(1)}%`),
      'Optimizing trajectory...',
      'Validating constraint satisfaction...',
      'Saving MPC parameters...',
      'Training completed successfully!',
    ],
    'High-level reasoning': [
      'Initializing LangChain framework...',
      'Loading LLM model (OpenVLA/GPT-4)...',
      'Setting up prompt templates...',
      'Configuring chain of thought reasoning...',
      'Loading task-specific datasets...',
      'Starting fine-tuning loop...',
      ...Array.from({ length: epochs }, (_, i) => `Epoch ${i + 1}/${epochs}: Loss=0.${(523 - i * 35).toString().padStart(3, '0')}, Task Accuracy=0.${(845 + i * 13).toString().padStart(3, '0')}`),
      'Updating language model weights...',
      'Saving fine-tuned model...',
      'Training completed successfully!',
    ],
  };

  return baseLogs[componentType] || [
    'Initializing training environment...',
    'Loading dataset...',
    'Building neural network architecture...',
    'Starting training loop...',
    ...Array.from({ length: epochs }, (_, i) => `Epoch ${i + 1}/${epochs}: loss=0.${(523 - i * 35).toString().padStart(3, '0')}, accuracy=0.${(845 + i * 13).toString().padStart(3, '0')}`),
    'Saving model checkpoint...',
    'Training completed successfully!',
  ];
};

const trainingLogs = [
  'Initializing training environment...',
  'Loading dataset...',
  'Building neural network architecture...',
  'Starting training loop...',
  'Epoch 1/10: loss=0.523, accuracy=0.845',
  'Epoch 2/10: loss=0.412, accuracy=0.892',
  'Epoch 3/10: loss=0.345, accuracy=0.915',
  'Epoch 4/10: loss=0.289, accuracy=0.933',
  'Epoch 5/10: loss=0.245, accuracy=0.948',
  'Epoch 6/10: loss=0.212, accuracy=0.959',
  'Epoch 7/10: loss=0.189, accuracy=0.967',
  'Epoch 8/10: loss=0.171, accuracy=0.973',
  'Epoch 9/10: loss=0.158, accuracy=0.978',
  'Epoch 10/10: loss=0.149, accuracy=0.981',
  'Saving model checkpoint...',
  'Training completed successfully!',
];

const getComponentValidationLogs = (componentType: ComponentType, simulator: string): string[] => {
  const baseLogs: Record<ComponentType, string[]> = {
    'Perception': [
      `Initializing ${simulator} environment...`,
      'Loading DROID-SLAM model weights...',
      'Loading Mask R-CNN checkpoint...',
      'Spawning test scenarios...',
      'Running visual odometry tests...',
      'Testing object detection accuracy...',
      'Measuring SLAM tracking precision...',
      'Evaluating detection mAP...',
      'Recording inference latency...',
      'Validation completed!',
    ],
    'Policy/Control': [
      `Initializing ${simulator === 'Isaac Gym' ? 'Isaac Gym' : simulator} environment...`,
      'Loading RL policy weights...',
      'Spawning robot environments...',
      'Running control policy tests...',
      'Testing trajectory tracking...',
      'Evaluating reward performance...',
      'Measuring control latency...',
      'Recording FPS metrics...',
      'Evaluating safety protocols...',
      'Validation completed!',
    ],
    'Planner': [
      `Initializing ${simulator} environment...`,
      'Loading MPC parameters...',
      'Setting up planning scenarios...',
      'Running trajectory optimization tests...',
      'Testing constraint satisfaction...',
      'Evaluating path smoothness...',
      'Measuring planning latency...',
      'Recording optimization metrics...',
      'Validation completed!',
    ],
    'High-level reasoning': [
      `Initializing ${simulator} environment...`,
      'Loading LLM model...',
      'Setting up reasoning tasks...',
      'Running task planning tests...',
      'Testing decision-making accuracy...',
      'Evaluating reasoning quality...',
      'Measuring inference latency...',
      'Recording task success rate...',
      'Validation completed!',
    ],
  };

  return baseLogs[componentType] || [
    `Initializing ${simulator} environment...`,
    'Loading model weights...',
    'Spawning test scenarios...',
    'Running collision avoidance tests...',
    'Testing path planning accuracy...',
    'Measuring inference latency...',
    'Recording FPS metrics...',
    'Evaluating safety protocols...',
    'Validation completed!',
  ];
};

const validationLogs = [
  'Initializing simulator environment...',
  'Loading model weights...',
  'Spawning test scenarios...',
  'Running collision avoidance tests...',
  'Testing path planning accuracy...',
  'Measuring inference latency...',
  'Recording FPS metrics...',
  'Evaluating safety protocols...',
  'Validation completed!',
];

const exportLogs = [
  'Loading model for conversion...',
  'Optimizing graph structure...',
  'Applying quantization...',
  'Converting layers...',
  'Verifying output accuracy...',
  'Packaging model artifact...',
  'Export completed!',
];

export const simulateTraining = (
  onProgress: (progress: number, logs: string[]) => void,
  onComplete: () => void,
  totalEpochs: number = 10,
  componentType?: ComponentType
): (() => void) => {
  const logsCopy = componentType 
    ? [...getComponentTrainingLogs(componentType, totalEpochs)]
    : [...trainingLogs];
  let currentProgress = 0;
  let currentLogs: string[] = [];
  let cancelled = false;

  const interval = setInterval(() => {
    if (cancelled) {
      clearInterval(interval);
      return;
    }

    if (currentProgress < logsCopy.length) {
      currentLogs.push(logsCopy[currentProgress]);
      currentProgress++;
      const progress = (currentProgress / logsCopy.length) * 100;
      onProgress(progress, [...currentLogs]);

      if (currentProgress >= logsCopy.length) {
        clearInterval(interval);
        setTimeout(() => {
          if (!cancelled) onComplete();
        }, 500);
      }
    }
  }, 800);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
};

export const simulateValidation = (
  onProgress: (progress: number, logs: string[]) => void,
  onComplete: () => void,
  simulator: string = 'Isaac Sim',
  componentType?: ComponentType
): (() => void) => {
  const logsCopy = componentType
    ? [...getComponentValidationLogs(componentType, simulator)]
    : [...validationLogs];
  let currentProgress = 0;
  let currentLogs: string[] = [];
  let cancelled = false;

  const interval = setInterval(() => {
    if (cancelled) {
      clearInterval(interval);
      return;
    }

    if (currentProgress < logsCopy.length) {
      currentLogs.push(logsCopy[currentProgress]);
      currentProgress++;
      const progress = (currentProgress / logsCopy.length) * 100;
      onProgress(progress, [...currentLogs]);

      if (currentProgress >= logsCopy.length) {
        clearInterval(interval);
        setTimeout(() => {
          if (!cancelled) onComplete();
        }, 500);
      }
    }
  }, 600);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
};

export const simulateExport = (
  onProgress: (progress: number, logs: string[]) => void,
  onComplete: () => void
): (() => void) => {
  const logsCopy = [...exportLogs];
  let currentProgress = 0;
  let currentLogs: string[] = [];
  let cancelled = false;

  const interval = setInterval(() => {
    if (cancelled) {
      clearInterval(interval);
      return;
    }

    if (currentProgress < logsCopy.length) {
      currentLogs.push(logsCopy[currentProgress]);
      currentProgress++;
      const progress = (currentProgress / logsCopy.length) * 100;
      onProgress(progress, [...currentLogs]);

      if (currentProgress >= logsCopy.length) {
        clearInterval(interval);
        setTimeout(() => {
          if (!cancelled) onComplete();
        }, 500);
      }
    }
  }, 700);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
};
