import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { useTheme } from "../../contexts/ThemeContext";
import { getErrorMessage } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login, loading } = useAuthStore();
  const router = useRouter();
  const { isDark } = useTheme();

  const buttonScale = useSharedValue(1);
  const emailShake = useSharedValue(0);
  const passwordShake = useSharedValue(0);

  const handleLogin = async () => {
    setErrorMessage(""); // Clear previous errors
    
    if (!email || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (!email) {
        emailShake.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
      if (!password) {
        passwordShake.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
      setErrorMessage("All fields are required");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await login(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(getErrorMessage(error));
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const emailAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: emailShake.value }],
  }));

  const passwordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: passwordShake.value }],
  }));

  const handleButtonPress = () => {
    buttonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    handleLogin();
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Header Section */}
          <Animated.View 
            entering={FadeInDown.duration(600)}
            className="items-center mb-8 mt-8"
          >
            {/* App Logo */}
            <View className="relative mb-6">
              <Image 
                source={require('@/assets/images/logo.png')}
                style={{ width: 96, height: 96, borderRadius: 24 }}
                resizeMode="contain"
              />
            </View>

            <Text className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
              Welcome Back!
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-base text-center px-8`}>
              Continue your learning journey with Learnexia
            </Text>
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(600)}
            className="flex-row justify-between mb-8"
          >
            <View className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 mr-2 shadow-sm`}>
              <View className="flex-row items-center">
                <View className="bg-blue-100 p-2 rounded-full mr-2">
                  <Ionicons name="book-outline" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>500+</Text>
                  <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Courses</Text>
                </View>
              </View>
            </View>
            <View className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 ml-2 shadow-sm`}>
              <View className="flex-row items-center">
                <View className="bg-purple-100 p-2 rounded-full mr-2">
                  <Ionicons name="people-outline" size={20} color="#8B5CF6" />
                </View>
                <View>
                  <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>10K+</Text>
                  <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Students</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Form Section */}
          <Animated.View 
            entering={FadeInDown.delay(400).duration(600)}
            className="space-y-4"
          >
            {/* Error Message */}
            {errorMessage ? (
              <Animated.View 
                entering={FadeInDown.duration(300)}
                className="flex-row items-center justify-center mb-2"
              >
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text className="text-red-500 ml-2 text-sm font-medium">
                  {errorMessage}
                </Text>
              </Animated.View>
            ) : null}

            {/* Email Input */}
            <Animated.View style={emailAnimatedStyle}>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-semibold mb-2 ml-1`}>
                Email Address
              </Text>
              <View className={`flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'} ${
                emailFocused ? 'border-2 border-blue-500' : 'border border-gray-200'
              } rounded-2xl px-4 shadow-sm`}>
                <Ionicons 
                  name="mail" 
                  size={20} 
                  color={emailFocused ? '#3B82F6' : '#9CA3AF'} 
                />
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => {
                    setEmailFocused(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onBlur={() => setEmailFocused(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className={`flex-1 p-4 ${isDark ? 'text-white' : 'text-gray-800'}`}
                  placeholderTextColor="#9CA3AF"
                />
                {email.length > 0 && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
            </Animated.View>

            {/* Password Input */}
            <Animated.View style={passwordAnimatedStyle}>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-semibold mb-2 ml-1 mt-3`}>
                Password
              </Text>
              <View className={`flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'} ${
                passwordFocused ? 'border-2 border-blue-500' : 'border border-gray-200'
              } rounded-2xl px-4 shadow-sm`}>
                <Ionicons 
                  name="lock-closed" 
                  size={20} 
                  color={passwordFocused ? '#3B82F6' : '#9CA3AF'} 
                />
                <TextInput
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => {
                    setPasswordFocused(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onBlur={() => setPasswordFocused(false)}
                  className={`flex-1 p-4 ${isDark ? 'text-white' : 'text-gray-800'}`}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  onPress={() => {
                    setShowPassword(!showPassword);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-end mt-2">
                <Pressable onPress={() => router.push("/auth/forgot-password")}>
                  <Text className="text-blue-500 font-medium text-sm">Forgot Password?</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Login Button */}
            <AnimatedPressable
              onPress={handleButtonPress}
              disabled={loading}
              style={buttonAnimatedStyle}
              className="mt-6 rounded-2xl overflow-hidden shadow-lg w-full"
            >
              <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 16, paddingHorizontal: 24 }}
                className={loading ? 'opacity-70' : ''}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View className="flex-row items-center justify-center">
                    <Text className="text-white text-center font-bold text-lg mr-2">
                      Sign In
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                )}
              </LinearGradient>
            </AnimatedPressable>
          </Animated.View>

          {/* Divider */}
          <Animated.View 
            entering={FadeInDown.delay(600).duration(600)}
            className="flex-row items-center my-8"
          >
            <View className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
            <Text className={`mx-4 ${isDark ? 'text-gray-500' : 'text-gray-500'} font-medium`}>
              New to Learnexia?
            </Text>
            <View className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View entering={FadeInDown.delay(800).duration(600)}>
            <Pressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/auth/register");
              }}
              className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 p-4 rounded-2xl`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="person-add" size={20} color="#3B82F6" />
                <Text className="text-blue-500 font-bold text-lg ml-2">
                  Create Account
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View 
            entering={FadeInDown.delay(1000).duration(600)}
            className="mt-8"
          >
            <Text className={`text-center ${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs`}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Animated.View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
