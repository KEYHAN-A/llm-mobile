import ReactNativeBlobUtil from 'react-native-blob-util';
import {
  MODELS_DIR_NAME,
  GGUF_EXTENSION,
  MIN_MODEL_SIZE,
} from '../utils/constants';
import { useModelStore } from '../stores/modelStore';

const { fs } = ReactNativeBlobUtil;

export interface ModelFileInfo {
  filename: string;
  path: string;
  sizeBytes: number;
  sizeLabel: string;
}

export function getModelDir(): string {
  // Use external app storage — no permissions needed, adb push works directly
  // Path: /sdcard/Android/data/com.llmmobile/files/models/
  const externalDir = fs.dirs.SDCardDir;
  if (externalDir) {
    return `${externalDir}/${MODELS_DIR_NAME}`;
  }
  // Fallback to internal storage
  return `${fs.dirs.DocumentDir}/${MODELS_DIR_NAME}`;
}

export function getModelPath(filename: string): string {
  return `${getModelDir()}/${filename}`;
}

async function ensureModelDir(): Promise<void> {
  const dir = getModelDir();
  const exists = await fs.isDir(dir);
  if (!exists) {
    await fs.mkdir(dir);
  }
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

export async function listAvailableModels(): Promise<ModelFileInfo[]> {
  await ensureModelDir();
  const dir = getModelDir();

  // Also scan internal storage models dir as fallback
  const internalDir = `${fs.dirs.DocumentDir}/${MODELS_DIR_NAME}`;
  const dirs = [dir];
  if (internalDir !== dir) {
    const internalExists = await fs.isDir(internalDir);
    if (internalExists) dirs.push(internalDir);
  }

  const models: ModelFileInfo[] = [];
  const seenFilenames = new Set<string>();

  for (const scanDir of dirs) {
    try {
      const files = await fs.ls(scanDir);
      for (const file of files) {
        if (!file.toLowerCase().endsWith(GGUF_EXTENSION)) continue;
        if (seenFilenames.has(file)) continue;

        const filePath = `${scanDir}/${file}`;
        try {
          const stat = await fs.stat(filePath);
          const size = parseInt(String(stat.size), 10);
          if (size < MIN_MODEL_SIZE) continue;

          seenFilenames.add(file);
          models.push({
            filename: file,
            path: filePath,
            sizeBytes: size,
            sizeLabel: formatSize(size),
          });
        } catch {
          // skip files we can't stat
        }
      }
    } catch {
      // directory might not exist yet
    }
  }

  // Sort by filename
  models.sort((a, b) => a.filename.localeCompare(b.filename));
  return models;
}

export async function checkModelExists(filename?: string): Promise<boolean> {
  if (!filename) return false;
  const path = getModelPath(filename);
  try {
    const exists = await fs.exists(path);
    if (!exists) {
      // Also check internal storage
      const internalPath = `${fs.dirs.DocumentDir}/${MODELS_DIR_NAME}/${filename}`;
      return await fs.exists(internalPath);
    }
    return true;
  } catch {
    return false;
  }
}

export async function resolveModelPath(filename: string): Promise<string | null> {
  // Check external first, then internal
  const externalPath = getModelPath(filename);
  if (await fs.exists(externalPath)) return externalPath;

  const internalPath = `${fs.dirs.DocumentDir}/${MODELS_DIR_NAME}/${filename}`;
  if (await fs.exists(internalPath)) return internalPath;

  return null;
}

export async function deleteModelFile(filename: string): Promise<void> {
  const path = getModelPath(filename);
  if (await fs.exists(path)) await fs.unlink(path);

  // Also check internal
  const internalPath = `${fs.dirs.DocumentDir}/${MODELS_DIR_NAME}/${filename}`;
  if (await fs.exists(internalPath)) await fs.unlink(internalPath);
}
