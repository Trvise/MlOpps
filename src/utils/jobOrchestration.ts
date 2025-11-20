import { ComponentType } from '../types';

const getComponentTrainingLogs = (componentType: ComponentType, epochs: number = 10): string[] => {
  // Helper function to generate decreasing loss values that never go negative
  const generateLoss = (epoch: number, totalEpochs: number, startLoss: number = 0.523, minLoss: number = 0.05): string => {
    // Calculate loss that decreases from startLoss to minLoss over epochs
    // Using exponential decay for more realistic training curve
    const progress = epoch / totalEpochs;
    const loss = startLoss * Math.pow(minLoss / startLoss, progress);
    // Ensure loss never goes below minLoss
    const clampedLoss = Math.max(loss, minLoss);
    return clampedLoss.toFixed(3);
  };

  // Helper function to generate increasing accuracy values
  const generateAccuracy = (epoch: number, totalEpochs: number, startAccuracy: number = 0.845, maxAccuracy: number = 0.99): string => {
    const progress = epoch / totalEpochs;
    const accuracy = startAccuracy + (maxAccuracy - startAccuracy) * progress;
    const clampedAccuracy = Math.min(accuracy, maxAccuracy);
    return clampedAccuracy.toFixed(3);
  };

  const baseLogs: Record<ComponentType, string[]> = {
    'Perception': [
      'Initializing DROID-SLAM environment...',
      'Loading visual odometry dataset...',
      'Configuring Mask R-CNN backbone (ResNet-50)...',
      'Setting up feature extractor...',
      'Initializing SLAM frontend...',
      'Starting perception training loop...',
      ...Array.from({ length: epochs }, (_, i) => {
        const loss = generateLoss(i + 1, epochs, 0.523, 0.08);
        const accuracy = generateAccuracy(i + 1, epochs, 0.845, 0.98);
        return `Epoch ${i + 1}/${epochs}: SLAM loss=${loss}, Detection mAP=${accuracy}`;
      }),
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
      ...Array.from({ length: epochs }, (_, i) => {
        const reward = (523 + i * 45).toFixed(1);
        const loss = generateLoss(i + 1, epochs, 0.523, 0.10);
        return `Iteration ${i + 1}/${epochs}: Reward=${reward}, Policy Loss=${loss}`;
      }),
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
      ...Array.from({ length: epochs }, (_, i) => {
        const cost = generateLoss(i + 1, epochs, 0.523, 0.05);
        const convergence = Math.min(85 + i * 1.3, 99.5).toFixed(1);
        return `Iteration ${i + 1}/${epochs}: Cost=${cost}, Convergence=${convergence}%`;
      }),
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
      ...Array.from({ length: epochs }, (_, i) => {
        const loss = generateLoss(i + 1, epochs, 0.523, 0.08);
        const accuracy = generateAccuracy(i + 1, epochs, 0.845, 0.97);
        return `Epoch ${i + 1}/${epochs}: Loss=${loss}, Task Accuracy=${accuracy}`;
      }),
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
    ...Array.from({ length: epochs }, (_, i) => {
      const loss = generateLoss(i + 1, epochs, 0.523, 0.08);
      const accuracy = generateAccuracy(i + 1, epochs, 0.845, 0.98);
      return `Epoch ${i + 1}/${epochs}: loss=${loss}, accuracy=${accuracy}`;
    }),
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
      'Loading scene configuration and assets...',
      'Setting up camera sensors and calibration...',
      'Loading DROID-SLAM model weights...',
      'Loading Mask R-CNN checkpoint...',
      'Initializing feature extractor pipeline...',
      'Spawning test scenarios (10 scenarios)...',
      'Running visual odometry tests...',
      'Testing SLAM tracking accuracy...',
      'Evaluating loop closure detection...',
      'Testing object detection accuracy...',
      'Running detection on 1000 test frames...',
      'Measuring SLAM tracking precision...',
      'Evaluating detection mAP across classes...',
      'Computing pose estimation error...',
      'Recording inference latency (1000 iterations)...',
      'Analyzing memory usage...',
      'Generating validation report...',
      'Validation completed!',
    ],
    'Policy/Control': [
      `Initializing ${simulator === 'Isaac Gym' ? 'Isaac Gym' : simulator} environment...`,
      'Loading robot URDF and mesh files...',
      'Setting up physics engine...',
      'Loading RL policy weights...',
      'Initializing action space and observation space...',
      'Spawning robot environments (5 parallel instances)...',
      'Running control policy tests...',
      'Testing trajectory tracking (50 trajectories)...',
      'Evaluating reward performance...',
      'Running safety constraint checks...',
      'Testing collision avoidance...',
      'Measuring control latency (1000 control cycles)...',
      'Recording FPS metrics...',
      'Evaluating stability and convergence...',
      'Testing emergency stop protocols...',
      'Running stress tests...',
      'Generating performance metrics...',
      'Validation completed!',
    ],
    'Planner': [
      `Initializing ${simulator} environment...`,
      'Loading robot dynamics model...',
      'Setting up obstacle map...',
      'Loading MPC parameters...',
      'Initializing optimization solver...',
      'Setting up planning scenarios (20 scenarios)...',
      'Running trajectory optimization tests...',
      'Testing constraint satisfaction...',
      'Evaluating path smoothness...',
      'Testing dynamic obstacle avoidance...',
      'Running replanning tests...',
      'Measuring planning latency (500 planning cycles)...',
      'Recording optimization metrics...',
      'Evaluating solution quality...',
      'Testing edge cases...',
      'Generating validation report...',
      'Validation completed!',
    ],
    'High-level reasoning': [
      `Initializing ${simulator} environment...`,
      'Loading scene and task definitions...',
      'Loading LLM model weights...',
      'Initializing tokenizer and embeddings...',
      'Setting up reasoning tasks (15 tasks)...',
      'Running task planning tests...',
      'Testing decision-making accuracy...',
      'Evaluating reasoning quality...',
      'Running multi-step reasoning tests...',
      'Testing error recovery...',
      'Measuring inference latency (100 queries)...',
      'Recording task success rate...',
      'Evaluating response quality...',
      'Testing edge cases and failures...',
      'Generating validation report...',
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
  'Loading scene configuration and assets...',
  'Loading model weights...',
  'Setting up test scenarios...',
  'Spawning test scenarios (10 scenarios)...',
  'Running collision avoidance tests...',
  'Testing path planning accuracy...',
  'Running performance benchmarks...',
  'Measuring inference latency (1000 iterations)...',
  'Recording FPS metrics...',
  'Evaluating safety protocols...',
  'Running stress tests...',
  'Generating validation report...',
  'Validation completed!',
];

const exportLogs = [
  'Loading model for conversion...',
  'Analyzing model architecture...',
  'Optimizing graph structure...',
  'Removing unused nodes...',
  'Folding batch normalization...',
  'Applying quantization (INT8)...',
  'Optimizing operator fusion...',
  'Converting layers (0/100)...',
  'Converting layers (25/100)...',
  'Converting layers (50/100)...',
  'Converting layers (75/100)...',
  'Converting layers (100/100)...',
  'Running inference tests...',
  'Verifying output accuracy...',
  'Comparing outputs with original model...',
  'Optimizing memory layout...',
  'Compressing model weights...',
  'Packaging model artifact...',
  'Generating metadata...',
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
  }, 1200);

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
  }, 1500);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
};

