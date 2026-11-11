import { useColorScheme } from 'react-native';
import { colors } from '@/constants/theme';

export function useThemeColors() {
  return colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
