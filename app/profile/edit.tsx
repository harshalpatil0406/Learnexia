import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../store/authStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function EditProfile() {
  const router = useRouter();
  const { user, uploadAvatar, updateUser, loading } = useAuthStore();
  const { isDark } = useTheme();
  
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Validation states
  const [usernameValid, setUsernameValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  
  // Focus states
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  // Animation values
  const saveButtonScale = useSharedValue(1);
  const usernameShake = useSharedValue(0);
  const emailShake = useSharedValue(0);

  const [imageError, setImageError] = useState(false);

  const avatarUrl = localImage || user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&size=200&background=3B82F6&color=fff`;
  const hasAvatar = !!(localImage || user?.avatar?.url);

  // Reset image error when avatar changes
  useEffect(() => {
    setImageError(false);
  }, [localImage, user?.avatar?.url]);

  const hasUnsavedChanges = localImage !== null || username !== user?.username || email !== user?.email;

  useEffect(() => {
    // Validate username
    if (username.trim().length >= 3) {
      setUsernameValid(true);
      setUsernameError("");
    } else if (username.trim().length > 0) {
      setUsernameValid(false);
      setUsernameError("Username must be at least 3 characters");
    } else {
      setUsernameValid(false);
      setUsernameError("");
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setEmailValid(true);
      setEmailError("");
    } else if (email.trim().length > 0) {
      setEmailValid(false);
      setEmailError("Please enter a valid email");
    } else {
      setEmailValid(false);
      setEmailError("");
    }
  }, [username, email]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera roll permissions to update your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setLocalImage(imageUri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    // Validate
    if (!usernameValid) {
      usernameShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!emailValid) {
      emailShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    saveButtonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1.05),
      withSpring(1)
    );

    setSaving(true);

    try {
      if (localImage) {
        await uploadAvatar(localImage);
        setLocalImage(null); // Clear local image after successful upload
      }

      if (username !== user?.username || email !== user?.email) {
        await updateUser({ username, email });
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccessModal(true);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowUnsavedModal(true);
    } else {
      router.back();
    }
  };

  const saveButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  const usernameShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: usernameShake.value }],
  }));

  const emailShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: emailShake.value }],
  }));

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} pt-16 pb-6 px-6 shadow-md`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Pressable
              onPress={handleCancel}
              className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full mr-4`}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? '#F3F4F6' : '#1F2937'} />
            </Pressable>
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-2xl font-bold`}>
              Edit Profile
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 mt-4">
          {/* Profile Picture Section */}
          <Animated.View
            entering={FadeInDown.duration(600)}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-lg p-6 mb-6`}
          >
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-lg font-bold mb-4`}>
              Profile Picture
            </Text>
            
            <View className="items-center">
              <View style={{ position: 'relative' }}>
                {hasAvatar && !imageError ? (
                  <Animated.Image
                    key={avatarUrl}
                    entering={FadeInDown.springify()}
                    source={{ uri: avatarUrl }}
                    className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <View className={`w-32 h-32 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'} items-center justify-center border-4 ${isDark ? 'border-gray-600' : 'border-gray-400'} shadow-lg`}>
                    <Ionicons name="person" size={64} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </View>
                )}

                <TouchableOpacity 
                  onPress={pickImage}
                  className="bg-blue-500 p-3 rounded-full shadow-lg"
                  style={{ position: 'absolute', bottom: 0, right: 0 }}
                >
                  <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mt-4 text-center`}>
                Tap the camera icon to change your profile picture
              </Text>
            </View>
          </Animated.View>

          {/* Personal Information Section */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-lg p-6 mb-6`}
          >
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-lg font-bold mb-4`}>
              Personal Information
            </Text>

            {/* Username Field with Floating Label */}
            <Animated.View style={usernameShakeStyle} className="mb-4">
              <FloatingLabelInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                icon="person-outline"
                placeholder="Enter username"
                isDark={isDark}
                focused={usernameFocused}
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => setUsernameFocused(false)}
                valid={usernameValid && username.length > 0}
                error={usernameError}
              />
            </Animated.View>

            {/* Email Field with Floating Label */}
            <Animated.View style={emailShakeStyle} className="mb-4">
              <FloatingLabelInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                placeholder="Enter email"
                isDark={isDark}
                focused={emailFocused}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                valid={emailValid && email.length > 0}
                error={emailError}
                keyboardType="email-address"
                editable={false}
              />
            </Animated.View>

            {/* Role Field (Read-only) */}
            <View>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mb-2`}>Role</Text>
              <View className={`flex-row items-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl px-4 py-3`}>
                <Ionicons name="shield-checkmark-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text className={`flex-1 ml-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.role || "Student"}
                </Text>
                <View className={`${isDark ? 'bg-blue-900' : 'bg-blue-100'} px-3 py-1 rounded-full`}>
                  <Text className={`${isDark ? 'text-blue-300' : 'text-blue-600'} text-xs font-semibold`}>Read-only</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)} className="mb-8">
            {/* Save Button */}
            <AnimatedPressable
              onPress={handleSave}
              disabled={saving || loading || !usernameValid || !emailValid}
              style={saveButtonStyle}
              className={`rounded-2xl p-4 mb-3 ${
                saving || loading || !usernameValid || !emailValid ? "bg-blue-400" : "bg-blue-500"
              }`}
            >
              {saving ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="white" />
                  <Text className="text-white font-bold text-lg ml-2">Saving...</Text>
                </View>
              ) : (
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
                </View>
              )}
            </AnimatedPressable>
          </Animated.View>
        </View>
      </KeyboardAwareScrollView>

      {/* Unsaved Changes Modal */}
      <Modal visible={showUnsavedModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <Animated.View
            entering={FadeInDown.springify()}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6`}
          >
            <View className="items-center mb-6">
              <View className="bg-orange-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Ionicons name="warning" size={32} color="#F97316" />
              </View>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                Unsaved Changes
              </Text>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                You have unsaved changes. Are you sure you want to discard them?
              </Text>
            </View>

            <Pressable
              onPress={() => {
                setShowUnsavedModal(false);
                router.back();
              }}
              className="bg-red-500 rounded-2xl p-4 mb-3"
            >
              <Text className="text-white font-bold text-center text-lg">Discard Changes</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowUnsavedModal(false)}
              className={`${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-2xl p-4 mb-10`}
            >
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-bold text-center text-lg`}>
                Keep Editing
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <Animated.View
            entering={FadeInDown.springify()}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 w-full max-w-sm`}
          >
            <View className="items-center">
              <View className="bg-green-100 w-20 h-20 rounded-full items-center justify-center mb-6">
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-3 text-center`}>
                Success!
              </Text>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center mb-8`}>
                Your profile has been updated successfully
              </Text>

              <Pressable
                onPress={() => {
                  setShowSuccessModal(false);
                  router.back();
                }}
                className="bg-green-500 rounded-2xl p-4 w-full"
              >
                <Text className="text-white font-bold text-center text-lg">Done</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// Floating Label Input Component
function FloatingLabelInput({ label, value, onChangeText, icon, placeholder, isDark, focused, onFocus, onBlur, valid, error, keyboardType, editable = true }: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: any;
  placeholder: string;
  isDark: boolean;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  valid: boolean;
  error: string;
  keyboardType?: any;
  editable?: boolean;
}) {
  const borderColor = useSharedValue(0);

  useEffect(() => {
    borderColor.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused]);

  const borderStyle = useAnimatedStyle(() => {
    const color = focused ? '#3B82F6' : (isDark ? '#4B5563' : '#E5E7EB');
    return {
      borderColor: color,
      shadowOpacity: borderColor.value * 0.3,
      shadowRadius: borderColor.value * 8,
      shadowColor: '#3B82F6',
    };
  });

  return (
    <View>
      {/* Static Label Above Input */}
      <Text className={`mb-2 ml-1 ${focused ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-gray-400' : 'text-gray-600')} font-medium text-sm`}>
        {label}
      </Text>
      
      <Animated.View
        style={[borderStyle, { height: 56 }]}
        className={`flex-row items-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl px-4 border-2`}
      >
        <Ionicons name={icon} size={20} color={focused ? '#3B82F6' : (isDark ? '#9CA3AF' : '#6B7280')} />
        <AnimatedTextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`flex-1 ml-3 ${isDark ? 'text-white' : 'text-gray-800'}`}
          style={{ 
            fontSize: 16,
            lineHeight: 20,
            paddingTop: 0,
            paddingBottom: 0,
            margin: 0,
            includeFontPadding: false,
          }}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          autoCapitalize="none"
          editable={editable}
        />
        {valid && (
          <Animated.View entering={FadeInDown.springify()}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </Animated.View>
        )}
      </Animated.View>
      {error.length > 0 && (
        <Animated.Text
          entering={FadeInDown.duration(200)}
          className="text-red-500 text-xs mt-1 ml-4"
        >
          {error}
        </Animated.Text>
      )}
    </View>
  );
}

