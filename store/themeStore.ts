import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    mode: ThemeMode;
    isInitialized: boolean;

    initializeTheme: () => Promise<void>;
    setTheme: (mode: ThemeMode) => Promise<void>;
}

const THEME_STORAGE_KEY = '@habitflow_theme';

export const useThemeStore = create<ThemeState>((set) => ({
    mode: 'system',
    isInitialized: false,

    initializeTheme: async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
                set({ mode: savedTheme, isInitialized: true });
            } else {
                set({ isInitialized: true });
            }
        } catch (error) {
            console.error('Error loading theme:', error);
            set({ isInitialized: true });
        }
    },

    setTheme: async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            set({ mode });
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    },
}));
