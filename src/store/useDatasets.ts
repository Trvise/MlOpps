import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SearchInstance {
  timestamp: number;
  similarity: number;
  dataValues: Record<string, number>;
  matchedCriteria: string[];
  visualQuery?: string;
}

export interface Dataset {
  id: string;
  version: string;
  name: string;
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
  // Search-based dataset fields
  isSearchBased?: boolean;
  sourceVideo?: string;
  sourceCsv?: string;
  searchQuery?: string;
  searchInstances?: SearchInstance[];
  // Dataset splits - all datasets have all 3 splits
  splits: {
    train: SearchInstance[];
    test: SearchInstance[];
    inference: SearchInstance[];
  };
  tokenizationConfig?: {
    skipFrames: number;
    maxFrames?: number;
    embeddingsDir?: string;
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
  createSearchDataset: (name: string, searchQuery: string, instances: SearchInstance[], sourceVideo: string, sourceCsv: string, split: 'train' | 'test' | 'inference', tokenizationConfig: any, description?: string, tags?: string[]) => Dataset;
  createSearchDatasetWithSplits: (name: string, searchQuery: string, trainInstances: SearchInstance[], testInstances: SearchInstance[], inferenceInstances: SearchInstance[], sourceVideo: string, sourceCsv: string, tokenizationConfig: any, description?: string, tags?: string[]) => Dataset;
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
      size: 2450,
      samples: 15000,
      format: 'COCO',
      description: 'Indoor navigation scenarios with obstacle detection',
      tags: ['navigation', 'obstacles', 'indoor'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'admin',
      s3Path: 's3://roboml/datasets/nav-v1/',
      splits: {
        train: [],
        test: [],
        inference: [],
      },
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
      size: 3200,
      samples: 22000,
      format: 'YOLO',
      description: 'Warehouse object detection with various lighting conditions',
      tags: ['detection', 'warehouse', 'objects'],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'admin',
      s3Path: 's3://roboml/datasets/warehouse-v2/',
      splits: {
        train: [],
        test: [],
        inference: [],
      },
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
      size: 850,
      samples: 5000,
      format: 'COCO',
      description: 'Diverse validation set for model evaluation',
      tags: ['validation', 'mixed', 'diverse'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'admin',
      s3Path: 's3://roboml/datasets/validation-mixed/',
      splits: {
        train: [],
        test: [],
        inference: [],
      },
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
          // Ensure splits exist
          splits: datasetData.splits || {
            train: [],
            test: [],
            inference: [],
          },
        };
        set(state => ({ datasets: [...state.datasets, newDataset] }));
        return newDataset;
      },

      updateDataset: (id, updates) => {
        set(state => ({
          datasets: state.datasets.map(d => {
            if (d.id === id) {
              const updated = { ...d, ...updates };
              // Ensure splits always exist
              if (!updated.splits) {
                updated.splits = {
                  train: d.splits?.train || [],
                  test: d.splits?.test || [],
                  inference: d.splits?.inference || [],
                };
              }
              return updated;
            }
            return d;
          })
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

      createSearchDataset: (name, searchQuery, instances, sourceVideo, sourceCsv, split, tokenizationConfig, customDescription, customTags) => {
        const existingVersions = get().datasets.map(d => d.version);
        const splits = {
          train: split === 'train' ? instances : [],
          test: split === 'test' ? instances : [],
          inference: split === 'inference' ? instances : [],
        };
        const totalSamples = instances.length;
        const defaultDescription = `Curated dataset from agentic search: "${searchQuery}"`;
        const defaultTags = ['search-based', 'curated', 'agentic'];
        const newDataset: Dataset = {
          id: crypto.randomUUID(),
          version: generateDatasetVersion(existingVersions),
          name,
          size: totalSamples * 0.5, // Estimate: ~0.5MB per instance
          samples: totalSamples,
          format: 'Custom',
          description: customDescription || defaultDescription,
          tags: customTags && customTags.length > 0 ? customTags : defaultTags,
          createdAt: new Date().toISOString(),
          uploadedBy: 'system',
          isSearchBased: true,
          sourceVideo,
          sourceCsv,
          searchQuery,
          searchInstances: instances, // Keep for backward compatibility
          splits,
          tokenizationConfig,
          metadata: {
            classes: [],
            resolution: 'variable',
            augmented: false,
          },
        };
        set(state => ({ datasets: [...state.datasets, newDataset] }));
        return newDataset;
      },

      createSearchDatasetWithSplits: (name, searchQuery, trainInstances, testInstances, inferenceInstances, sourceVideo, sourceCsv, tokenizationConfig, customDescription, customTags) => {
        const existingVersions = get().datasets.map(d => d.version);
        const splits = {
          train: trainInstances,
          test: testInstances,
          inference: inferenceInstances,
        };
        const totalSamples = trainInstances.length + testInstances.length + inferenceInstances.length;
        const defaultDescription = `Curated dataset from agentic search: "${searchQuery}"`;
        const defaultTags = ['search-based', 'curated', 'agentic'];
        const newDataset: Dataset = {
          id: crypto.randomUUID(),
          version: generateDatasetVersion(existingVersions),
          name,
          size: totalSamples * 0.5, // Estimate: ~0.5MB per instance
          samples: totalSamples,
          format: 'Custom',
          description: customDescription || defaultDescription,
          tags: customTags && customTags.length > 0 ? customTags : defaultTags,
          createdAt: new Date().toISOString(),
          uploadedBy: 'system',
          isSearchBased: true,
          sourceVideo,
          sourceCsv,
          searchQuery,
          searchInstances: [...trainInstances, ...testInstances, ...inferenceInstances], // Keep for backward compatibility
          splits,
          tokenizationConfig,
          metadata: {
            classes: [],
            resolution: 'variable',
            augmented: false,
          },
        };
        set(state => ({ datasets: [...state.datasets, newDataset] }));
        return newDataset;
      },
    }),
    {
      name: 'roboml-datasets-storage',
      onRehydrateStorage: () => (state) => {
        // Initialize with sample datasets if empty
        if (state && state.datasets.length === 0) {
          state.datasets = initializeDatasets();
        }
        // Migrate existing datasets to ensure all have all 3 splits initialized
        if (state && state.datasets) {
          state.datasets = state.datasets.map(dataset => {
            // Ensure splits exist and have all 3 categories
            if (!dataset.splits) {
              // For search-based datasets, migrate searchInstances to train split
              // For regular datasets, initialize all splits as empty
              return {
                ...dataset,
                splits: {
                  train: dataset.isSearchBased && dataset.searchInstances ? dataset.searchInstances : [],
                  test: [],
                  inference: [],
                },
              };
            }
            // Ensure all 3 splits exist even if dataset has splits but missing one
            if (!dataset.splits.train || !dataset.splits.test || !dataset.splits.inference) {
              return {
                ...dataset,
                splits: {
                  train: dataset.splits.train || [],
                  test: dataset.splits.test || [],
                  inference: dataset.splits.inference || [],
                },
              };
            }
            return dataset;
          });
        }
      },
    }
  )
);

