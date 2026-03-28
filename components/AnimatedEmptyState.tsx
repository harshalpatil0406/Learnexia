import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface AnimatedEmptyStateProps {
  isDark: boolean;
}

export function AnimatedEmptyState({ isDark }: AnimatedEmptyStateProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withSpring(1.1),
        withSpring(1)
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View className="items-center justify-center py-20">
      <Animated.View style={animatedStyle}>
        <Ionicons
          name="search-outline"
          size={64}
          color={isDark ? "#4B5563" : "#D1D5DB"}
        />
      </Animated.View>
      <Text className={`${isDark ? "text-gray-400" : "text-gray-500"} text-lg mt-4 font-semibold`}>
        No courses found
      </Text>
      <Text className={`${isDark ? "text-gray-500" : "text-gray-400"} text-sm mt-2`}>
        Try adjusting your search
      </Text>
    </View>
  );
}
