import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Pressable, TextInput, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

interface AnimatedSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  isLoading?: boolean;
  isDark: boolean;
}

export function AnimatedSearchBar({ value, onChangeText, isLoading, isDark }: AnimatedSearchBarProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isLoading) {
      rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [isLoading]);

  const iconRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleFocus = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText("");
  };

  return (
    <View className={`flex-row items-center ${
      isDark ? "bg-gray-700" : "bg-white"
    } rounded-xl px-3 py-2.5`}>
      <Animated.View style={iconRotationStyle}>
        <Ionicons
          name={isLoading ? "hourglass-outline" : "search"}
          size={18}
          color="#9CA3AF"
        />
      </Animated.View>
      <TextInput
        placeholder="Search courses..."
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        className={`flex-1 ml-2 text-sm ${isDark ? "text-white" : "text-gray-800"}`}
        placeholderTextColor="#9CA3AF"
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear}>
          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
        </Pressable>
      )}
    </View>
  );
}
