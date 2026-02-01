import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getDatabase } from '@/database/init';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme as useSystemColorScheme,
    View
} from 'react-native';

export default function SettingsScreen() {
    const systemColorScheme = useSystemColorScheme();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { mode, setTheme } = useThemeStore();

    const handleClearHistory = () => {
        Alert.alert(
            'Limpiar historial',
            '¿Estás seguro de que deseas eliminar todos los registros de hábitos? Los hábitos se mantendrán pero perderás todo el historial.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const db = await getDatabase();
                            await db.runAsync('DELETE FROM habit_logs');
                            Alert.alert('Éxito', 'El historial ha sido eliminado');
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el historial');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAllData = () => {
        Alert.alert(
            '¿Eliminar todos los datos?',
            'Esta acción es irreversible. Se eliminarán todos los hábitos y registros.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar todo',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const db = await getDatabase();
                            await db.runAsync('DELETE FROM habit_logs');
                            await db.runAsync('DELETE FROM habits');
                            Alert.alert('Éxito', 'Todos los datos han sido eliminados');
                        } catch (error) {
                            Alert.alert('Error', 'No se pudieron eliminar los datos');
                        }
                    },
                },
            ]
        );
    };

    const SettingItem = ({
        icon,
        iconColor,
        title,
        subtitle,
        onPress,
        rightComponent,
        danger = false,
    }: {
        icon: string;
        iconColor?: string;
        title: string;
        subtitle?: string;
        onPress?: () => void;
        rightComponent?: React.ReactNode;
        danger?: boolean;
    }) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.cardBorder }]}
            onPress={onPress}
            disabled={!onPress && !rightComponent}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: (iconColor || colors.tint) + '20' },
                ]}
            >
                <Ionicons
                    name={icon as any}
                    size={22}
                    color={danger ? colors.danger : (iconColor || colors.tint)}
                />
            </View>
            <View style={styles.settingContent}>
                <Text
                    style={[
                        styles.settingTitle,
                        { color: danger ? colors.danger : colors.text },
                    ]}
                >
                    {title}
                </Text>
                {subtitle && (
                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {rightComponent}
            {onPress && !rightComponent && (
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Ajustes</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Personaliza tu experiencia
                </Text>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    APARIENCIA
                </Text>

                <SettingItem
                    icon="sunny"
                    iconColor="#F59E0B"
                    title="Modo claro"
                    subtitle={mode === 'light' ? 'Activo' : undefined}
                    onPress={() => setTheme('light')}
                    rightComponent={
                        <View style={[
                            styles.radioButton,
                            mode === 'light' && { backgroundColor: colors.tint, borderColor: colors.tint },
                            { borderColor: colors.cardBorder }
                        ]}>
                            {mode === 'light' && <Ionicons name="checkmark" size={14} color="#FFF" />}
                        </View>
                    }
                />

                <SettingItem
                    icon="moon"
                    iconColor="#6366F1"
                    title="Modo oscuro"
                    subtitle={mode === 'dark' ? 'Activo' : undefined}
                    onPress={() => setTheme('dark')}
                    rightComponent={
                        <View style={[
                            styles.radioButton,
                            mode === 'dark' && { backgroundColor: colors.tint, borderColor: colors.tint },
                            { borderColor: colors.cardBorder }
                        ]}>
                            {mode === 'dark' && <Ionicons name="checkmark" size={14} color="#FFF" />}
                        </View>
                    }
                />

                <SettingItem
                    icon="phone-portrait"
                    iconColor="#10B981"
                    title="Seguir al sistema"
                    subtitle={mode === 'system' ? `Activo (${systemColorScheme})` : undefined}
                    onPress={() => setTheme('system')}
                    rightComponent={
                        <View style={[
                            styles.radioButton,
                            mode === 'system' && { backgroundColor: colors.tint, borderColor: colors.tint },
                            { borderColor: colors.cardBorder }
                        ]}>
                            {mode === 'system' && <Ionicons name="checkmark" size={14} color="#FFF" />}
                        </View>
                    }
                />
            </View>

            <View style={[styles.section, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    DATOS
                </Text>

                <SettingItem
                    icon="trash-outline"
                    iconColor="#F59E0B"
                    title="Limpiar historial"
                    subtitle="Mantiene los hábitos, elimina registros"
                    onPress={handleClearHistory}
                />

                <SettingItem
                    icon="warning-outline"
                    title="Eliminar todos los datos"
                    subtitle="Acción irreversible"
                    onPress={handleDeleteAllData}
                    danger
                />
            </View>

            <View style={[styles.section, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    ACERCA DE
                </Text>

                <SettingItem
                    icon="information-circle"
                    iconColor="#3B82F6"
                    title="HabitFlow"
                    subtitle="Versión 1.0.0"
                />

                <SettingItem
                    icon="heart"
                    iconColor="#EC4899"
                    title="Hecho con ❤️"
                    subtitle="Construye mejores hábitos, un día a la vez"
                />
            </View>
        </ScrollView>
    );
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
    section: {
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 0.5,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
