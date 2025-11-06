import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Robot } from '../types';

interface RobotsState {
  robots: Robot[];
  initializeRobots: () => void;
  updateRobotModel: (robotId: string, modelVersion: string) => void;
  getRobotsByModel: (modelVersion: string) => Robot[];
}

// Generate mock robot fleet
const generateMockRobots = (): Robot[] => {
  return [
    {
      id: 'R-001',
      name: 'Scout Alpha',
      currentModelVersion: 'M-001',
      status: 'online',
      lastSync: new Date().toISOString(),
    },
    {
      id: 'R-002',
      name: 'Scout Beta',
      currentModelVersion: 'M-001',
      status: 'online',
      lastSync: new Date().toISOString(),
    },
    {
      id: 'R-003',
      name: 'Cargo Unit 1',
      currentModelVersion: 'M-001',
      status: 'offline',
      lastSync: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'R-004',
      name: 'Cargo Unit 2',
      currentModelVersion: 'M-001',
      status: 'online',
      lastSync: new Date().toISOString(),
    },
    {
      id: 'R-005',
      name: 'Navigation Bot A',
      currentModelVersion: 'M-001',
      status: 'online',
      lastSync: new Date().toISOString(),
    },
    {
      id: 'R-006',
      name: 'Navigation Bot B',
      currentModelVersion: 'M-001',
      status: 'offline',
      lastSync: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
};

export const useRobots = create<RobotsState>()(
  persist(
    (set, get) => ({
      robots: [],

      initializeRobots: () => {
        if (get().robots.length === 0) {
          set({ robots: generateMockRobots() });
        }
      },

      updateRobotModel: (robotId, modelVersion) => {
        set(state => ({
          robots: state.robots.map(r =>
            r.id === robotId
              ? { ...r, currentModelVersion: modelVersion, lastSync: new Date().toISOString() }
              : r
          ),
        }));
      },

      getRobotsByModel: (modelVersion) => {
        return get().robots.filter(r => r.currentModelVersion === modelVersion);
      },
    }),
    {
      name: 'roboml-robots-storage',
    }
  )
);

