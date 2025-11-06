export const generateTrainingMetrics = () => {
  return {
    accuracy: Math.random() * 0.15 + 0.85, // 85-100%
    loss: Math.random() * 0.3 + 0.05, // 0.05-0.35
  };
};

export const generateValidationMetrics = () => {
  return {
    safety: Math.random() * 0.1 + 0.9, // 90-100%
    latency: Math.random() * 30 + 10, // 10-40ms
    fps: Math.random() * 30 + 90, // 90-120 FPS
  };
};

export const generateExportSize = (): number => {
  return Math.random() * 500 + 50; // 50-550 MB
};

export const generateDatasetVersion = (): string => {
  const num = Math.floor(Math.random() * 10) + 1;
  return `DS-${String(num).padStart(3, '0')}`;
};

