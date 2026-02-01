import { useColorScheme } from '@/components/useColorScheme';
import Colors, { CategoryColors } from '@/constants/Colors';
import { Category } from '@/database/queries';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CategoryFilterProps {
    categories: Category[];
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({
    categories,
    selectedCategory,
    onSelectCategory,
}: CategoryFilterProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            <TouchableOpacity
                style={[
                    styles.chip,
                    {
                        backgroundColor: selectedCategory === null ? colors.tint : colors.card,
                        borderColor: selectedCategory === null ? colors.tint : colors.cardBorder,
                    },
                ]}
                onPress={() => onSelectCategory(null)}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="apps"
                    size={16}
                    color={selectedCategory === null ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                    style={[
                        styles.chipText,
                        {
                            color: selectedCategory === null ? '#FFFFFF' : colors.text,
                        },
                    ]}
                >
                    Todos
                </Text>
            </TouchableOpacity>

            {categories.map((category) => {
                const isSelected = selectedCategory === category.name;
                const categoryColor = CategoryColors[category.name] || category.color;

                return (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: isSelected ? categoryColor : colors.card,
                                borderColor: isSelected ? categoryColor : colors.cardBorder,
                            },
                        ]}
                        onPress={() => onSelectCategory(category.name)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={category.icon as any}
                            size={16}
                            color={isSelected ? '#FFFFFF' : categoryColor}
                        />
                        <Text
                            style={[
                                styles.chipText,
                                {
                                    color: isSelected ? '#FFFFFF' : colors.text,
                                },
                            ]}
                        >
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        gap: 6,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
