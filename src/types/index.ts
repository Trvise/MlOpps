export type ComponentType = 
  | 'Perception' 
  | 'Policy/Control' 
  | 'Planner' 
  | 'High-level reasoning';

export interface ModelRun {
  id: string;
  version: string;
  componentType: ComponentType;
  framework: 'PyTorch' | 'TensorFlow' | 'CasADi' | 'LangChain';
  hyperparams: Record<string, string | number>;
  datasetVersion: string;
  metrics?: { accuracy: number; loss: number };
  validation?: {
    simulator: 'Isaac Sim' | 'Gazebo' | 'Isaac Gym';
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
  deployment?: { 
    fleetVersion: string; 
    timestamp: string; 
    robotIds: string[];
    deploymentType?: 'ROS2' | 'Docker' | 'Orin' | 'A100';
  };
  status: 'idle' | 'training' | 'validating' | 'exporting' | 'deployed';
  createdAt: string;
  trainingLogs?: string[];
  // Component-specific metadata
  componentConfig?: {
    perception?: {
      slamType?: 'DROID-SLAM';
      detectionModel?: 'Mask R-CNN';
    };
    policy?: {
      trainingEnv?: 'Isaac Gym';
      algorithm?: string;
    };
    planner?: {
      solver?: 'CasADi';
      mpcHorizon?: number;
    };
    reasoning?: {
      llmType?: 'OpenVLA' | 'GPT-4';
      framework?: 'LangChain';
    };
  };
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
  hardware?: 'Orin' | 'A100' | 'Other';
  deploymentType?: 'ROS2' | 'Docker';
}

export interface Job {
  id: string;
  type: 'training' | 'validating' | 'exporting';
  modelId: string;
  progress: number;
  status: 'running' | 'completed' | 'failed';
  logs: string[];
}

