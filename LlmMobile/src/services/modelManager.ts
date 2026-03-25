import { initLlama, type LlamaContext } from 'llama.rn';
import { useModelStore } from '../stores/modelStore';
import * as memoryService from './memoryService';
import { listAvailableModels, resolveModelPath } from './downloadService';
import {
  MODEL_RAM_ESTIMATE,
  DEFAULT_N_CTX,
  DEFAULT_N_BATCH,
  DEFAULT_N_THREADS,
  DEFAULT_N_GPU_LAYERS,
} from '../utils/constants';

async function findModelPath(filename: string): Promise<string | null> {
  // First try the available models list (most reliable — uses actual scanned paths)
  const available = useModelStore.getState().availableModels;
  const found = available.find((m) => m.filename === filename);
  if (found) return found.path;

  // Rescan in case models list is stale
  const freshModels = await listAvailableModels();
  useModelStore.getState().setAvailableModels(freshModels);
  const freshFound = freshModels.find((m) => m.filename === filename);
  if (freshFound) return freshFound.path;

  // Last resort: path resolution
  return resolveModelPath(filename);
}

export async function loadModel(filename?: string): Promise<LlamaContext> {
  const store = useModelStore.getState();
  const modelFilename = filename ?? store.selectedModelFilename;

  if (!modelFilename) {
    store.setStatus('error');
    store.setError('No model selected. Please select a model first.');
    throw new Error('No model selected');
  }

  const modelPath = await findModelPath(modelFilename);
  if (!modelPath) {
    store.setStatus('error');
    store.setError(`Model "${modelFilename}" not found. Push .gguf files to the models folder.`);
    throw new Error('Model file not found');
  }

  // Pre-flight: check memory (warn only, don't block)
  const memCheck = await memoryService.canLoadModel();
  store.setMemoryInfo({
    totalRAM: memCheck.totalRAM,
    usedRAM: memCheck.usedRAM,
    availableRAM: memCheck.availableRAM,
    modelEstimate: MODEL_RAM_ESTIMATE,
  });

  if (!memCheck.canLoad) {
    console.warn(`[ModelManager] Memory warning: ${memCheck.reason}`);
  }

  // Begin loading
  store.setStatus('loading');
  store.setLoadProgress(0);
  store.setError(null);

  try {
    console.log(`[ModelManager] Loading model from: ${modelPath}`);
    const context = await initLlama(
      {
        model: modelPath,
        n_ctx: DEFAULT_N_CTX,
        n_batch: DEFAULT_N_BATCH,
        n_threads: DEFAULT_N_THREADS,
        n_gpu_layers: DEFAULT_N_GPU_LAYERS,
        use_mlock: true,
        use_mmap: true,
        cache_type_k: 'q8_0',
        cache_type_v: 'q8_0',
      },
      (progress: number) => {
        store.setLoadProgress(progress * 100);
      },
    );

    store.setContext(context);
    store.setStatus('ready');
    store.setLoadProgress(100);
    store.setSelectedModel(modelFilename);
    store.setLoadedModel(modelFilename);

    return context;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load model';

    let userMessage = message;
    if (message.toLowerCase().includes('memory') || message.toLowerCase().includes('alloc')) {
      userMessage =
        'Not enough memory to load the model. Close other apps and try again.';
    } else if (message.toLowerCase().includes('gguf') || message.toLowerCase().includes('parse')) {
      userMessage =
        'Model file appears corrupted. Try re-pushing the model.';
    }

    store.setStatus('error');
    store.setError(userMessage);
    throw new Error(userMessage);
  }
}

export async function unloadModel(): Promise<void> {
  const store = useModelStore.getState();
  const context = store.context;

  if (context) {
    try {
      await context.release();
    } catch {
      // Ignore release errors
    }
  }

  store.setContext(null);
  store.setStatus('unloaded');
  store.setLoadProgress(0);
  store.setError(null);
  store.setLoadedModel(null);
}
