import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isDark: boolean;
}

export function SuccessModal({ visible, onClose, title, message, isDark }: SuccessModalProps) {
  const scale = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15 });
      checkmarkScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.2),
          withSpring(1)
        )
      );
      confettiOpacity.value = withSequence(
        withDelay(300, withTiming(1, { duration: 300 })),
        withDelay(1500, withTiming(0, { duration: 500 }))
      );
    } else {
      scale.value = 0;
      checkmarkScale.value = 0;
      confettiOpacity.value = 0;
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 items-center justify-center bg-black/50 px-6"
      >
        <Animated.View style={modalStyle} className="w-full max-w-sm">
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl overflow-hidden shadow-2xl`}>
            {/* Success Icon */}
            <View className="items-center pt-8 pb-4">
              <Animated.View style={checkmarkStyle}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="checkmark" size={48} color="white" />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Content */}
            <View className="px-6 pb-6">
              <Text className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                {title}
              </Text>
              <Text className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                {message}
              </Text>

              {/* Action Button */}
              <Pressable
                onPress={onClose}
                className="bg-blue-500 py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold text-lg">Continue Learning</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
