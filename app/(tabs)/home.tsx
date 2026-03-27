import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, Text, TextInput, View } from "react-native";
import { useCourseStore } from "../../store/courseStore";
import { Course } from "../../types/course";

// Memoized course item component for better performance
// Using a Map to track image errors persistently across re-renders
const imageErrorCache = new Map<string, boolean>();

const CourseItem = React.memo(({ item, onPress, onBookmark }: { 
  item: Course; 
  onPress: () => void; 
  onBookmark: () => void;
}) => {
  // Use cached error state instead of local state to prevent blinking
  const [imageError, setImageError] = useState(() => imageErrorCache.get(item.id) || false);
  const isBookmarked = useCourseStore.getState().bookmarkedCourses.includes(item.id);

  const handleImageError = useCallback(() => {
    imageErrorCache.set(item.id, true);
    setImageError(true);
  }, [item.id]);

  return (
    <View className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden">
      {/* Course Thumbnail - Touchable */}
      <Pressable onPress={onPress}>
        <View className="w-full h-48 bg-gray-200">
          {!imageError && item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              className="w-full h-48"
              resizeMode="cover"
              onError={handleImageError}
            />
          ) : (
            <View className="w-full h-48 bg-blue-500 items-center justify-center">
              <Ionicons name="school-outline" size={64} color="white" />
              <Text className="text-white font-semibold mt-2 text-center px-4">
                {item.category}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Bookmark Button - Separate Touchable */}
      <Pressable
        onPress={onBookmark}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 8,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          zIndex: 10,
        }}
      >
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={20}
          color={isBookmarked ? "#3B82F6" : "#6B7280"}
        />
      </Pressable>

      {/* Course Info - Touchable */}
      <Pressable onPress={onPress} className="p-4">
        {/* Category Badge */}
        <View className="bg-blue-50 self-start px-3 py-1 rounded-full mb-2">
          <Text className="text-blue-600 text-xs font-semibold">
            {item.category}
          </Text>
        </View>

        {/* Course Title */}
        <Text className="text-lg font-bold text-gray-800 mb-2" numberOfLines={2}>
          {item.title}
        </Text>

        {/* Course Description */}
        <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        {/* Instructor Info */}
        {item.instructor && (
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
            <View className="flex-row items-center flex-1">
              <Image
                source={{ uri: item.instructor.avatar }}
                className="w-8 h-8 rounded-full mr-2"
              />
              <View className="flex-1">
                <Text className="text-gray-800 font-medium text-sm" numberOfLines={1}>
                  {item.instructor.name}
                </Text>
                <Text className="text-gray-500 text-xs">Instructor</Text>
              </View>
            </View>

            {/* Price */}
            <View className="bg-green-50 px-3 py-1 rounded-full">
              <Text className="text-green-600 font-bold text-sm">
                ${item.price}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.isBookmarked === nextProps.item.isBookmarked &&
    prevProps.item.thumbnail === nextProps.item.thumbnail
  );
});

export default function Home() {
  const router = useRouter();
  
  // Subscribe to specific store values to ensure re-renders
  const courses = useCourseStore((state) => state.courses);
  const loading = useCourseStore((state) => state.loading);
  const searchQuery = useCourseStore((state) => state.searchQuery);
  const fetchCourses = useCourseStore((state) => state.fetchCourses);
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const setSearchQuery = useCourseStore((state) => state.setSearchQuery);
  const initializeStorage = useCourseStore((state) => state.initializeStorage);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchCourses();
        setError(null);
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(err?.message || "Failed to load courses");
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
      setError(err?.message || "Failed to refresh courses");
    }
    setIsRefreshing(false);
  };

  const handleBookmark = useCallback((courseId: string) => {
    console.log("Bookmark clicked for course:", courseId);
    toggleBookmark(courseId);
    setRenderCount(prev => prev + 1); // Force re-render
  }, [toggleBookmark]);

  // Use useMemo to cache filtered courses and prevent infinite loops
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses;
    }

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.instructor?.name.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  // Memoized render function with useCallback
  const renderCourseItem = useCallback(({ item }: { item: Course }) => (
    <CourseItem
      item={item}
      onPress={() => router.push(`/course/${item.id}`)}
      onBookmark={() => handleBookmark(item.id)}
    />
  ), [router, handleBookmark]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: Course) => item.id, []);

  // Memoized empty component
  const ListEmptyComponent = useMemo(() => (
    <View className="items-center justify-center py-20">
      <Ionicons name="search-outline" size={64} color="#D1D5DB" />
      <Text className="text-gray-500 text-lg mt-4">No courses found</Text>
      <Text className="text-gray-400 text-sm mt-2">
        Try adjusting your search
      </Text>
    </View>
  ), []);

  if (loading && courses.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading courses...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-gray-800 text-lg font-bold mt-4">Oops!</Text>
        <Text className="text-gray-600 text-center mt-2">{error}</Text>
        <Pressable
          onPress={handleRefresh}
          className="bg-blue-500 px-6 py-3 rounded-full mt-6"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-500 pt-16 pb-6 px-6">
        <Text className="text-white text-3xl font-bold mb-4">
          Discover Courses
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Course List */}
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={keyExtractor}
        extraData={renderCount}
        contentContainerStyle={{ padding: 16 }}
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
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 380, // Approximate item height
          offset: 380 * index,
          index,
        })}
      />
    </View>
  );
}
