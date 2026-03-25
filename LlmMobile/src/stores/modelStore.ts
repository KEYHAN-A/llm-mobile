import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../utils/storage';
import type { ModelStatus, MemoryInfo } from '../types/model';
import type { LlamaContext } from 'llama.rn';
import type { ModelFileInfo } from '../services/downloadService';

interface ModelState {
  status: ModelStatus;
  context: LlamaContext | null;
  loadProgress: number;
  error: string | null;
  memoryInfo: MemoryInfo | null;
  availableModels: ModelFileInfo[];
  selectedModelFilename: string | null;
  loadedModelFilename: string | null;

  setStatus: (status: ModelStatus) => void;
  setContext: (ctx: LlamaContext | null) => void;
  setLoadProgress: (p: number) => void;
  setError: (error: string | null) => void;
  setMemoryInfo: (info: MemoryInfo | null) => void;
  setAvailableModels: (models: ModelFileInfo[]) => void;
  setSelectedModel: (filename: string | null) => void;
  setLoadedModel: (filename: string | null) => void;
  reset: () => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      status: 'unloaded',
      context: null,
      loadProgress: 0,
      error: null,
      memoryInfo: null,
      availableModels: [],
      selectedModelFilename: null,
      loadedModelFilename: null,

      setStatus: (status) => set({ status, error: status === 'error' ? undefined : null }),
      setContext: (context) => set({ context }),
      setLoadProgress: (loadProgress) => set({ loadProgress }),
      setError: (error) => set({ error }),
      setMemoryInfo: (memoryInfo) => set({ memoryInfo }),
      setAvailableModels: (availableModels) => set({ availableModels }),
      setSelectedModel: (selectedModelFilename) => set({ selectedModelFilename }),
      setLoadedModel: (loadedModelFilename) => set({ loadedModelFilename }),
      reset: () =>
        set({
          status: 'unloaded',
          context: null,
          loadProgress: 0,
          error: null,
          memoryInfo: null,
          loadedModelFilename: null,
        }),
    }),
    {
      name: 'model-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        selectedModelFilename: state.selectedModelFilename,
      }),
    },
  ),
);
