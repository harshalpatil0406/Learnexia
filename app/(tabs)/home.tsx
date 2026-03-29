import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { AnimatedCourseCard } from "../../components/AnimatedCourseCard";
import { AnimatedEmptyState } from "../../components/AnimatedEmptyState";
import { AnimatedSearchBar } from "../../components/AnimatedSearchBar";
import { CategoryPills } from "../../components/CategoryPills";
import { FloatingActionButton } from "../../components/FloatingActionButton";
import { HeroCarousel } from "../../components/HeroCarousel";
import { HomeSkeleton } from "../../components/HomeSkeleton";
import { useTheme } from "../../contexts/ThemeContext";
import { getErrorMessage } from "../../services/api";
import { useCourseStore } from "../../store/courseStore";
import { Course } from "../../types/course";

export default function Home() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  // Subscribe to specific store values to ensure re-renders
  const courses = useCourseStore((state) => state.courses);
  const loading = useCourseStore((state) => state.loading);
  const searchQuery = useCourseStore((state) => state.searchQuery);
  const fetchCourses = useCourseStore((state) => state.fetchCourses);
  const setSearchQuery = useCourseStore((state) => state.setSearchQuery);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchCourses();
        setError(null);
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(getErrorMessage(err));
      }
    };
    initialize();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchCourses();
      setError(null);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
    setIsRefreshing(false);
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = ["All", ...new Set(courses.map((c) => c.category))];
    return uniqueCategories;
  }, [courses]);

  // Filter courses by search and category
  const filteredCourses = useMemo(() => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((course) => course.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query) ||
          course.instructor?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [courses, searchQuery, selectedCategory]);

  const handleFilterPress = () => {
    Alert.alert(
      "Filters",
      "Advanced filtering options coming soon!",
      [{ text: "OK" }]
    );
  };

  // Memoized render function with useCallback
  const renderCourseItem = useCallback(({ item, index }: { item: Course; index: number }) => (
    <AnimatedCourseCard
      item={item}
      onPress={() => router.push(`/course/${item.id}`)}
      isDark={isDark}
      index={index}
    />
  ), [router, isDark]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: Course) => item.id, []);

  // Memoized empty component
  const ListEmptyComponent = useMemo(() => (
    <AnimatedEmptyState isDark={isDark} />
  ), [isDark]);

  if (loading && courses.length === 0) {
    return <HomeSkeleton isDark={isDark} />;
  }

  if (error) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'} px-6`}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-lg font-bold mt-4`}>Oops!</Text>
        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center mt-2 px-4`}>{error}</Text>
        <Pressable
          onPress={handleRefresh}
          className="bg-blue-500 px-6 py-3 rounded-full mt-6 flex-row items-center"
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} pt-14 pb-4 px-6 shadow-sm`}>
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-2xl font-bold`}>
              Learnexia
            </Text>
            <Text className={`${isDark ? 'text-white/70' : 'text-gray-500'} text-xs mt-0.5`}>
              Explore & Learn
            </Text>
          </View>
          <View className={`${isDark ? 'bg-white/20' : 'bg-blue-50'} px-3 py-1.5 rounded-full`}>
            <Text className={`${isDark ? 'text-white' : 'text-blue-600'} font-semibold text-xs`}>
              {courses.length} Courses
            </Text>
          </View>
        </View>

        {/* Animated Search Bar */}
        <AnimatedSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          isLoading={loading}
          isDark={isDark}
        />
      </View>

      {/* Course List with Hero Carousel and Category Pills */}
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <>
            {/* Hero Carousel */}
            {!searchQuery && selectedCategory === "All" && (
              <HeroCarousel courses={courses} isDark={isDark} />
            )}

            {/* Category Pills */}
            <CategoryPills
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              isDark={isDark}
            />
          </>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
  );
}
