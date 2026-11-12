import { useColorScheme } from 'react-native';
import { colors } from '@/constants/theme';

export function useThemeColors() {
  const isDarkMode = useColorScheme() === 'dark';
  return isDarkMode ? colors.dark : colors.light;
}
