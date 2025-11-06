import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HistoryEvent } from '../types';

interface HistoryState {
  events: HistoryEvent[];
  addEvent: (event: Omit<HistoryEvent, 'id' | 'timestamp'>) => void;
  getEventsByModel: (modelVersion: string) => HistoryEvent[];
  clearHistory: () => void;
}

export const useHistory = create<HistoryState>()(
  persist(
    (set, get) => ({
      events: [],

      addEvent: (eventData) => {
        const newEvent: HistoryEvent = {
          ...eventData,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        };
        set(state => ({ events: [...state.events, newEvent] }));
      },

      getEventsByModel: (modelVersion) => {
        return get().events.filter(e => e.modelVersion === modelVersion);
      },

      clearHistory: () => {
        set({ events: [] });
      },
    }),
    {
      name: 'roboml-history-storage',
    }
  )
);

