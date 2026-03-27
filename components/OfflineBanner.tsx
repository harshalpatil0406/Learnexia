import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Text, View, Platform } from "react-native";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export const OfflineBanner: React.FC = () => {
  const { isOffline } = useNetworkStatus();
  const [slideAnim] = React.useState(new Animated.Value(-200));
  const [pulseAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (isOffline) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
      ]).start();

      // Icon pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline]);

  const topPadding = Platform.OS === "ios" ? 50 : 30;

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 z-[9999]"
      style={{
        transform: [{ translateY: slideAnim }],
        elevation: 24,
      }}
    >
      {/* Professional Dark Background with Accent Border */}
      <View className="bg-slate-800 px-5 pb-[18px] shadow-2xl">
        {/* Accent Border Top */}
        <View className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500" />
        
        <View style={{ paddingTop: topPadding }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              {/* Icon Container */}
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <View className="bg-slate-700 rounded-xl p-3 border border-slate-600 relative">
                  <Ionicons name="wifi-outline" size={24} color="#F59E0B" />
                  <View className="absolute top-2 right-2 bg-slate-800 rounded-full">
                    <Ionicons name="close" size={14} color="#F59E0B" />
                  </View>
                </View>
              </Animated.View>

              {/* Text Content */}
              <View className="ml-4 flex-1">
                <Text className="text-white text-[17px] font-bold tracking-wide mb-0.5">
                  No Internet Connection
                </Text>
                <Text className="text-slate-400 text-[13px] font-medium tracking-tight">
                  Attempting to reconnect...
                </Text>
              </View>
            </View>

            {/* Status Indicator */}
            <View className="flex-row items-center bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-600">
              <View className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
              <Text className="text-amber-500 text-[11px] font-bold uppercase tracking-wider">
                Offline
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};