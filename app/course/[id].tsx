import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCourseStore } from "../../store/courseStore";

export default function CourseDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { courses, toggleBookmark, enrollCourse } = useCourseStore();
  const [enrolling, setEnrolling] = useState(false);

  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-500 text-lg mt-4">Course not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-blue-500 px-6 py-3 rounded-full mt-6"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleEnroll = async () => {
    if (course.isEnrolled) {
      Alert.alert("Already Enrolled", "You are already enrolled in this course!");
      return;
    }

    setEnrolling(true);
    
    // Simulate enrollment delay
    setTimeout(async () => {
      await enrollCourse(course.id);
      setEnrolling(false);
      
      Alert.alert(
        "Success!",
        "You have successfully enrolled in this course!",
        [
          {
            text: "Continue Learning",
            onPress: () => router.back(),
          },
        ]
      );
    }, 1000);
  };

  const handleBookmark = async () => {
    await toggleBookmark(course.id);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Course Image */}
        <View className="relative">
          <Image
            source={{ uri: course.thumbnail }}
            className="w-full h-64"
            resizeMode="cover"
          />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-4 bg-white/90 p-2 rounded-full shadow-md"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="absolute top-12 right-4 flex-row">
            {/* WebView Button */}
            <TouchableOpacity
              onPress={() => router.push(`/course/webview/${course.id}`)}
              className="bg-white/90 p-2 rounded-full shadow-md mr-2"
            >
              <Ionicons name="globe-outline" size={24} color="#1F2937" />
            </TouchableOpacity>

            {/* Bookmark Button */}
            <TouchableOpacity
              onPress={handleBookmark}
              className="bg-white/90 p-2 rounded-full shadow-md"
            >
              <Ionicons
                name={course.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={24}
                color={course.isBookmarked ? "#3B82F6" : "#1F2937"}
              />
            </TouchableOpacity>
          </View>

          {/* Enrollment Badge */}
          {course.isEnrolled && (
            <View className="absolute bottom-4 left-4 bg-green-500 px-4 py-2 rounded-full flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Enrolled</Text>
            </View>
          )}
        </View>

        {/* Course Content */}
        <View className="p-6">
          {/* Category Badge */}
          <View className="bg-blue-50 self-start px-4 py-2 rounded-full mb-3">
            <Text className="text-blue-600 font-semibold">{course.category}</Text>
          </View>

          {/* Course Title */}
          <Text className="text-3xl font-bold text-gray-800 mb-4">
            {course.title}
          </Text>

          {/* Instructor Info */}
          {course.instructor && (
            <View className="flex-row items-center mb-6 bg-gray-50 p-4 rounded-2xl">
              <Image
                source={{ uri: course.instructor.avatar }}
                className="w-16 h-16 rounded-full mr-4"
              />
              <View className="flex-1">
                <Text className="text-gray-500 text-sm mb-1">Instructor</Text>
                <Text className="text-gray-800 font-bold text-lg">
                  {course.instructor.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  @{course.instructor.username}
                </Text>
              </View>
            </View>
          )}

          {/* Course Stats */}
          <View className="flex-row justify-around mb-6 bg-gray-50 p-4 rounded-2xl">
            <View className="items-center">
              <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="time-outline" size={24} color="#3B82F6" />
              </View>
              <Text className="text-gray-800 font-bold">12 Hours</Text>
              <Text className="text-gray-500 text-xs">Duration</Text>
            </View>

            <View className="items-center">
              <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="play-circle-outline" size={24} color="#8B5CF6" />
              </View>
              <Text className="text-gray-800 font-bold">24 Lessons</Text>
              <Text className="text-gray-500 text-xs">Videos</Text>
            </View>

            <View className="items-center">
              <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="people-outline" size={24} color="#10B981" />
              </View>
              <Text className="text-gray-800 font-bold">1.2k</Text>
              <Text className="text-gray-500 text-xs">Students</Text>
            </View>
          </View>

          {/* Description Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-3">
              About This Course
            </Text>
            <Text className="text-gray-600 leading-6">
              {course.description}
            </Text>
          </View>

          {/* What You'll Learn */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-3">
              What You'll Learn
            </Text>
            <View className="space-y-3">
              {[
                "Master the fundamentals and advanced concepts",
                "Build real-world projects from scratch",
                "Best practices and industry standards",
                "Problem-solving and critical thinking skills",
              ].map((item, index) => (
                <View key={index} className="flex-row items-start mb-3">
                  <View className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                  </View>
                  <Text className="text-gray-700 flex-1">{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Price Section */}
          <View className="bg-blue-50 p-4 rounded-2xl mb-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-600 text-sm mb-1">Course Price</Text>
                <Text className="text-3xl font-bold text-blue-600">
                  ${course.price}
                </Text>
              </View>
              <View className="bg-blue-100 px-4 py-2 rounded-full">
                <Text className="text-blue-600 font-semibold">One-time payment</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enroll Button - Fixed at Bottom */}
      <View className="p-6 bg-white border-t border-gray-100">
        <Pressable
          onPress={handleEnroll}
          disabled={enrolling || course.isEnrolled}
          className={`p-4 rounded-2xl flex-row items-center justify-center ${
            course.isEnrolled
              ? "bg-green-500"
              : enrolling
              ? "bg-blue-400"
              : "bg-blue-500"
          }`}
        >
          {enrolling ? (
            <>
              <ActivityIndicator color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Enrolling...
              </Text>
            </>
          ) : course.isEnrolled ? (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Already Enrolled
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="school" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Enroll Now - ${course.price}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
