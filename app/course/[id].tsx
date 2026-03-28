import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  Share,
  Text,
  View
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SuccessModal } from "../../components/SuccessModal";
import { useTheme } from "../../contexts/ThemeContext";
import { useCourseStore } from "../../store/courseStore";

const { height } = Dimensions.get("window");
const HEADER_HEIGHT = 300;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CourseDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { courses, toggleBookmark, enrollCourse } = useCourseStore();
  const { isDark } = useTheme();
  const [enrolling, setEnrolling] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const scrollY = useSharedValue(0);
  const enrollButtonScale = useSharedValue(1);

  // Count-up animation values
  const studentsCount = useSharedValue(0);
  const lessonsCount = useSharedValue(0);
  const hoursCount = useSharedValue(0);

  const course = courses.find((c) => c.id === id);

  useEffect(() => {
    // Animate stats on mount
    studentsCount.value = withDelay(300, withTiming(1200, { duration: 1500 }));
    lessonsCount.value = withDelay(400, withTiming(24, { duration: 1500 }));
    hoursCount.value = withDelay(500, withTiming(12, { duration: 1500 }));
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const scale = 1 + scrollY.value / 1000;
    const opacity = 1 - scrollY.value / 200;
    return {
      transform: [{ scale: Math.max(1, scale) }],
      opacity: Math.max(0, opacity),
    };
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const translateY = scrollY.value > 200 ? 0 : -100;
    return {
      transform: [{ translateY: withSpring(translateY) }],
    };
  });

  const handleEnroll = async () => {
    if (course?.isEnrolled) {
      Alert.alert("Already Enrolled", "You are already enrolled in this course!");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    enrollButtonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1.05),
      withSpring(1)
    );

    setEnrolling(true);
    
    setTimeout(async () => {
      if (course) {
        await enrollCourse(course.id);
        setShowConfetti(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        setTimeout(() => setShowConfetti(false), 3000);
        
        setEnrolling(false);
        setShowSuccessModal(true);
      }
    }, 1000);
  };

  const handleBookmark = async () => {
    if (course) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await toggleBookmark(course.id);
    }
  };

  const handleShare = async () => {
    if (course) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        await Share.share({
          message: `Check out this course: ${course.title} - Only $${course.price}!`,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleSection = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!course) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <Ionicons name="alert-circle-outline" size={64} color={isDark ? '#4B5563' : '#D1D5DB'} />
        <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-lg mt-4`}>Course not found</Text>
        <Pressable onPress={() => router.back()} className="bg-blue-500 px-6 py-3 rounded-full mt-6">
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const enrollButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: enrollButtonScale.value }],
  }));

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Sticky Header */}
      <Animated.View
        style={[
          stickyHeaderStyle,
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: isDark ? "#1F2937" : "#3B82F6",
            paddingTop: 48,
            paddingBottom: 12,
            paddingHorizontal: 24,
          },
        ]}
      >
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white font-bold text-lg flex-1 mx-4" numberOfLines={1}>
            {course.title}
          </Text>
          <Pressable onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="white" />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Parallax Header Image */}
        <Animated.View style={[headerStyle, { height: HEADER_HEIGHT }]}>
          <Image
            source={{ uri: course.thumbnail }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={{ position: "absolute", inset: 0 }}
          />

          {/* Action Buttons */}
          <View className="absolute top-12 left-4 right-4 flex-row justify-between">
            <Pressable
              onPress={() => router.back()}
              className={`${isDark ? 'bg-gray-800/90' : 'bg-white/90'} p-2 rounded-full shadow-md`}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#F3F4F6' : '#1F2937'} />
            </Pressable>

            <View className="flex-row">
              <Pressable
                onPress={() => router.push(`/course/webview/${course.id}`)}
                className={`${isDark ? 'bg-gray-800/90' : 'bg-white/90'} p-2 rounded-full shadow-md mr-2`}
              >
                <Ionicons name="globe-outline" size={24} color={isDark ? '#F3F4F6' : '#1F2937'} />
              </Pressable>
              <Pressable
                onPress={handleShare}
                className={`${isDark ? 'bg-gray-800/90' : 'bg-white/90'} p-2 rounded-full shadow-md mr-2`}
              >
                <Ionicons name="share-outline" size={24} color={isDark ? '#F3F4F6' : '#1F2937'} />
              </Pressable>
              <Pressable
                onPress={handleBookmark}
                className={`${isDark ? 'bg-gray-800/90' : 'bg-white/90'} p-2 rounded-full shadow-md`}
              >
                <Ionicons
                  name={course.isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color={course.isBookmarked ? "#3B82F6" : (isDark ? '#F3F4F6' : '#1F2937')}
                />
              </Pressable>
            </View>
          </View>

          {course.isEnrolled && (
            <View className="absolute bottom-4 left-4 bg-green-500 px-4 py-2 rounded-full flex-row items-center">
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Enrolled</Text>
            </View>
          )}
        </Animated.View>

        {/* Course Content */}
        <View className="p-6">
          {/* Category Badge */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} self-start px-4 py-2 rounded-full mb-3`}
          >
            <Text className={`${isDark ? 'text-blue-300' : 'text-blue-600'} font-semibold`}>
              {course.category}
            </Text>
          </Animated.View>

          {/* Course Title */}
          <Animated.Text
            entering={FadeInDown.delay(200).duration(600)}
            className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}
          >
            {course.title}
          </Animated.Text>

          {/* Stats Cards with Count-up Animation */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            className={`flex-row justify-around mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-2xl`}
          >
            <StatCard
              icon="time-outline"
              value="12"
              label="Hours"
              color="#3B82F6"
              bgColor={isDark ? 'bg-blue-900' : 'bg-blue-100'}
              isDark={isDark}
              delay={300}
            />
            <StatCard
              icon="play-circle-outline"
              value="24"
              label="Lessons"
              color="#8B5CF6"
              bgColor={isDark ? 'bg-purple-900' : 'bg-purple-100'}
              isDark={isDark}
              delay={400}
            />
            <StatCard
              icon="people-outline"
              value="1.2k"
              label="Students"
              color="#10B981"
              bgColor={isDark ? 'bg-green-900' : 'bg-green-100'}
              isDark={isDark}
              delay={500}
            />
          </Animated.View>

          {/* Instructor Card - Slide in from right */}
          {course.instructor && (
            <Animated.View
              entering={FadeInRight.delay(400).duration(600)}
              className={`flex-row items-center mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-2xl`}
            >
              <Image
                source={{ uri: course.instructor.avatar }}
                className="w-16 h-16 rounded-full mr-4"
              />
              <View className="flex-1">
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>
                  Instructor
                </Text>
                <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-bold text-lg`}>
                  {course.instructor.name}
                </Text>
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                  @{course.instructor.username}
                </Text>
              </View>
              <Pressable className="bg-blue-500 px-4 py-2 rounded-full">
                <Text className="text-white font-semibold text-sm">Follow</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Description */}
          <Animated.View entering={FadeInDown.delay(500).duration(600)} className="mb-6">
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>
              About This Course
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-6`}>
              {course.description}
            </Text>
          </Animated.View>

          {/* What You'll Learn - Accordion */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)} className="mb-6">
            <Pressable
              onPress={() => toggleSection("learn")}
              className={`flex-row items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-2xl mb-3`}
            >
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                What You'll Learn
              </Text>
              <Ionicons
                name={expandedSection === "learn" ? "chevron-up" : "chevron-down"}
                size={24}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </Pressable>
            
            {expandedSection === "learn" && (
              <Animated.View entering={FadeInDown.duration(300)}>
                {[
                  "Master the fundamentals and advanced concepts",
                  "Build real-world projects from scratch",
                  "Best practices and industry standards",
                  "Problem-solving and critical thinking skills",
                ].map((item, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInDown.delay(index * 100).duration(400)}
                    className="flex-row items-start mb-3"
                  >
                    <View className={`${isDark ? 'bg-green-900' : 'bg-green-100'} p-1 rounded-full mr-3 mt-1`}>
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                    </View>
                    <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} flex-1`}>
                      {item}
                    </Text>
                  </Animated.View>
                ))}
              </Animated.View>
            )}
          </Animated.View>

          {/* Curriculum - Accordion */}
          <Animated.View entering={FadeInDown.delay(700).duration(600)} className="mb-6">
            <Pressable
              onPress={() => toggleSection("curriculum")}
              className={`flex-row items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-2xl mb-3`}
            >
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Curriculum
              </Text>
              <Ionicons
                name={expandedSection === "curriculum" ? "chevron-up" : "chevron-down"}
                size={24}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </Pressable>
            
            {expandedSection === "curriculum" && (
              <Animated.View entering={FadeInDown.duration(300)}>
                {["Introduction to Basics", "Core Concepts", "Advanced Techniques", "Final Project"].map((item, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInDown.delay(index * 100).duration(400)}
                    className={`flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl mb-2 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                  >
                    <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
                      <Text className="text-white font-bold text-sm">{index + 1}</Text>
                    </View>
                    <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-medium flex-1`}>
                      {item}
                    </Text>
                    <Ionicons name="play-circle-outline" size={24} color="#3B82F6" />
                  </Animated.View>
                ))}
              </Animated.View>
            )}
          </Animated.View>

          {/* Reviews Section */}
          <Animated.View entering={FadeInDown.delay(800).duration(600)} className="mb-6">
            <Pressable
              onPress={() => toggleSection("reviews")}
              className={`flex-row items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-2xl mb-3`}
            >
              <View className="flex-row items-center">
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mr-2`}>
                  Reviews
                </Text>
                <View className="flex-row items-center bg-yellow-400 px-2 py-1 rounded-full">
                  <Ionicons name="star" size={14} color="#78350F" />
                  <Text className="text-yellow-900 font-bold text-xs ml-1">4.8</Text>
                </View>
              </View>
              <Ionicons
                name={expandedSection === "reviews" ? "chevron-up" : "chevron-down"}
                size={24}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </Pressable>
            
            {expandedSection === "reviews" && (
              <Animated.View entering={FadeInDown.duration(300)}>
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center py-8`}>
                  Reviews coming soon!
                </Text>
              </Animated.View>
            )}
          </Animated.View>

          {/* Price Section */}
          <Animated.View
            entering={FadeInDown.delay(900).duration(600)}
            className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} p-4 rounded-2xl mb-6`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-1`}>
                  Course Price
                </Text>
                <Text className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  ${course.price}
                </Text>
              </View>
              <View className={`${isDark ? 'bg-blue-800' : 'bg-blue-100'} px-4 py-2 rounded-full`}>
                <Text className={`${isDark ? 'text-blue-300' : 'text-blue-600'} font-semibold`}>
                  One-time
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        title="🎉 Congratulations! 🎉"
        message="You have successfully enrolled in this course. Start learning now!"
        isDark={isDark}
      />

      {/* Enroll Button - Fixed at Bottom */}
      <View className={`p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border-t`}>
        <AnimatedPressable
          onPress={handleEnroll}
          disabled={enrolling || course.isEnrolled}
          style={enrollButtonStyle}
          className={`p-4 rounded-2xl flex-row items-center justify-center ${
            course.isEnrolled ? "bg-green-500" : enrolling ? "bg-blue-400" : "bg-blue-500"
          }`}
        >
          {enrolling ? (
            <>
              <ActivityIndicator color="white" />
              <Text className="text-white font-bold text-lg ml-2">Enrolling...</Text>
            </>
          ) : course.isEnrolled ? (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Already Enrolled</Text>
            </>
          ) : (
            <>
              <Ionicons name="school" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Enroll Now - ${course.price}</Text>
            </>
          )}
        </AnimatedPressable>
      </View>
    </View>
  );
}

// StatCard Component with count-up animation
function StatCard({ icon, value, label, color, bgColor, isDark, delay }: {
  icon: any;
  value: string;
  label: string;
  color: string;
  bgColor: string;
  isDark: boolean;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(600)} className="items-center">
      <View className={`${bgColor} w-12 h-12 rounded-full items-center justify-center mb-2`}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-bold`}>{value}</Text>
      <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs`}>{label}</Text>
    </Animated.View>
  );
}
