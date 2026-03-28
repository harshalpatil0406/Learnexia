import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { useCourseStore } from "../../store/courseStore";
import { Course } from "../../types/course";
import { useTheme } from "../../contexts/ThemeContext";

// Separate component for enrolled course item
function EnrolledCourseItem({ 
  item, 
  onPress,
  isDark
}: { 
  item: Course; 
  onPress: () => void;
  isDark: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <Pressable onPress={onPress}>
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl mb-4 shadow-sm overflow-hidden`}>
        {/* Course Thumbnail */}
        <View className={`w-full h-48 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          {!imageError && item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              className="w-full h-48"
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="w-full h-48 bg-blue-500 items-center justify-center">
              <Ionicons name="school-outline" size={64} color="white" />
              <Text className="text-white font-semibold mt-2 text-center px-4">
                {item.category}
              </Text>
            </View>
          )}
          
          {/* Enrolled Badge */}
          <View className="absolute top-3 left-3 bg-green-500 px-3 py-1 rounded-full flex-row items-center">
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <Text className="text-white font-semibold text-xs ml-1">Enrolled</Text>
          </View>
        </View>

        {/* Course Info */}
        <View className="p-4">
          {/* Category Badge */}
          <View className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} self-start px-3 py-1 rounded-full mb-2`}>
            <Text className={`${isDark ? 'text-blue-300' : 'text-blue-600'} text-xs font-semibold`}>
              {item.category}
            </Text>
          </View>

          {/* Course Title */}
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Course Description */}
          <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-3`} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Progress Bar */}
          <View className="mb-3">
            <View className="flex-row justify-between mb-1">
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Progress</Text>
              <Text className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-xs font-semibold`}>45%</Text>
            </View>
            <View className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <View className="w-[45%] h-full bg-blue-500 rounded-full" />
            </View>
          </View>

          {/* Instructor Info */}
          {item.instructor && (
            <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="flex-row items-center flex-1">
                <Image
                  source={{ uri: item.instructor.avatar }}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <View className="flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-medium text-sm`} numberOfLines={1}>
                    {item.instructor.name}
                  </Text>
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Instructor</Text>
                </View>
              </View>

              {/* Continue Button */}
              <View className="bg-blue-500 px-4 py-2 rounded-full">
                <Text className="text-white font-semibold text-xs">Continue</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function EnrolledCourses() {
  const router = useRouter();
  const { courses, enrolledCourses } = useCourseStore();
  const { isDark } = useTheme();

  // Filter enrolled courses
  const enrolledCoursesList = courses.filter((course) =>
    enrolledCourses.includes(course.id)
  );

  const renderEnrolledItem = ({ item }: { item: Course }) => (
    <EnrolledCourseItem
      item={item}
      onPress={() => router.push(`/course/${item.id}`)}
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
            My Courses
          </Text>
        </View>
        <Text className="text-white/90 text-base ml-14">
          {enrolledCoursesList.length} {enrolledCoursesList.length === 1 ? 'course' : 'courses'} enrolled
        </Text>
      </View>

      {/* Enrolled Courses List */}
      {enrolledCoursesList.length > 0 ? (
        <FlatList
          data={enrolledCoursesList}
          renderItem={renderEnrolledItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 items-center shadow-sm`}>
            <View className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} w-24 h-24 rounded-full items-center justify-center mb-4`}>
              <Ionicons name="school-outline" size={48} color="#3B82F6" />
            </View>
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold mb-2`}>
              No Enrolled Courses
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center mb-6`}>
              Start learning by enrolling in courses that interest you
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
