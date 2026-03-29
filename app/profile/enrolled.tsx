import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Modal, Pressable, Text, View } from "react-native";
import Animated, {
    FadeInDown,
    FadeInLeft,
    Layout,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../../contexts/ThemeContext";
import { useCourseStore } from "../../store/courseStore";
import { Course } from "../../types/course";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Progress Ring Component
function ProgressRing({ progress, size = 60, strokeWidth = 6, isDark }: { progress: number; size?: number; strokeWidth?: number; isDark: boolean }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withDelay(300, withTiming(progress, { duration: 1000 }));
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progressValue.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? '#374151' : '#E5E7EB'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progress === 100 ? '#10B981' : '#3B82F6'}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' }}>
        <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-bold text-sm`}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
}

// Confetti Component
function Confetti({ show }: { show: boolean }) {
  const confettiPieces = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <>
      {show && confettiPieces.map((i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </>
  );
}

function ConfettiPiece({ index }: { index: number }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 300;
    const randomRotate = Math.random() * 720;
    
    translateY.value = withTiming(600, { duration: 2000 });
    translateX.value = withTiming(randomX, { duration: 2000 });
    rotate.value = withTiming(randomRotate, { duration: 2000 });
    opacity.value = withDelay(1500, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const color = colors[index % colors.length];

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          top: 100,
          left: '50%',
          width: 10,
          height: 10,
          backgroundColor: color,
          borderRadius: 5,
        },
      ]}
    />
  );
}

// Separate component for enrolled course item
function EnrolledCourseItem({ 
  item, 
  onPress,
  isDark,
  index,
  isGridView,
  progress
}: { 
  item: Course; 
  onPress: () => void;
  isDark: boolean;
  index: number;
  isGridView: boolean;
  progress: number;
}) {
  const [imageError, setImageError] = useState(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (progress === 100) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scale.value = withSequence(
        withSpring(1.05),
        withSpring(0.95),
        withSpring(1)
      );
    }
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (isGridView) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        layout={Layout.springify()}
        className="w-[48%] mb-4"
      >
        <Animated.View style={animatedStyle}>
          <Pressable onPress={onPress}>
            <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm overflow-hidden`}>
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

              <View className="p-3">
                <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`} numberOfLines={2}>
                  {item.title}
                </Text>
                
                {/* Progress Bar */}
                <View className="mb-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Progress</Text>
                    <Text className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-xs font-semibold`}>{progress}%</Text>
                  </View>
                  <View className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                    <View 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                </View>

                <View className="bg-blue-500 px-3 py-1.5 rounded-full">
                  <Text className="text-white font-semibold text-xs text-center">Continue</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 100).springify()}
      layout={Layout.springify()}
    >
      <Animated.View style={animatedStyle}>
        <Pressable onPress={onPress}>
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl mb-4 shadow-sm overflow-hidden`}>
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
              
              <View className="absolute top-3 left-3 bg-green-500 px-3 py-1 rounded-full flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text className="text-white font-semibold text-xs ml-1">Enrolled</Text>
              </View>
            </View>

            <View className="p-4">
              <View className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} self-start px-3 py-1 rounded-full mb-2`}>
                <Text className={`${isDark ? 'text-blue-300' : 'text-blue-600'} text-xs font-semibold`}>
                  {item.category}
                </Text>
              </View>

              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`} numberOfLines={2}>
                {item.title}
              </Text>

              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-3`} numberOfLines={2}>
                {item.description}
              </Text>

              {/* Progress Bar */}
              <View className="mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>Course Progress</Text>
                  <Text className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-sm font-bold`}>{progress}%</Text>
                </View>
                <View className={`w-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <View 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>

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

                  <View className="bg-blue-500 px-4 py-2 rounded-full">
                    <Text className="text-white font-semibold text-xs">Continue</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default function EnrolledCourses() {
  const router = useRouter();
  const { courses, enrolledCourses, enrollmentTimestamps } = useCourseStore();
  const { isDark } = useTheme();
  const [isGridView, setIsGridView] = useState(() => {
    // Load saved view preference
    try {
      const saved = (global as any).enrolledViewMode;
      return saved === 'grid';
    } catch {
      return false;
    }
  });
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'title'>('recent');

  // Filter enrolled courses
  let enrolledCoursesList = courses.filter((course) =>
    enrolledCourses.includes(course.id)
  );

  // Mock progress data (in real app, this would come from backend)
  // Create stable progress map
  const progressMap: { [key: string]: number } = {};
  enrolledCoursesList.forEach((course, index) => {
    progressMap[course.id] = [45, 78, 100, 23, 67, 89, 12, 55][index % 8] || 45;
  });

  const getProgress = (courseId: string) => {
    return progressMap[courseId] || 45;
  };

  // Apply sorting
  if (sortBy === 'title') {
    enrolledCoursesList = [...enrolledCoursesList].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'progress') {
    enrolledCoursesList = [...enrolledCoursesList].sort((a, b) => getProgress(b.id) - getProgress(a.id));
  } else if (sortBy === 'recent') {
    // Sort by enrollment timestamp (most recent first)
    enrolledCoursesList = [...enrolledCoursesList].sort((a, b) => {
      const timeA = enrollmentTimestamps[a.id] || 0;
      const timeB = enrollmentTimestamps[b.id] || 0;
      return timeB - timeA; // Most recent first
    });
  }

  const toggleViewMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMode = !isGridView;
    setIsGridView(newMode);
    // Save preference
    (global as any).enrolledViewMode = newMode ? 'grid' : 'list';
  };

  const handleSort = (type: 'recent' | 'progress' | 'title') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(type);
    setShowSortModal(false);
  };

  const renderEnrolledItem = ({ item, index }: { item: Course; index: number }) => (
    <EnrolledCourseItem
      item={item}
      index={index}
      onPress={() => router.push(`/course/${item.id}`)}
      isDark={isDark}
      isGridView={isGridView}
      progress={getProgress(item.id)}
    />
  );

  return (
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
            My Courses
          </Text>
          
          {/* View Toggle */}
          {enrolledCoursesList.length > 0 && (
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
          {enrolledCoursesList.length} {enrolledCoursesList.length === 1 ? 'course' : 'courses'} enrolled
        </Text>
      </View>

      {/* Enrolled Courses List */}
      {enrolledCoursesList.length > 0 ? (
        <FlatList
          data={enrolledCoursesList}
          renderItem={renderEnrolledItem}
          keyExtractor={(item) => item.id}
          extraData={isGridView}
          key={isGridView ? 'grid' : 'list'}
          numColumns={isGridView ? 2 : 1}
          columnWrapperStyle={isGridView ? { justifyContent: 'space-between' } : undefined}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
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
              <Ionicons name="school-outline" size={48} color="#3B82F6" />
            </Animated.View>
            <Animated.Text 
              entering={FadeInDown.delay(300).springify()}
              className={`${isDark ? 'text-white' : 'text-gray-800'} text-xl font-bold mb-2`}
            >
              No Enrolled Courses
            </Animated.Text>
            <Animated.Text 
              entering={FadeInDown.delay(400).springify()}
              className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center mb-6`}
            >
              Start learning by enrolling in courses that interest you
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
              onPress={() => handleSort('progress')}
              className={`flex-row items-center justify-between p-4 rounded-2xl mb-3 ${
                sortBy === 'progress' ? 'bg-blue-500' : (isDark ? 'bg-gray-700' : 'bg-gray-100')
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name="trending-up-outline" 
                  size={24} 
                  color={sortBy === 'progress' ? 'white' : (isDark ? '#9CA3AF' : '#6B7280')} 
                />
                <Text className={`ml-3 text-lg font-semibold ${
                  sortBy === 'progress' ? 'text-white' : (isDark ? 'text-white' : 'text-gray-800')
                }`}>
                  Progress (High to Low)
                </Text>
              </View>
              {sortBy === 'progress' && <Ionicons name="checkmark" size={24} color="white" />}
            </Pressable>

            <Pressable
              onPress={() => handleSort('title')}
              className={`flex-row items-center justify-between p-4 rounded-2xl ${
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
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}
