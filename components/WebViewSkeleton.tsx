import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export const WebViewSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const bgColor = isDark ? 'bg-gray-700' : 'bg-gray-200';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-5`}>
      <View className={`${cardBg} rounded-3xl p-6 shadow-lg`}>
        {/* Header Skeleton */}
        <View className="items-center mb-6 pb-5 border-b border-gray-300">
          <Animated.View
            style={{ opacity }}
            className={`${bgColor} h-8 w-3/4 rounded-lg mb-3`}
          />
          <Animated.View
            style={{ opacity }}
            className={`${bgColor} h-6 w-24 rounded-full`}
          />
        </View>

        {/* Instructor Skeleton */}
        <View className={`flex-row items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-2xl mb-6`}>
          <Animated.View
            style={{ opacity }}
            className={`${bgColor} w-16 h-16 rounded-full mr-4`}
          />
          <View className="flex-1">
            <Animated.View
              style={{ opacity }}
              className={`${bgColor} h-4 w-32 rounded mb-2`}
            />
            <Animated.View
              style={{ opacity }}
              className={`${bgColor} h-3 w-24 rounded`}
            />
          </View>
        </View>

        {/* Stats Skeleton */}
        <View className="flex-row justify-around mb-6">
          {[1, 2, 3].map((i) => (
            <View key={i} className="items-center">
              <Animated.View
                style={{ opacity }}
                className={`${bgColor} w-16 h-16 rounded-full mb-2`}
              />
              <Animated.View
                style={{ opacity }}
                className={`${bgColor} h-4 w-12 rounded mb-1`}
              />
              <Animated.View
                style={{ opacity }}
                className={`${bgColor} h-3 w-16 rounded`}
              />
            </View>
          ))}
        </View>

        {/* Content Skeleton */}
        <View className="mb-6">
          <Animated.View
            style={{ opacity }}
            className={`${bgColor} h-6 w-40 rounded mb-3`}
          />
          <Animated.View
            style={{ opacity }}
            className={`${bgColor} h-4 w-full rounded mb-2`}
          />
          <Animated.View
            style={{ opacity }}
            className={`${bgColor} h-4 w-full rounded mb-2`}
          />
          <Animated.View
            style={{ opacity }}
            className={`${bgColor} h-4 w-3/4 rounded`}
          />
        </View>

        {/* Lessons Skeleton */}
        <View className="mb-6">
          <Animated.View
            style={{ opacity }}
            className={`${bgColor} h-6 w-48 rounded mb-3`}
          />
          {[1, 2, 3].map((i) => (
            <Animated.View
              key={i}
              style={{ opacity }}
              className={`${bgColor} h-16 w-full rounded-xl mb-2`}
            />
          ))}
        </View>

        {/* Price Skeleton */}
        <Animated.View
          style={{ opacity }}
          className={`${bgColor} h-20 w-full rounded-2xl`}
        />
      </View>
    </View>
  );
};
