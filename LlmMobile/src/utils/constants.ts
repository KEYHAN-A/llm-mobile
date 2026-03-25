import { Platform } from 'react-native';

// Model configuration
export const MODELS_DIR_NAME = 'models';
export const GGUF_EXTENSION = '.gguf';
export const MIN_MODEL_SIZE = 100 * 1024 * 1024; // 100MB minimum to be valid

// Memory thresholds
export const MODEL_RAM_ESTIMATE = 4.5 * 1024 * 1024 * 1024; // 4.5GB
export const MIN_FREE_RAM = 1.0 * 1024 * 1024 * 1024; // 1GB headroom for OS
export const MIN_TOTAL_RAM = 6 * 1024 * 1024 * 1024; // 6GB minimum device
export const MEMORY_WARNING_THRESHOLD = 0.8; // 80% usage
export const MEMORY_CRITICAL_THRESHOLD = 0.9; // 90% usage
export const MEMORY_CHECK_INTERVAL = 3000; // 3s during inference

// Inference defaults
export const DEFAULT_N_CTX = 4096;
export const DEFAULT_N_BATCH = 512;
export const DEFAULT_N_THREADS = Platform.OS === 'ios' ? 6 : 4;
export const DEFAULT_N_GPU_LAYERS = 99;
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_TOP_P = 0.9;
export const DEFAULT_TOP_K = 40;
export const DEFAULT_MAX_TOKENS = 2048;
export const DEFAULT_MAX_CONTEXT_MESSAGES = 20;

// System prompt
export const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful, harmless, and honest AI assistant. You provide clear, concise, and accurate answers. You can help with general knowledge, brainstorming, writing, analysis, and everyday questions.';


// Mistral instruct stop tokens (default, works for most instruct models)
export const DEFAULT_STOP_TOKENS = ['</s>', '[INST]', '[/INST]', '<|eot_id|>', '<|end|>'];
