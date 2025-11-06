export interface ModelRun {
  id: string;
  version: string;
  framework: 'PyTorch' | 'TensorFlow';
  hyperparams: Record<string, string | number>;
  datasetVersion: string;
  metrics?: { accuracy: number; loss: number };
  validation?: {
    simulator: 'Isaac Sim' | 'Gazebo';
    safety: number;
    latency: number;
    fps: number;
  };
  export?: {
    format: string;
    fileSizeMB: number;
    optimizedAt: string;
    exportVersion: string;
  };
  deployment?: { fleetVersion: string; timestamp: string; robotIds: string[] };
  status: 'idle' | 'training' | 'validating' | 'exporting' | 'deployed';
  createdAt: string;
  trainingLogs?: string[];
}

export interface HistoryEvent {
  id: string;
  modelVersion: string;
  type: 'Train' | 'Validate' | 'Export' | 'Deploy' | 'Rollback';
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface Robot {
  id: string;
  name: string;
  currentModelVersion: string;
  status: 'online' | 'offline';
  lastSync: string;
}

export interface Job {
  id: string;
  type: 'training' | 'validating' | 'exporting';
  modelId: string;
  progress: number;
  status: 'running' | 'completed' | 'failed';
  logs: string[];
}

