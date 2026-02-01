import { useThemeStore } from '@/store/themeStore';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
    const systemColorScheme = useSystemColorScheme();
    const { mode } = useThemeStore();

    if (mode === 'system') {
        return systemColorScheme ?? 'light';
    }

    return mode;
}
