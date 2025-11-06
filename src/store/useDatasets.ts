import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Dataset {
  id: string;
  version: string;
  name: string;
  type: 'Training' | 'Validation' | 'Test';
  size: number; // in MB
  samples: number;
  format: 'COCO' | 'YOLO' | 'TFRecord' | 'Custom';
  description: string;
  tags: string[];
  createdAt: string;
  uploadedBy: string;
  s3Path?: string;
  metadata?: {
    classes?: string[];
    resolution?: string;
    augmented?: boolean;
  };
}

interface DatasetsState {
  datasets: Dataset[];
  addDataset: (dataset: Omit<Dataset, 'id' | 'version' | 'createdAt'>) => Dataset;
  updateDataset: (id: string, updates: Partial<Dataset>) => void;
  deleteDataset: (id: string) => void;
  getDataset: (id: string) => Dataset | undefined;
  getDatasetByVersion: (version: string) => Dataset | undefined;
  exportDatasetInfo: (id: string) => string;
}

const generateDatasetVersion = (existingVersions: string[]): string => {
  const numbers = existingVersions
    .map(v => parseInt(v.replace('DS-', ''), 10))
    .filter(n => !isNaN(n));
  
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `DS-${String(maxNumber + 1).padStart(3, '0')}`;
};

// Initialize with some sample datasets
const initializeDatasets = (): Dataset[] => {
  return [
    {
      id: crypto.randomUUID(),
      version: 'DS-001',
      name: 'Robot Navigation Dataset',
      type: 'Training',
      size: 2450,
      samples: 15000,
      format: 'COCO',
      description: 'Indoor navigation scenarios with obstacle detection',
      tags: ['navigation', 'obstacles', 'indoor'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'admin',
      s3Path: 's3://roboml/datasets/nav-v1/',
      metadata: {
        classes: ['obstacle', 'path', 'wall', 'door'],
        resolution: '640x480',
        augmented: true,
      },
    },
    {
      id: crypto.randomUUID(),
      version: 'DS-002',
      name: 'Object Detection - Warehouse',
      type: 'Training',
      size: 3200,
      samples: 22000,
      format: 'YOLO',
      description: 'Warehouse object detection with various lighting conditions',
      tags: ['detection', 'warehouse', 'objects'],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'admin',
      s3Path: 's3://roboml/datasets/warehouse-v2/',
      metadata: {
        classes: ['box', 'pallet', 'forklift', 'person', 'shelf'],
        resolution: '1280x720',
        augmented: true,
      },
    },
    {
      id: crypto.randomUUID(),
      version: 'DS-003',
      name: 'Validation Set - Mixed Environments',
      type: 'Validation',
      size: 850,
      samples: 5000,
      format: 'COCO',
      description: 'Diverse validation set for model evaluation',
      tags: ['validation', 'mixed', 'diverse'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'admin',
      s3Path: 's3://roboml/datasets/validation-mixed/',
      metadata: {
        classes: ['obstacle', 'path', 'object'],
        resolution: '640x480',
        augmented: false,
      },
    },
  ];
};

export const useDatasets = create<DatasetsState>()(
  persist(
    (set, get) => ({
      datasets: [],

      addDataset: (datasetData) => {
        const existingVersions = get().datasets.map(d => d.version);
        const newDataset: Dataset = {
          ...datasetData,
          id: crypto.randomUUID(),
          version: generateDatasetVersion(existingVersions),
          createdAt: new Date().toISOString(),
        };
        set(state => ({ datasets: [...state.datasets, newDataset] }));
        return newDataset;
      },

      updateDataset: (id, updates) => {
        set(state => ({
          datasets: state.datasets.map(d => d.id === id ? { ...d, ...updates } : d)
        }));
      },

      deleteDataset: (id) => {
        set(state => ({
          datasets: state.datasets.filter(d => d.id !== id)
        }));
      },

      getDataset: (id) => {
        return get().datasets.find(d => d.id === id);
      },

      getDatasetByVersion: (version) => {
        return get().datasets.find(d => d.version === version);
      },

      exportDatasetInfo: (id) => {
        const dataset = get().getDataset(id);
        if (!dataset) return '';
        
        return JSON.stringify(dataset, null, 2);
      },
    }),
    {
      name: 'roboml-datasets-storage',
      onRehydrateStorage: () => (state) => {
        // Initialize with sample datasets if empty
        if (state && state.datasets.length === 0) {
          state.datasets = initializeDatasets();
        }
      },
    }
  )
);

