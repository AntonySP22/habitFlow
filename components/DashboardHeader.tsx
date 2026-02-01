import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { formatFullDate } from '@/utils/dateHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface DashboardHeaderProps {
    completed: number;
    total: number;
}

export function DashboardHeader({ completed, total }: DashboardHeaderProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const progressAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '¡Buenos días!';
        if (hour < 18) return '¡Buenas tardes!';
        return '¡Buenas noches!';
    };

    const getMotivation = () => {
        if (total === 0) return 'Crea tu primer hábito 🌱';
        if (progress === 100) return '¡Día perfecto! 🎉';
        if (progress >= 75) return '¡Casi lo logras! 💪';
        if (progress >= 50) return '¡Vas por buen camino! 🚀';
        if (progress > 0) return '¡Sigue adelante! ✨';
        return '¡Comienza tu día! ☀️';
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.tint }]}>
            <View style={styles.topSection}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.date}>{formatFullDate()}</Text>
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons name="sunny" size={28} color="#FFFFFF" />
                </View>
            </View>

            <View style={[styles.progressCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Progreso de hoy</Text>
                    <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                </View>

                <View style={styles.progressBarContainer}>
                    <Animated.View
                        style={[
                            styles.progressBar,
                            { width: progressWidth },
                        ]}
                    />
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{completed}</Text>
                        <Text style={styles.statLabel}>Completados</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{total - completed}</Text>
                        <Text style={styles.statLabel}>Pendientes</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                </View>

                <Text style={styles.motivation}>{getMotivation()}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    date: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'capitalize',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressCard: {
        borderRadius: 20,
        padding: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    progressPercent: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 12,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 32,
    },
    motivation: {
        textAlign: 'center',
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '500',
    },
});
