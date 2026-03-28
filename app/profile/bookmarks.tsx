import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { useCourseStore } from "../../store/courseStore";
import { Course } from "../../types/course";
import { useTheme } from "../../contexts/ThemeContext";

// Separate component for bookmarked course item
function BookmarkedCourseItem({ 
  item, 
  onPress, 
  onRemoveBookmark,
  isDark
}: { 
  item: Course; 
  onPress: () => void; 
  onRemoveBookmark: () => void;
  isDark: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl mb-4 shadow-sm overflow-hidden`}>
      <Pressable onPress={onPress} className="flex-row">
        {/* Course Thumbnail */}
        <View className={`w-32 h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          {!imageError && item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              className="w-32 h-32"
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="w-32 h-32 bg-blue-500 items-center justify-center">
              <Ionicons name="school-outline" size={40} color="white" />
            </View>
          )}
        </View>

        {/* Course Info */}
        <View className="flex-1 p-4">
          {/* Category Badge */}
          <View className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} self-start px-2 py-1 rounded-full mb-2`}>
            <Text className={`${isDark ? 'text-blue-300' : 'text-blue-600'} text-xs font-semibold`}>
              {item.category}
            </Text>
          </View>

          {/* Course Title */}
          <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-1`} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Instructor */}
          {item.instructor && (
            <View className="flex-row items-center mt-2">
              <Image
                source={{ uri: item.instructor.avatar }}
                className="w-5 h-5 rounded-full mr-2"
              />
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs flex-1`} numberOfLines={1}>
                {item.instructor.name}
              </Text>
            </View>
          )}

          {/* Price */}
          <View className="flex-row items-center justify-between mt-2">
            <View className={`${isDark ? 'bg-green-900' : 'bg-green-50'} px-2 py-1 rounded-full`}>
              <Text className={`${isDark ? 'text-green-300' : 'text-green-600'} font-bold text-xs`}>
                ${item.price}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      {/* Remove Bookmark Button */}
      <Pressable
        onPress={onRemoveBookmark}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: 'rgba(239, 68, 68, 0.9)',
          padding: 8,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="bookmark" size={18} color="white" />
      </Pressable>
    </View>
  );
}

export default function Bookmarks() {
  const router = useRouter();
  const { courses, bookmarkedCourses, toggleBookmark } = useCourseStore();
  const { isDark } = useTheme();
  const [renderCount, setRenderCount] = useState(0);

  // Filter bookmarked courses
  const bookmarkedCoursesList = courses.filter((course) =>
    bookmarkedCourses.includes(course.id)
  );

  const handleRemoveBookmark = (courseId: string) => {
    toggleBookmark(courseId);
    setRenderCount(prev => prev + 1);
  };

  const renderBookmarkedItem = ({ item }: { item: Course }) => (
    <BookmarkedCourseItem
      item={item}
      onPress={() => router.push(`/course/${item.id}`)}
      onRemoveBookmark={() => handleRemoveBookmark(item.id)}
      isDark={isDark}
    />
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-blue-500'} pt-16 pb-6 px-6`}>
        <View className="flex-row items-center mb-2">
          <Pressable
            onPress={() => router.back()}
            className="bg-white/20 p-2 rounded-full mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-3xl font-bold flex-1">
            My Bookmarks
          </Text>
        </View>
        <Text className="text-white/90 text-base ml-14">
          {bookmarkedCoursesList.length} {bookmarkedCoursesList.length === 1 ? 'course' : 'courses'} saved
        </Text>
      </View>

      {/* Bookmarked Courses List */}
      {bookmarkedCoursesList.length > 0 ? (
        <FlatList
          data={bookmarkedCoursesList}
          renderItem={renderBookmarkedItem}
          keyExtractor={(item) => `${item.id}-${renderCount}`}
          extraData={renderCount}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 items-center shadow-sm`}>
            <View className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} w-24 h-24 rounded-full items-center justify-center mb-4`}>
              <Ionicons name="bookmark-outline" size={48} color="#3B82F6" />
            </View>
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold mb-2`}>
              No Bookmarks Yet
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center mb-6`}>
              Start bookmarking courses you're interested in to see them here
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/home")}
              className="bg-blue-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Browse Courses</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
