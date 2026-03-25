import { useColorScheme } from 'react-native';
import { colors, type ColorScheme } from './colors';
import { useSettingsStore } from '../stores/settingsStore';

export function useAppTheme(): { colors: ColorScheme; isDark: boolean } {
  const systemScheme = useColorScheme();
  const themePref = useSettingsStore((s) => s.theme);

  const isDark =
    themePref === 'system' ? systemScheme === 'dark' : themePref === 'dark';

  return {
    colors: isDark ? colors.dark : colors.light,
    isDark,
  };
}
