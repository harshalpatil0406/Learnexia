import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../store/authStore";
import { useCourseStore } from "../../store/courseStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Profile() {
  const { user, logout, uploadAvatar, loading } = useAuthStore();
  const { bookmarkedCourses, enrolledCourses } = useCourseStore();
  const { isDark } = useTheme();
  const router = useRouter();
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Animation values
  const avatarScale = useSharedValue(1);

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace("/auth/login");
  };

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
      
      try {
        await uploadAvatar(imageUri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Profile picture updated successfully!");
      } catch (error: any) {
        setLocalImage(null);
        Alert.alert("Error", error?.message || "Failed to update profile picture");
      }
    }
  };

  const handleImageUpdate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Update Profile Picture",
      "Choose an option",
      [
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleAvatarPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAvatarModal(true);
  };

  const avatarUrl = localImage || user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&size=200&background=3B82F6&color=fff`;

  // Reset image error when user avatar changes
  useEffect(() => {
    if (user?.avatar?.url) {
      setImageError(false);
    }
  }, [user?.avatar?.url]);

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Fixed Header */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} pt-16 pb-6 px-6 shadow-md`}>
        <View className="flex-row justify-between items-center">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Profile</Text>
          <TouchableOpacity 
            onPress={handleLogout}
            className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}
          >
            <Ionicons name="log-out-outline" size={24} color={isDark ? '#F3F4F6' : '#1F2937'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

      <View className="px-6 py-6">
        {/* Profile Section */}
        <Animated.View
          entering={FadeInDown.duration(600)}
          className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-6 shadow-sm`}
        >
          <View className="flex-row items-center mb-6">
            {/* Avatar */}
            <Pressable onPress={handleAvatarPress}>
              <Animated.View style={avatarAnimatedStyle}>
                {loading ? (
                  <View className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} items-center justify-center`}>
                    <ActivityIndicator size="small" color="#3B82F6" />
                  </View>
                ) : imageError || !user?.avatar?.url ? (
                  <View className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'} items-center justify-center`}>
                    <Ionicons name="person" size={40} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </View>
                ) : (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-20 h-20 rounded-full"
                    onError={() => setImageError(true)}
                  />
                )}
                <TouchableOpacity 
                  onPress={handleImageUpdate}
                  className="bg-blue-500 p-2 rounded-full absolute -bottom-1 -right-1"
                  disabled={loading}
                >
                  <Ionicons name="camera" size={14} color="white" />
                </TouchableOpacity>
              </Animated.View>
            </Pressable>

            {/* User Info */}
            <View className="flex-1 ml-4">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-1`}>
                {user?.username || "User"}
              </Text>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mb-2`}>
                {user?.email || "user@example.com"}
              </Text>
              <View className="bg-blue-500 px-3 py-1 rounded-full self-start">
                <Text className="text-white font-semibold text-xs">
                  {user?.role || "Student"}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-around pt-6 border-t" style={{ borderTopColor: isDark ? '#374151' : '#F3F4F6' }}>
            <StatItem
              value={bookmarkedCourses.length}
              label="Bookmarks"
              icon="bookmark"
              color="#3B82F6"
              isDark={isDark}
              delay={200}
            />
            <StatItem
              value={enrolledCourses.length}
              label="Enrolled"
              icon="school"
              color="#10B981"
              isDark={isDark}
              delay={300}
            />
            <StatItem
              value={`${enrolledCourses.length > 0 ? Math.round((enrolledCourses.length / 20) * 100) : 0}%`}
              label="Progress"
              icon="trending-up"
              color="#8B5CF6"
              isDark={isDark}
              delay={400}
            />
          </View>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(600)}
          className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl overflow-hidden shadow-sm mb-6`}
        >
          <MenuItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your information"
            onPress={() => router.push("/profile/edit")}
            isDark={isDark}
            delay={600}
          />
          <MenuItem
            icon="school-outline"
            title="My Courses"
            subtitle={`${enrolledCourses.length} enrolled`}
            onPress={() => router.push("/profile/enrolled")}
            isDark={isDark}
            delay={700}
            badge={enrolledCourses.length}
          />
          <MenuItem
            icon="bookmark-outline"
            title="My Bookmarks"
            subtitle={`${bookmarkedCourses.length} saved`}
            onPress={() => router.push("/profile/bookmarks")}
            isDark={isDark}
            delay={800}
            badge={bookmarkedCourses.length}
          />
          <MenuItem
            icon="settings-outline"
            title="Settings"
            subtitle="App preferences"
            onPress={() => router.push("/profile/settings")}
            isDark={isDark}
            delay={900}
          />
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get assistance"
            onPress={() => {}}
            isDark={isDark}
            delay={1000}
            isLast
          />
        </Animated.View>

        {/* Logout Button */}
        <AnimatedPressable
          entering={FadeInDown.delay(1100).duration(600)}
          onPress={handleLogout}
          className={`${isDark ? 'bg-red-900/20' : 'bg-red-50'} rounded-2xl p-4 flex-row items-center justify-center mb-8`}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-semibold text-base ml-2">Logout</Text>
        </AnimatedPressable>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <Animated.View
            entering={FadeInDown.springify()}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6`}
          >
            <View className="items-center mb-6">
              <View className="bg-red-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                <Ionicons name="log-out-outline" size={32} color="#EF4444" />
              </View>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                Logout
              </Text>
              <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                Are you sure you want to logout?
              </Text>
            </View>

            <Pressable
              onPress={confirmLogout}
              className="bg-red-500 rounded-2xl p-4 mb-3"
            >
              <Text className="text-white font-bold text-center text-lg">Logout</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowLogoutModal(false)}
              className={`${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-2xl p-4`}
            >
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-bold text-center text-lg`}>
                Cancel
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {/* Avatar Zoom Modal */}
      <Modal visible={showAvatarModal} transparent animationType="fade">
        <Pressable
          onPress={() => setShowAvatarModal(false)}
          className="flex-1 bg-black/90 items-center justify-center"
        >
          <Animated.Image
            entering={FadeInDown.springify()}
            source={{ uri: avatarUrl }}
            style={{ width: 300, height: 300, borderRadius: 150 }}
          />
        </Pressable>
      </Modal>
      </ScrollView>
    </View>
  );
}

// StatItem Component
function StatItem({ value, label, icon, color, isDark, delay }: {
  value: number | string;
  label: string;
  icon: any;
  color: string;
  isDark: boolean;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(600)} className="items-center">
      <Ionicons name={icon} size={24} color={color} className="mb-2" />
      <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</Text>
      <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs mt-1`}>{label}</Text>
    </Animated.View>
  );
}

// MenuItem Component
function MenuItem({ icon, title, subtitle, onPress, isDark, delay, badge, isLast }: {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
  isDark: boolean;
  delay: number;
  badge?: number;
  isLast?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInRight.delay(delay).duration(600)}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Animated.View
          style={animatedStyle}
          className={`flex-row items-center p-4 ${!isLast ? `border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}` : ''}`}
        >
          <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-2xl mr-4`}>
            <Ionicons name={icon} size={22} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </View>
          <View className="flex-1">
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold text-base`}>{title}</Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mt-0.5`}>{subtitle}</Text>
          </View>
          <View className="flex-row items-center">
            {badge !== undefined && badge > 0 && (
              <View className="bg-blue-500 px-2.5 py-1 rounded-full mr-2">
                <Text className="text-white font-bold text-xs">{badge}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}
