import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { HabitWithStatus } from '@/database/queries';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface HabitCardProps {
    habit: HabitWithStatus;
    onToggle: (habitId: number, currentStatus: number) => void;
    onPress: () => void;
}

export function HabitCard({ habit, onToggle, onPress }: HabitCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handleToggle = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        onToggle(habit.id, habit.status);
    };

    const isCompleted = habit.status === 1;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: colors.card,
                    borderColor: isCompleted ? habit.color : colors.cardBorder,
                    borderWidth: isCompleted ? 2 : 1,
                    transform: [{ scale: scaleAnim }],
                    shadowColor: colors.shadow,
                },
            ]}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: habit.color + '20' },
                    ]}
                >
                    <Ionicons
                        name={habit.icon as any}
                        size={24}
                        color={habit.color}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text
                        style={[
                            styles.name,
                            {
                                color: colors.text,
                                textDecorationLine: isCompleted ? 'line-through' : 'none',
                                opacity: isCompleted ? 0.6 : 1,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {habit.name}
                    </Text>
                    <Text style={[styles.category, { color: colors.textSecondary }]}>
                        {habit.category}
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.checkButton,
                    {
                        backgroundColor: isCompleted ? habit.color : 'transparent',
                        borderColor: isCompleted ? habit.color : colors.cardBorder,
                    },
                ]}
                onPress={handleToggle}
                activeOpacity={0.7}
            >
                {isCompleted && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    category: {
        fontSize: 13,
    },
    checkButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