const deploymentLogs = [
  'Preparing deployment package...',
  'Validating model artifacts...',
  'Checking robot connectivity...',
  'Uploading model to robots (0/0)...',
  'Installing dependencies...',
  'Configuring ROS2 nodes...',
  'Setting up Docker containers...',
  'Initializing model runtime...',
  'Running health checks...',
  'Verifying deployment...',
  'Activating model on fleet...',
  'Deployment completed!',
];

export const simulateDeployment = (
  onProgress: (progress: number, logs: string[]) => void,
  onComplete: () => void,
  robotCount: number
): (() => void) => {
  const logsCopy = [...deploymentLogs];
  // Update upload log with actual robot count
  const uploadIndex = logsCopy.findIndex(log => log.includes('Uploading model'));
  if (uploadIndex !== -1) {
    logsCopy[uploadIndex] = `Uploading model to robots (0/${robotCount})...`;
  }
  
  let currentProgress = 0;
  let currentLogs: string[] = [];
  let cancelled = false;

  const interval = setInterval(() => {
    if (cancelled) {
      clearInterval(interval);
      return;
    }

    if (currentProgress < logsCopy.length) {
      // Update upload progress for multiple robots
      if (currentProgress === uploadIndex && robotCount > 1) {
        const uploaded = Math.min(Math.floor((currentProgress / logsCopy.length) * robotCount), robotCount);
        currentLogs.push(`Uploading model to robots (${uploaded}/${robotCount})...`);
      } else {
        currentLogs.push(logsCopy[currentProgress]);
      }
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
  }, 1800);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
};

