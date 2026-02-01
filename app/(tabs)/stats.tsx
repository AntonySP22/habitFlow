import { ProgressChart } from '@/components/ProgressChart';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useHabitStore } from '@/store/habitStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function StatsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const {
        habits,
        categories,
        chartData,
        dailyProgress,
        selectedCategory,
        isLoading,
        loadChartData,
        loadCategories,
        setSelectedCategory,
        refreshAll,
    } = useHabitStore();

    useFocusEffect(
        useCallback(() => {
            loadChartData(14);
            loadCategories();
        }, [])
    );

    const totalHabits = habits.length;
    const averageProgress = chartData.length > 0
        ? Math.round(chartData.reduce((acc, d) => acc + d.progress, 0) / chartData.length)
        : 0;

    const bestDay = chartData.length > 0
        ? chartData.reduce((best, d) => d.progress > best.progress ? d : best, chartData[0])
        : null;

    const currentStreak = calculateStreak(chartData);

    function calculateStreak(data: { date: string; progress: number }[]): number {
        if (data.length === 0) return 0;

        let streak = 0;
        const reversedData = [...data].reverse();

        for (const day of reversedData) {
            if (day.progress >= 50) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={isLoading}
                    onRefresh={refreshAll}
                    tintColor={colors.tint}
                />
            }
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Estadísticas
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Analiza tu rendimiento
                </Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: colors.tintLight }]}>
                        <Ionicons name="flame" size={24} color={colors.tint} />
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {currentStreak}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Racha actual
                    </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: colors.successLight }]}>
                        <Ionicons name="trending-up" size={24} color={colors.success} />
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {averageProgress}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Promedio
                    </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: colors.warningLight }]}>
                        <Ionicons name="star" size={24} color={colors.warning} />
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {bestDay ? `${bestDay.progress}%` : '-'}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Mejor día
                    </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: colors.dangerLight }]}>
                        <Ionicons name="list" size={24} color={colors.danger} />
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {totalHabits}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Hábitos
                    </Text>
                </View>
            </View>

            <ProgressChart data={chartData} />

            <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
                <View style={styles.insightHeader}>
                    <Ionicons name="bulb" size={24} color={colors.warning} />
                    <Text style={[styles.insightTitle, { color: colors.text }]}>
                        Consejo del día
                    </Text>
                </View>
                <Text style={[styles.insightText, { color: colors.textSecondary }]}>
                    {getInsight(averageProgress, currentStreak)}
                </Text>
            </View>
        </ScrollView>
    );
}

function getInsight(average: number, streak: number): string {
    if (streak >= 7) {
        return '¡Increíble racha de ' + streak + ' días! Mantén el ritmo y sigue construyendo hábitos positivos.';
    }
    if (average >= 80) {
        return '¡Excelente rendimiento! Tu constancia está dando frutos. Considera agregar un nuevo hábito.';
    }
    if (average >= 50) {
        return 'Vas por buen camino. Intenta completar tus hábitos más temprano en el día para mejor consistencia.';
    }
    if (average > 0) {
        return 'Cada pequeño paso cuenta. Enfócate en 1-2 hábitos clave antes de agregar más.';
    }
    return 'Comienza tu viaje de hábitos. La consistencia es más importante que la perfección.';
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 100,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        gap: 8,
    },
    statCard: {
        width: '48%',
        padding: 16,
        borderRadius: 16,
        marginBottom: 4,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 13,
        marginTop: 4,
    },
    insightCard: {
        marginHorizontal: 16,
        marginTop: 16,
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    insightTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    insightText: {
        fontSize: 15,
        lineHeight: 22,
    },
});
