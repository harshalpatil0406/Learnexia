import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CategoryPillsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isDark: boolean;
}

export function CategoryPills({ categories, selectedCategory, onSelectCategory, isDark }: CategoryPillsProps) {
  const handlePress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectCategory(category);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 8 }}
      className="mb-4"
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <CategoryPill
            key={category}
            category={category}
            isSelected={isSelected}
            onPress={() => handlePress(category)}
            isDark={isDark}
          />
        );
      })}
    </ScrollView>
  );
}

function CategoryPill({ category, isSelected, onPress, isDark }: {
  category: string;
  isSelected: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <View>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        className={`px-5 py-2.5 rounded-full mr-3 ${
          isSelected
            ? "bg-blue-500"
            : isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        <Text
          className={`font-semibold text-sm ${
            isSelected ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {category}
        </Text>
      </AnimatedPressable>
    </View>
  );
}
