import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Dimensions, Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeInRight } from "react-native-reanimated";
import { Course } from "../types/course";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 48;
const CARD_SPACING = 16;
const SIDE_PADDING = 10;

interface HeroCarouselProps {
  courses: Course[];
  isDark: boolean;
}

export function HeroCarousel({ courses, isDark }: HeroCarouselProps) {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const currentIndex = useRef(0);

  const featuredCourses = courses.slice(0, 5);

  useEffect(() => {
    if (featuredCourses.length === 0) return;

    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % featuredCourses.length;
      scrollViewRef.current?.scrollTo({
        x: currentIndex.current * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredCourses.length]);

  if (featuredCourses.length === 0) return null;

  return (
    <Animated.View entering={FadeIn.duration(600)} className="mb-4">
      <View className="flex-row items-center justify-between px-6 mb-4 mt-4">
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Featured Courses
        </Text>
        <View className="bg-yellow-400 px-3 py-1.5 rounded-full">
          <Text className="text-yellow-900 font-bold text-xs">🔥 TRENDING</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
      >
        {featuredCourses.map((course, index) => (
          <Animated.View
            key={course.id}
            entering={FadeInRight.delay(index * 100).duration(600).springify()}
          >
            <Pressable
              onPress={() => router.push(`/course/${course.id}`)}
              style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}
            >
              <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl overflow-hidden shadow-xl`}>
                <View className="relative">
                  <Image
                    source={{ uri: course.thumbnail }}
                    style={{ width: '100%', height: 200 }}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    className="absolute inset-0"
                  />
                  <View className="absolute top-3 right-3 bg-red-500 px-3 py-1.5 rounded-full shadow-lg">
                    <Text className="text-white font-bold text-xs">🔥 HOT</Text>
                  </View>
                  <View className="absolute bottom-3 left-3 right-3">
                    <Text className="text-white font-bold text-xl mb-2" numberOfLines={2}>
                      {course.title}
                    </Text>
                    {course.instructor && (
                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: course.instructor.avatar }}
                          className="w-6 h-6 rounded-full mr-2 border-2 border-white/50"
                        />
                        <Text className="text-white/90 text-sm">
                          {course.instructor.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} px-3 py-1.5 rounded-full`}>
                      <Text className={`${isDark ? 'text-blue-300' : 'text-blue-600'} font-semibold text-xs`}>
                        {course.category}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-bold ml-1`}>
                        4.8
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}
