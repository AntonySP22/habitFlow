import { CategoryFilter } from '@/components/CategoryFilter';
import { DashboardHeader } from '@/components/DashboardHeader';
import { HabitCard } from '@/components/HabitCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useHabitStore } from '@/store/habitStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const {
    habits,
    categories,
    dailyProgress,
    selectedCategory,
    isLoading,
    loadHabitsForToday,
    loadCategories,
    loadChartData,
    toggleHabit,
    setSelectedCategory,
    refreshAll,
  } = useHabitStore();

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [])
  );

  const filteredHabits = selectedCategory
    ? habits.filter((h) => h.category === selectedCategory)
    : habits;

  const handleToggleHabit = (habitId: number, currentStatus: number) => {
    toggleHabit(habitId, currentStatus);
  };

  const handleHabitPress = (habitId: number) => {
    router.push(`/habit/${habitId}`);
  };

  const handleAddHabit = () => {
    router.push('/habit/create');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <DashboardHeader
              completed={dailyProgress.completed}
              total={dailyProgress.total}
            />

            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {filteredHabits.length === 0 && !isLoading && (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="leaf-outline"
                  size={64}
                  color={colors.textMuted}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {habits.length === 0
                    ? 'Sin hábitos para hoy'
                    : 'Sin hábitos en esta categoría'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {habits.length === 0
                    ? 'Crea tu primer hábito para comenzar tu viaje'
                    : 'Selecciona otra categoría o agrega más hábitos'}
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            onToggle={handleToggleHabit}
            onPress={() => handleHabitPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshAll}
            tintColor={colors.tint}
          />
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={handleAddHabit}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
