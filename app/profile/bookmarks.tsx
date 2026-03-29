import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, Modal, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeOutRight
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { useCourseStore } from "../../store/courseStore";
import { Course } from "../../types/course";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Separate component for bookmarked course item
function BookmarkedCourseItem({ 
  item, 
  onPress, 
  onRemoveBookmark,
  isDark,
  index,
  isGridView
}: { 
  item: Course; 
  onPress: () => void; 
  onRemoveBookmark: () => void;
  isDark: boolean;
  index: number;
  isGridView: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  if (isGridView) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        className="w-[48%] mb-4"
      >
        <Pressable onPress={onPress}>
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm overflow-hidden`}>
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
            </View>

            {/* Course Info */}
            <View className="p-3">
              <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-1`} numberOfLines={2}>
                {item.title}
              </Text>
              <View className={`${isDark ? 'bg-green-900' : 'bg-green-50'} self-start px-2 py-1 rounded-full mt-2`}>
                <Text className={`${isDark ? 'text-green-300' : 'text-green-600'} font-bold text-xs`}>
                  ${item.price}
                </Text>
              </View>
            </View>

            {/* Remove Button */}
            <Pressable
              onPress={onRemoveBookmark}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                padding: 6,
                borderRadius: 16,
              }}
            >
              <Ionicons name="bookmark" size={16} color="white" />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 100).springify()}
      exiting={FadeOutRight}
    >
      <Pressable onPress={onPress}>
        <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl mb-4 shadow-sm overflow-hidden h-36`}>
          <View className="flex-row h-full">
            {/* Course Thumbnail - Full Height */}
            <View className={`w-32 h-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              {!imageError && item.thumbnail ? (
                <Image
                  source={{ uri: item.thumbnail }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <View className="w-full h-full bg-blue-500 items-center justify-center">
                  <Ionicons name="school-outline" size={40} color="white" />
                </View>
              )}
            </View>

            {/* Course Info */}
            <View className="flex-1 py-3 px-4">
              <View className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} self-start px-2 py-1 rounded-full mb-2`}>
                <Text className={`${isDark ? 'text-blue-300' : 'text-blue-600'} text-xs font-semibold`}>
                  {item.category}
                </Text>
              </View>

              <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`} numberOfLines={2}>
                {item.title}
              </Text>

              {item.instructor && (
                <View className="flex-row items-center mb-3">
                  <Image
                    source={{ uri: item.instructor.avatar }}
                    className="w-5 h-5 rounded-full mr-2"
                  />
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs flex-1`} numberOfLines={1}>
                    {item.instructor.name}
                  </Text>
                </View>
              )}

              <View className={`${isDark ? 'bg-green-900' : 'bg-green-50'} self-start px-2 py-1 rounded-full mb-4`}>
                <Text className={`${isDark ? 'text-green-300' : 'text-green-600'} font-bold text-xs`}>
                  ${item.price}
                </Text>
              </View>
            </View>
          </View>

          {/* Remove Button */}
          <Pressable
            onPress={onRemoveBookmark}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              padding: 6,
              borderRadius: 16,
            }}
          >
            <Ionicons name="bookmark" size={16} color="white" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function Bookmarks() {
  const router = useRouter();
  const { courses, bookmarkedCourses, toggleBookmark, bookmarkTimestamps } = useCourseStore();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [renderCount, setRenderCount] = useState(0);
  const [isGridView, setIsGridView] = useState(() => {
    // Load saved view preference from global storage
    try {
      const saved = (global as any).bookmarksViewMode;
      return saved === 'grid';
    } catch {
      return false;
    }
  });
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'price'>('recent');

  // Filter and sort bookmarked courses
  let bookmarkedCoursesList = courses.filter((course) =>
    bookmarkedCourses.includes(course.id)
  );

  // Apply sorting
  if (sortBy === 'title') {
    bookmarkedCoursesList = [...bookmarkedCoursesList].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'price') {
    bookmarkedCoursesList = [...bookmarkedCoursesList].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'recent') {
    // Sort by bookmark timestamp (most recent first)
    bookmarkedCoursesList = [...bookmarkedCoursesList].sort((a, b) => {
      const timeA = bookmarkTimestamps[a.id] || 0;
      const timeB = bookmarkTimestamps[b.id] || 0;
      return timeB - timeA; // Most recent first
    });
  }

  const handleRemoveBookmark = (courseId: string) => {
    toggleBookmark(courseId);
    setRenderCount(prev => prev + 1);
  };

  const toggleViewMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMode = !isGridView;
    setIsGridView(newMode);
    // Save preference
    (global as any).bookmarksViewMode = newMode ? 'grid' : 'list';
  };

  const handleSort = (type: 'recent' | 'title' | 'price') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(type);
    setShowSortModal(false);
  };

  const renderBookmarkedItem = ({ item, index }: { item: Course; index: number }) => (
    <BookmarkedCourseItem
      item={item}
      index={index}
      onPress={() => router.push(`/course/${item.id}`)}
      onRemoveBookmark={() => handleRemoveBookmark(item.id)}
      isDark={isDark}
      isGridView={isGridView}
    />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} pt-16 pb-6 px-6 shadow-md`}>
        <View className="flex-row items-center mb-2">
          <Pressable
            onPress={() => router.back()}
            className={`${isDark ? 'bg-white/20' : 'bg-gray-100'} p-2 rounded-full mr-4`}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : '#1F2937'} />
          </Pressable>
          <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-3xl font-bold flex-1`}>
            My Bookmarks
          </Text>
          
          {/* View Toggle */}
          {bookmarkedCoursesList.length > 0 && (
            <>
              <Pressable
                onPress={toggleViewMode}
                className={`${isDark ? 'bg-white/20' : 'bg-gray-100'} p-2 rounded-full mr-2`}
              >
                <Ionicons name={isGridView ? "list" : "grid"} size={24} color={isDark ? 'white' : '#1F2937'} />
              </Pressable>
              
              {/* Sort Button */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowSortModal(true);
                }}
                className={`${isDark ? 'bg-white/20' : 'bg-gray-100'} p-2 rounded-full`}
              >
                <Ionicons name="funnel" size={24} color={isDark ? 'white' : '#1F2937'} />
              </Pressable>
            </>
          )}
        </View>
        <Text className={`${isDark ? 'text-white/90' : 'text-gray-600'} text-base ml-14`}>
          {bookmarkedCoursesList.length} {bookmarkedCoursesList.length === 1 ? 'course' : 'courses'} saved
        </Text>
      </View>

      {/* Bookmarked Courses List */}
      {bookmarkedCoursesList.length > 0 ? (
        <FlatList
          data={bookmarkedCoursesList}
          renderItem={renderBookmarkedItem}
          keyExtractor={(item) => `${item.id}-${renderCount}`}
          extraData={[renderCount, isGridView]}
          key={isGridView ? 'grid' : 'list'}
          numColumns={isGridView ? 2 : 1}
          columnWrapperStyle={isGridView ? { justifyContent: 'space-between' } : undefined}
          contentContainerStyle={{ 
            padding: 16,
            paddingBottom: Math.max(insets.bottom + 16, 32)
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        />
      ) : (
        <Animated.View 
          entering={FadeInDown.springify()}
          className="flex-1 items-center justify-center px-6"
        >
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 items-center shadow-sm`}>
            <Animated.View 
              entering={FadeInDown.delay(200).springify()}
              className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} w-24 h-24 rounded-full items-center justify-center mb-4`}
            >
              <Ionicons name="bookmark-outline" size={48} color="#3B82F6" />
            </Animated.View>
            <Animated.Text 
              entering={FadeInDown.delay(300).springify()}
              className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold mb-2`}
            >
              No Bookmarks Yet
            </Animated.Text>
            <Animated.Text 
              entering={FadeInDown.delay(400).springify()}
              className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center mb-6`}
            >
              Start bookmarking courses you're interested in to see them here
            </Animated.Text>
            <AnimatedPressable
              entering={FadeInDown.delay(500).springify()}
              onPress={() => router.push("/(tabs)/home")}
              className="bg-blue-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Browse Courses</Text>
            </AnimatedPressable>
          </View>
        </Animated.View>
      )}

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
              onPress={() => handleSort('recent')}
              className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 ${
                sortBy === 'recent' ? 'bg-blue-500' : (isDark ? 'bg-gray-700' : 'bg-gray-100')
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name="time-outline" 
                  size={24} 
                  color={sortBy === 'recent' ? 'white' : (isDark ? '#9CA3AF' : '#6B7280')} 
                />
                <Text className={`ml-3 text-lg font-semibold ${
                  sortBy === 'recent' ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')
                }`}>
                  Most Recent
                </Text>
              </View>
              {sortBy === 'recent' && <Ionicons name="checkmark" size={24} color="white" />}
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
              className={`flex-row items-center justify-between p-4 mb-10 rounded-2xl ${
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
    </GestureHandlerRootView>
  );
}
