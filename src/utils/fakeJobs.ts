import { generateTrainingMetrics, generateValidationMetrics, generateExportSize } from './randomMetrics';

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
  totalEpochs: number = 10
): (() => void) => {
  const logsCopy = [...trainingLogs];
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
  onComplete: () => void
): (() => void) => {
  const logsCopy = [...validationLogs];
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
