import {
    Category,
    createHabit,
    deleteHabit,
    getAllCategories,
    getDailyProgress,
    getHabitsWithStatusForDate,
    getProgressForDateRange,
    HabitWithStatus,
    toggleHabitLog,
    updateHabit,
} from '@/database/queries';
import { getCurrentDayOfWeek, getDateRangeForLastNDays, getTodayISO } from '@/utils/dateHelpers';
import { create } from 'zustand';

interface HabitState {
    habits: HabitWithStatus[];
    categories: Category[];
    dailyProgress: { completed: number; total: number };
    chartData: { date: string; progress: number }[];
    selectedCategory: string | null;
    isLoading: boolean;

    loadHabitsForToday: () => Promise<void>;
    loadCategories: () => Promise<void>;
    loadChartData: (days?: number) => Promise<void>;
    toggleHabit: (habitId: number, currentStatus: number) => Promise<void>;
    addHabit: (name: string, category: string, frequency: number[], color?: string, icon?: string) => Promise<number>;
    editHabit: (id: number, name: string, category: string, frequency: number[], color: string, icon: string) => Promise<void>;
    removeHabit: (id: number) => Promise<void>;
    setSelectedCategory: (category: string | null) => void;
    refreshAll: () => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
    habits: [],
    categories: [],
    dailyProgress: { completed: 0, total: 0 },
    chartData: [],
    selectedCategory: null,
    isLoading: false,

    loadHabitsForToday: async () => {
        set({ isLoading: true });
        try {
            const today = getTodayISO();
            const dayOfWeek = getCurrentDayOfWeek();
            const habits = await getHabitsWithStatusForDate(today, dayOfWeek);
            const dailyProgress = await getDailyProgress(today, dayOfWeek);
            set({ habits, dailyProgress, isLoading: false });
        } catch (error) {
            console.error('Error loading habits:', error);
            set({ isLoading: false });
        }
    },

    loadCategories: async () => {
        try {
            const categories = await getAllCategories();
            set({ categories });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },

    loadChartData: async (days = 14) => {
        try {
            const { startDate, endDate } = getDateRangeForLastNDays(days);
            const chartData = await getProgressForDateRange(startDate, endDate);
            set({ chartData });
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    },

    toggleHabit: async (habitId: number, currentStatus: number) => {
        const today = getTodayISO();
        const newStatus = currentStatus === 1 ? 0 : 1;

        set((state) => ({
            habits: state.habits.map((h) =>
                h.id === habitId ? { ...h, status: newStatus } : h
            ),
            dailyProgress: {
                ...state.dailyProgress,
                completed: state.dailyProgress.completed + (newStatus === 1 ? 1 : -1),
            },
        }));

        try {
            await toggleHabitLog(habitId, today, currentStatus);
            get().loadChartData();
        } catch (error) {
            console.error('Error toggling habit:', error);
            get().loadHabitsForToday();
        }
    },

    addHabit: async (name, category, frequency, color, icon) => {
        try {
            const id = await createHabit(name, category, frequency, color, icon);
            await get().refreshAll();
            return id;
        } catch (error) {
            console.error('Error adding habit:', error);
            throw error;
        }
    },

    editHabit: async (id, name, category, frequency, color, icon) => {
        try {
            await updateHabit(id, name, category, frequency, color, icon);
            await get().refreshAll();
        } catch (error) {
            console.error('Error editing habit:', error);
            throw error;
        }
    },

    removeHabit: async (id) => {
        try {
            await deleteHabit(id);
            await get().refreshAll();
        } catch (error) {
            console.error('Error removing habit:', error);
            throw error;
        }
    },

    setSelectedCategory: (category) => {
        set({ selectedCategory: category });
    },

    refreshAll: async () => {
        await Promise.all([
            get().loadHabitsForToday(),
            get().loadCategories(),
            get().loadChartData(),
        ]);
    },
}));
