import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useCourseStore } from "../store/courseStore";
import { Course } from "../types/course";

const imageErrorCache = new Map<string, boolean>();
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Helper function to get placeholder colors
const getPlaceholderColor = (index: number): string => {
  const colors = [
    "#3B82F6", // blue
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#F59E0B", // amber
    "#10B981", // emerald
    "#06B6D4", // cyan
    "#F97316", // orange
    "#6366F1", // indigo
  ];
  return colors[index % colors.length];
};

// Helper function to get category icons
const getCategoryIcon = (category: string): any => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes("tech") || categoryLower.includes("phone") || categoryLower.includes("smart")) {
    return "phone-portrait-outline";
  }
  if (categoryLower.includes("laptop") || categoryLower.includes("computer")) {
    return "laptop-outline";
  }
  if (categoryLower.includes("fragrance") || categoryLower.includes("beauty")) {
    return "rose-outline";
  }
  if (categoryLower.includes("home") || categoryLower.includes("decor")) {
    return "home-outline";
  }
  if (categoryLower.includes("fashion") || categoryLower.includes("clothing")) {
    return "shirt-outline";
  }
  return "school-outline";
};

interface AnimatedCourseCardProps {
  item: Course;
  onPress: () => void;
  isDark: boolean;
  index: number;
}

export const AnimatedCourseCard = React.memo(({ item, onPress, isDark, index }: AnimatedCourseCardProps) => {
  const [imageError, setImageError] = useState(() => imageErrorCache.get(item.id) || false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isBookmarked = useCourseStore((state) => state.bookmarkedCourses.includes(item.id));
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);

  const scale = useSharedValue(1);
  const bookmarkScale = useSharedValue(1);
  const shimmerTranslate = useSharedValue(-300);

  // Shimmer effect on image load
  useEffect(() => {
    if (!imageLoaded && !imageError) {
      shimmerTranslate.value = withRepeat(
        withTiming(300, { duration: 1500 }),
        -1,
        false
      );
    }
  }, [imageLoaded, imageError]);

  // Pulse animation for bookmark
  useEffect(() => {
    if (isBookmarked) {
      bookmarkScale.value = withSequence(
        withSpring(1.3),
        withSpring(1)
      );
    }
  }, [isBookmarked]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  const handleImageError = useCallback(() => {
    imageErrorCache.set(item.id, true);
    setImageError(true);
  }, [item.id]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const handleBookmarkPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleBookmark(item.id);
  };

  // Check if course is new (created in last 7 days - mock logic)
  const isNew = index < 3; // First 3 courses are "new"

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600).springify()}
      className="mb-4"
    >
      <Animated.View
        style={cardAnimatedStyle}
        className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm overflow-hidden`}
      >
      {/* Course Thumbnail */}
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View className={`w-full h-48 ${isDark ? "bg-gray-700" : "bg-gray-200"} relative overflow-hidden`}>
          {!imageError && item.thumbnail ? (
            <>
              <Image
                source={{ uri: item.thumbnail }}
                className="w-full h-48"
                resizeMode="cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              {/* Shimmer effect while loading */}
              {!imageLoaded && (
                <Animated.View
                  style={[
                    shimmerStyle,
                    {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1, width: 100 }}
                  />
                </Animated.View>
              )}
              {/* Gradient overlay */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.3)"]}
                className="absolute inset-0"
              />
            </>
          ) : (
            <View className="w-full h-48 items-center justify-center" style={{ backgroundColor: getPlaceholderColor(index) }}>
              <Ionicons name={getCategoryIcon(item.category)} size={64} color="white" />
              <Text className="text-white font-semibold mt-2 text-center px-4">
                {item.category}
              </Text>
            </View>
          )}

          {/* NEW Badge */}
          {isNew && (
            <View className="absolute top-3 left-3 bg-green-500 px-3 py-1 rounded-full shadow-lg">
              <Text className="text-white font-bold text-xs">✨ NEW</Text>
            </View>
          )}
        </View>
      </AnimatedPressable>

      {/* Bookmark Button */}
      <AnimatedPressable
        onPress={handleBookmarkPress}
        style={[
          bookmarkAnimatedStyle,
          {
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: isDark ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.9)",
            padding: 8,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            zIndex: 10,
          },
        ]}
      >
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={20}
          color={isBookmarked ? "#3B82F6" : isDark ? "#9CA3AF" : "#6B7280"}
        />
      </AnimatedPressable>

      {/* Course Info */}
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="p-4"
      >
        {/* Category Badge */}
        <View className={`${isDark ? "bg-blue-900" : "bg-blue-50"} self-start px-3 py-1 rounded-full mb-2`}>
          <Text className={`${isDark ? "text-blue-300" : "text-blue-600"} text-xs font-semibold`}>
            {item.category}
          </Text>
        </View>

        {/* Course Title */}
        <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"} mb-2`} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Course Description */}
        <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm mb-3`} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Instructor Info */}
        {item.instructor && (
          <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? "border-gray-700" : "border-gray-100"}`}>
            <View className="flex-row items-center flex-1">
              <Image
                source={{ uri: item.instructor.avatar }}
                className="w-8 h-8 rounded-full mr-2"
              />
              <View className="flex-1">
                <Text className={`${isDark ? "text-white" : "text-gray-800"} font-medium text-sm`} numberOfLines={1}>
                  {item.instructor.name}
                </Text>
                <Text className={`${isDark ? "text-gray-400" : "text-gray-500"} text-xs`}>Instructor</Text>
              </View>
            </View>

            {/* Price */}
            <View className={`${isDark ? "bg-green-900" : "bg-green-50"} px-3 py-1 rounded-full`}>
              <Text className={`${isDark ? "text-green-300" : "text-green-600"} font-bold text-sm`}>
                ${item.price}
              </Text>
            </View>
          </View>
        )}
      </AnimatedPressable>
      </Animated.View>
    </Animated.View>
  );
});
