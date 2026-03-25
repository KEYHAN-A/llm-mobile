import DeviceInfo from 'react-native-device-info';
import {
  MODEL_RAM_ESTIMATE,
  MIN_FREE_RAM,
  MIN_TOTAL_RAM,
} from '../utils/constants';
import type { MemoryCheckResult } from '../types/model';

function formatGB(bytes: number): string {
  return (bytes / (1024 * 1024 * 1024)).toFixed(1);
}

export async function canLoadModel(): Promise<MemoryCheckResult> {
  const totalRAM = await DeviceInfo.getTotalMemory();
  const usedRAM = await DeviceInfo.getUsedMemory();
  const availableRAM = totalRAM - usedRAM;
  const isLowRam = await DeviceInfo.isLowRamDevice();

  if (isLowRam) {
    return {
      canLoad: false,
      totalRAM,
      usedRAM,
      availableRAM,
      reason: 'This device has insufficient RAM for the 7B model.',
    };
  }

  if (totalRAM < MIN_TOTAL_RAM) {
    return {
      canLoad: false,
      totalRAM,
      usedRAM,
      availableRAM,
      reason: `Device has ${formatGB(totalRAM)}GB total RAM. Minimum 8GB required.`,
    };
  }

  if (availableRAM < MODEL_RAM_ESTIMATE + MIN_FREE_RAM) {
    return {
      canLoad: false,
      totalRAM,
      usedRAM,
      availableRAM,
      reason: `Only ${formatGB(availableRAM)}GB available. Need ${formatGB(
        MODEL_RAM_ESTIMATE + MIN_FREE_RAM,
      )}GB. Close other apps and try again.`,
    };
  }

  return { canLoad: true, totalRAM, usedRAM, availableRAM };
}

export async function getMemoryUsageRatio(): Promise<number> {
  const totalRAM = await DeviceInfo.getTotalMemory();
  const usedRAM = await DeviceInfo.getUsedMemory();
  return usedRAM / totalRAM;
}

export async function getMemorySnapshot() {
  const totalRAM = await DeviceInfo.getTotalMemory();
  const usedRAM = await DeviceInfo.getUsedMemory();
  return {
    totalRAM,
    usedRAM,
    availableRAM: totalRAM - usedRAM,
    usageRatio: usedRAM / totalRAM,
  };
}
