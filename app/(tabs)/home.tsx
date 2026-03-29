import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Modal, Pressable, RefreshControl, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedCourseCard } from "../../components/AnimatedCourseCard";
import { AnimatedEmptyState } from "../../components/AnimatedEmptyState";
import { AnimatedSearchBar } from "../../components/AnimatedSearchBar";
import { CategoryPills } from "../../components/CategoryPills";
import { HeroCarousel } from "../../components/HeroCarousel";
import { HomeSkeleton } from "../../components/HomeSkeleton";
import { useTheme } from "../../contexts/ThemeContext";
import { getErrorMessage } from "../../services/api";
import { useCourseStore } from "../../store/courseStore";
import { Course } from "../../types/course";

// Grid Course Item Component (compact for grid view)
function GridCourseItem({ 
  item, 
  onPress, 
  isDark,
  index
}: { 
  item: Course; 
  onPress: () => void; 
  isDark: boolean;
  index: number;
}) {
  const [imageError, setImageError] = useState(false);
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const isBookmarked = useCourseStore((state) => state.bookmarkedCourses.includes(item.id));

  const handleBookmarkPress = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmark(item.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      className="w-[48%] mb-4"
    >
      <Pressable onPress={onPress}>
        <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm overflow-hidden`} style={{ height: 340 }}>
          {/* Course Thumbnail */}
          <View className={`w-full h-40 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            {!imageError && item.thumbnail ? (
              <Image
                source={{ uri: item.thumbnail }}
                className="w-full h-40"
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View className="w-full h-40 bg-blue-500 items-center justify-center">
                <Ionicons name="school-outline" size={32} color="white" />
              </View>
            )}
            
            {/* Bookmark Button */}
            <Pressable
              onPress={handleBookmarkPress}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                padding: 6,
                borderRadius: 16,
              }}
            >
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={isBookmarked ? "#3B82F6" : (isDark ? '#9CA3AF' : '#6B7280')} 
              />
            </Pressable>
          </View>

          {/* Course Info - Fixed height: 200px (340 - 140 thumbnail) */}
          <View className="p-3" style={{ height: 200 }}>
            <View className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} self-start px-2 py-1 rounded-full mb-2`}>
              <Text className={`${isDark ? 'text-blue-300' : 'text-blue-600'} text-xs font-semibold`}>
                {item.category}
              </Text>
            </View>
            
            {/* Fixed height for title */}
            <View style={{ height: 36, marginBottom: 8 }}>
              <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
            
            {/* Fixed height for description */}
            <View style={{ height: 32, marginBottom: 8 }}>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            
            {/* Instructor Info - Fixed height */}
            {item.instructor && (
              <View className="flex-row items-center mb-2" style={{ height: 20 }}>
                <Image
                  source={{ uri: item.instructor.avatar }}
                  className="w-5 h-5 rounded-full mr-2"
                />
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs flex-1`} numberOfLines={1}>
                  {item.instructor.name}
                </Text>
              </View>
            )}
            
            {/* Price at bottom */}
            <View className="absolute bottom-3 left-3">
              <View className={`${isDark ? 'bg-green-900' : 'bg-green-50'} px-2 py-1 rounded-full`}>
                <Text className={`${isDark ? 'text-green-300' : 'text-green-600'} font-bold text-xs`}>
                  ${item.price}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function Home() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Subscribe to specific store values to ensure re-renders
  const courses = useCourseStore((state) => state.courses);
  const loading = useCourseStore((state) => state.loading);
  const searchQuery = useCourseStore((state) => state.searchQuery);
  const fetchCourses = useCourseStore((state) => state.fetchCourses);
  const setSearchQuery = useCourseStore((state) => state.setSearchQuery);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isGridView, setIsGridView] = useState(() => {
    try {
      const saved = (global as any).homeViewMode;
      return saved === 'grid';
    } catch {
      return false;
    }
  });
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'price'>('default');

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

    // Apply sorting
    if (sortBy === 'title') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'price') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    }

    return filtered;
  }, [courses, searchQuery, selectedCategory, sortBy]);

  const toggleViewMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMode = !isGridView;
    setIsGridView(newMode);
    (global as any).homeViewMode = newMode ? 'grid' : 'list';
  };

  const handleSort = (type: 'default' | 'title' | 'price') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(type);
    setShowSortModal(false);
  };

  // Memoized render function with useCallback
  const renderCourseItem = useCallback(({ item, index }: { item: Course; index: number }) => {
    if (isGridView) {
      return (
        <GridCourseItem
          item={item}
          onPress={() => router.push(`/course/${item.id}`)}
          isDark={isDark}
          index={index}
        />
      );
    }
    return (
      <AnimatedCourseCard
        item={item}
        onPress={() => router.push(`/course/${item.id}`)}
        isDark={isDark}
        index={index}
      />
    );
  }, [router, isDark, isGridView]);

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
          <View className="flex-1">
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-2xl font-bold`}>
              Learnexia
            </Text>
            <Text className={`${isDark ? 'text-white/70' : 'text-gray-500'} text-xs mt-0.5`}>
              Explore & Learn
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className={`${isDark ? 'bg-white/20' : 'bg-blue-50'} px-3 py-1.5 rounded-full mr-2`}>
              <Text className={`${isDark ? 'text-white' : 'text-blue-600'} font-semibold text-xs`}>
                {courses.length} Courses
              </Text>
            </View>
            
            {/* View Toggle */}
            {filteredCourses.length > 0 && (
              <>
                <Pressable
                  onPress={toggleViewMode}
                  className={`${isDark ? 'bg-white/20' : 'bg-gray-100'} p-2 rounded-full mr-2`}
                >
                  <Ionicons name={isGridView ? "list" : "grid"} size={20} color={isDark ? 'white' : '#1F2937'} />
                </Pressable>
                
                {/* Sort Button */}
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowSortModal(true);
                  }}
                  className={`${isDark ? 'bg-white/20' : 'bg-gray-100'} p-2 rounded-full`}
                >
                  <Ionicons name="funnel" size={20} color={isDark ? 'white' : '#1F2937'} />
                </Pressable>
              </>
            )}
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
        key={isGridView ? 'grid' : 'list'}
        numColumns={isGridView ? 2 : 1}
        columnWrapperStyle={isGridView ? { justifyContent: 'space-between' } : undefined}
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
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingBottom: Math.max(insets.bottom + 80, 100)
        }}
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

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <Pressable 
          onPress={() => setShowSortModal(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <Animated.View
            entering={FadeInDown.springify()}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6`}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold`}>
                Sort By
              </Text>
              <Pressable onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={28} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => handleSort('default')}
              className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 ${
                sortBy === 'default' ? 'bg-blue-500' : (isDark ? 'bg-gray-700' : 'bg-gray-100')
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name="apps-outline" 
                  size={24} 
                  color={sortBy === 'default' ? 'white' : (isDark ? '#9CA3AF' : '#6B7280')} 
                />
                <Text className={`ml-3 text-lg font-semibold ${
                  sortBy === 'default' ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')
                }`}>
                  Default
                </Text>
              </View>
              {sortBy === 'default' && <Ionicons name="checkmark" size={24} color="white" />}
            </Pressable>

            <Pressable
              onPress={() => handleSort('title')}
              className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 ${
                sortBy === 'title' ? 'bg-blue-500' : (isDark ? 'bg-gray-700' : 'bg-gray-100')
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name="text-outline" 
                  size={24} 
                  color={sortBy === 'title' ? 'white' : (isDark ? '#9CA3AF' : '#6B7280')} 
                />
                <Text className={`ml-3 text-lg font-semibold ${
                  sortBy === 'title' ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')
                }`}>
                  Title (A-Z)
                </Text>
              </View>
              {sortBy === 'title' && <Ionicons name="checkmark" size={24} color="white" />}
            </Pressable>

            <Pressable
              onPress={() => handleSort('price')}
              className={`flex-row items-center justify-between p-4 rounded-2xl ${
                sortBy === 'price' ? 'bg-blue-500' : (isDark ? 'bg-gray-700' : 'bg-gray-100')
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name="cash-outline" 
                  size={24} 
                  color={sortBy === 'price' ? 'white' : (isDark ? '#9CA3AF' : '#6B7280')} 
                />
                <Text className={`ml-3 text-lg font-semibold ${
                  sortBy === 'price' ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')
                }`}>
                  Price (Low to High)
                </Text>
              </View>
              {sortBy === 'price' && <Ionicons name="checkmark" size={24} color="white" />}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
