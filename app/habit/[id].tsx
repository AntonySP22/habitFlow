import { DaySelector } from '@/components/DaySelector';
import { useColorScheme } from '@/components/useColorScheme';
import { HABIT_ICONS } from '@/constants/categories';
import Colors, { HabitColors } from '@/constants/Colors';
import { getHabitById } from '@/database/queries';
import { useHabitStore } from '@/store/habitStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EditHabitScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { categories, editHabit, removeHabit, refreshAll } = useHabitStore();

    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Personal');
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [selectedColor, setSelectedColor] = useState(HabitColors[0]);
    const [selectedIcon, setSelectedIcon] = useState('checkmark-circle');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadHabit();
    }, [id]);

    const loadHabit = async () => {
        if (!id) return;

        try {
            const habit = await getHabitById(parseInt(id));
            if (habit) {
                setName(habit.name);
                setSelectedCategory(habit.category);
                setSelectedDays(habit.frequency);
                setSelectedColor(habit.color);
                setSelectedIcon(habit.icon);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar el hábito');
            router.back();
        }
    };

    const handleToggleDay = (dayId: number) => {
        setSelectedDays((prev) =>
            prev.includes(dayId)
                ? prev.filter((d) => d !== dayId)
                : [...prev, dayId].sort()
        );
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre para el hábito');
            return;
        }

        if (selectedDays.length === 0) {
            Alert.alert('Error', 'Por favor selecciona al menos un día');
            return;
        }

        setIsLoading(true);
        try {
            await editHabit(
                parseInt(id!),
                name.trim(),
                selectedCategory,
                selectedDays,
                selectedColor,
                selectedIcon
            );
            router.back();
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el hábito');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar hábito',
            '¿Estás seguro de que deseas eliminar este hábito? Esta acción es irreversible.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await removeHabit(parseInt(id!));
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el hábito');
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.card }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Editar hábito
                    </Text>
                    <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: colors.dangerLight }]}
                        onPress={handleDelete}
                        disabled={isDeleting}
                    >
                        <Ionicons name="trash-outline" size={22} color={colors.danger} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.previewCard, { backgroundColor: selectedColor }]}>
                    <View style={styles.previewIconContainer}>
                        <Ionicons name={selectedIcon as any} size={40} color="#FFFFFF" />
                    </View>
                    <Text style={styles.previewName} numberOfLines={1}>
                        {name || 'Mi hábito'}
                    </Text>
                    <Text style={styles.previewCategory}>{selectedCategory}</Text>
                </View>

                <View style={[styles.formSection, { backgroundColor: colors.card }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Nombre</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.background,
                                color: colors.text,
                                borderColor: colors.cardBorder,
                            },
                        ]}
                        placeholder="Ej: Meditar 10 minutos"
                        placeholderTextColor={colors.textMuted}
                        value={name}
                        onChangeText={setName}
                        maxLength={50}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Categoría</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                    >
                        {categories.map((category) => {
                            const isSelected = selectedCategory === category.name;
                            return (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryChip,
                                        {
                                            backgroundColor: isSelected ? category.color : colors.background,
                                            borderColor: isSelected ? category.color : colors.cardBorder,
                                        },
                                    ]}
                                    onPress={() => setSelectedCategory(category.name)}
                                >
                                    <Ionicons
                                        name={category.icon as any}
                                        size={16}
                                        color={isSelected ? '#FFFFFF' : category.color}
                                    />
                                    <Text
                                        style={[
                                            styles.categoryChipText,
                                            { color: isSelected ? '#FFFFFF' : colors.text },
                                        ]}
                                    >
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <DaySelector
                        selectedDays={selectedDays}
                        onToggleDay={handleToggleDay}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Color</Text>
                    <View style={styles.colorsContainer}>
                        {HabitColors.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorButton,
                                    { backgroundColor: color },
                                    selectedColor === color && styles.colorButtonSelected,
                                ]}
                                onPress={() => setSelectedColor(color)}
                            >
                                {selectedColor === color && (
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: colors.text }]}>Icono</Text>
                    <View style={styles.iconsContainer}>
                        {HABIT_ICONS.map((icon) => (
                            <TouchableOpacity
                                key={icon}
                                style={[
                                    styles.iconButton,
                                    {
                                        backgroundColor:
                                            selectedIcon === icon ? selectedColor : colors.background,
                                        borderColor:
                                            selectedIcon === icon ? selectedColor : colors.cardBorder,
                                    },
                                ]}
                                onPress={() => setSelectedIcon(icon)}
                            >
                                <Ionicons
                                    name={icon as any}
                                    size={24}
                                    color={selectedIcon === icon ? '#FFFFFF' : colors.textSecondary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        { backgroundColor: colors.tint },
                        isLoading && { opacity: 0.7 },
                    ]}
                    onPress={handleSave}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>
                        {isLoading ? 'Guardando...' : 'Guardar cambios'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    previewCard: {
        marginHorizontal: 16,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    previewIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    previewName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    previewCategory: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    formSection: {
        marginHorizontal: 16,
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    input: {
        height: 52,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    categoryScroll: {
        marginBottom: 20,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 10,
        gap: 6,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
    },
    colorsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 12,
    },
    colorButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorButtonSelected: {
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    iconsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    iconButton: {
        width: 52,
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        height: 56,
        borderRadius: 16,
        gap: 8,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
