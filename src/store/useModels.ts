import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelRun } from '../types';
import { generateModelVersion, generateExportVersion, generateFleetVersion } from '../utils/versionUtils';
import { generateTrainingMetrics, generateValidationMetrics, generateExportSize } from '../utils/randomMetrics';

interface ModelsState {
  models: ModelRun[];
  currentJob: { id: string; progress: number; logs: string[] } | null;
  
  addModel: (model: Omit<ModelRun, 'id' | 'version' | 'createdAt' | 'status'>) => ModelRun;
  updateModel: (id: string, updates: Partial<ModelRun>) => void;
  getModel: (id: string) => ModelRun | undefined;
  startTraining: (id: string) => void;
  completeTraining: (id: string) => void;
  startValidation: (id: string) => void;
  completeValidation: (id: string, simulator: 'Isaac Sim' | 'Gazebo' | 'Isaac Gym') => void;
  startExport: (id: string) => void;
  completeExport: (id: string, format: string) => void;
  deployModel: (id: string, robotIds: string[], deploymentType?: 'ROS2' | 'Docker' | 'Orin' | 'A100') => void;
  setJobProgress: (progress: number, logs: string[]) => void;
  clearJob: () => void;
}

export const useModels = create<ModelsState>()(
  persist(
    (set, get) => ({
      models: [],
      currentJob: null,

      addModel: (modelData) => {
        const newModel: ModelRun = {
          ...modelData,
          id: crypto.randomUUID(),
          version: generateModelVersion(get().models.map(m => m.version)),
          createdAt: new Date().toISOString(),
          status: 'idle',
        };
        set(state => ({ models: [...state.models, newModel] }));
        return newModel;
      },

      updateModel: (id, updates) => {
        set(state => ({
          models: state.models.map(m => m.id === id ? { ...m, ...updates } : m)
        }));
      },

      getModel: (id) => {
        return get().models.find(m => m.id === id);
      },

      startTraining: (id) => {
        set(state => ({
          models: state.models.map(m => 
            m.id === id ? { ...m, status: 'training' } : m
          ),
          currentJob: { id, progress: 0, logs: [] }
        }));
      },

      completeTraining: (id) => {
        const metrics = generateTrainingMetrics();
        set(state => ({
          models: state.models.map(m => 
            m.id === id ? { 
              ...m, 
              status: 'idle', 
              metrics,
              trainingLogs: state.currentJob?.logs || []
            } : m
          ),
        }));
      },

      startValidation: (id) => {
        set(state => ({
          models: state.models.map(m => 
            m.id === id ? { ...m, status: 'validating' } : m
          ),
          currentJob: { id, progress: 0, logs: [] }
        }));
      },

      completeValidation: (id, simulator) => {
        const validationMetrics = generateValidationMetrics();
        set(state => ({
          models: state.models.map(m => 
            m.id === id ? { 
              ...m, 
              status: 'idle',
              validation: {
                simulator,
                ...validationMetrics
              }
            } : m
          ),
        }));
      },

      startExport: (id) => {
        set(state => ({
          models: state.models.map(m => 
            m.id === id ? { ...m, status: 'exporting' } : m
          ),
          currentJob: { id, progress: 0, logs: [] }
        }));
      },

      completeExport: (id, format) => {
        const existingExports = get().models
          .filter(m => m.export?.exportVersion)
          .map(m => m.export!.exportVersion);
        
        const exportVersion = generateExportVersion(existingExports);
        const fileSizeMB = generateExportSize();
        
        set(state => ({
          models: state.models.map(m => 
            m.id === id ? { 
              ...m, 
              status: 'idle',
              export: {
                format,
                fileSizeMB,
                optimizedAt: new Date().toISOString(),
                exportVersion
              }
            } : m
          ),
        }));
      },

      deployModel: (id, robotIds, deploymentType?: 'ROS2' | 'Docker' | 'Orin' | 'A100') => {
        const model = get().models.find(m => m.id === id);
        if (!model) return;

        const fleetVersion = generateFleetVersion(model.version);
        
        set(state => ({
          models: state.models.map(m => 
            m.id === id ? { 
              ...m, 
              status: 'deployed',
              deployment: {
                fleetVersion,
                timestamp: new Date().toISOString(),
                robotIds,
                deploymentType: deploymentType || 'ROS2'
              }
            } : m
          ),
        }));
      },

      setJobProgress: (progress, logs) => {
        set(state => ({
          currentJob: state.currentJob ? { ...state.currentJob, progress, logs } : null
        }));
      },

      clearJob: () => {
        set({ currentJob: null });
      },
    }),
    {
      name: 'roboml-models-storage',
    }
  )
);

