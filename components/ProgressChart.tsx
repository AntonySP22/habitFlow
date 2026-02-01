import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { formatDateForDisplay } from '@/utils/dateHelpers';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface ProgressChartProps {
    data: { date: string; progress: number }[];
}

export function ProgressChart({ data }: ProgressChartProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const screenWidth = Dimensions.get('window').width - 32;

    if (data.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No hay datos suficientes para mostrar la gráfica
                </Text>
            </View>
        );
    }

    const chartData = {
        labels: data.slice(-7).map((d) => formatDateForDisplay(d.date)),
        datasets: [
            {
                data: data.slice(-7).map((d) => d.progress),
                color: (opacity = 1) => colors.tint,
                strokeWidth: 3,
            },
        ],
    };

    const chartConfig = {
        backgroundColor: colors.card,
        backgroundGradientFrom: colors.card,
        backgroundGradientTo: colors.card,
        decimalPlaces: 0,
        color: (opacity = 1) => colors.tint,
        labelColor: (opacity = 1) => colors.textSecondary,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: colors.tint,
            fill: colors.card,
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: colors.cardBorder,
            strokeWidth: 1,
        },
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Tu progreso
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Últimos 7 días
                </Text>
            </View>

            <LineChart
                data={chartData}
                width={screenWidth}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                fromZero={true}
                yAxisSuffix="%"
                segments={4}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 13,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
        marginLeft: -16,
    },
    emptyContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
