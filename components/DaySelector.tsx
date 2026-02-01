import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { DAYS_OF_WEEK } from '@/utils/dateHelpers';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DaySelectorProps {
    selectedDays: number[];
    onToggleDay: (dayId: number) => void;
}

export function DaySelector({ selectedDays, onToggleDay }: DaySelectorProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.text }]}>
                Días de la semana
            </Text>
            <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day.id);
                    return (
                        <TouchableOpacity
                            key={day.id}
                            style={[
                                styles.dayButton,
                                {
                                    backgroundColor: isSelected ? colors.tint : colors.card,
                                    borderColor: isSelected ? colors.tint : colors.cardBorder,
                                },
                            ]}
                            onPress={() => onToggleDay(day.id)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    {
                                        color: isSelected ? '#FFFFFF' : colors.text,
                                    },
                                ]}
                            >
                                {day.short}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    dayText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
