import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring
} from "react-native-reanimated";
import { useTheme } from "../../contexts/ThemeContext";
import { notificationService } from "../../services/notificationService";

const SETTINGS_KEY = "app_settings";

interface AppSettings {
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoDownload: boolean;
  dataUsage: boolean;
  offlineMode: boolean;
}

const defaultSettings: AppSettings = {
  notifications: true,
  emailNotifications: true,
  pushNotifications: true,
  autoDownload: false,
  dataUsage: true,
  offlineMode: false,
};

// Animated Switch Component
function AnimatedSwitch({
  value,
  onValueChange,
  disabled,
  color = "#3B82F6",
}: {
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
  color?: string;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(
      withSpring(0.9),
      withSpring(1)
    );
    onValueChange();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Switch
        value={value}
        onValueChange={handlePress}
        trackColor={{ false: "#D1D5DB", true: `${color}80` }}
        thumbColor={value ? color : "#F3F4F6"}
        disabled={disabled}
      />
    </Animated.View>
  );
}

// Animated Theme Toggle
function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  const rotation = useSharedValue(isDark ? 180 : 0);
  const scale = useSharedValue(1);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rotation.value = withSpring(isDark ? 0 : 180);
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
    onToggle();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ],
  }));

  return (
    <Pressable onPress={handleToggle}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isDark ? "moon" : "sunny"}
          size={24}
          color={isDark ? "#8B5CF6" : "#F59E0B"}
        />
      </Animated.View>
    </Pressable>
  );
}

export default function Settings() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const hasPermission = await notificationService.hasPermissions();
    setNotificationPermission(hasPermission);
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
      Alert.alert("Error", "Failed to save settings");
    }
  };

  const toggleSetting = (key: keyof AppSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    
    if (key === "notifications" && !settings[key]) {
      requestNotificationPermission();
    }
    
    saveSettings(newSettings);
  };

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestPermissions();
    setNotificationPermission(granted);
    
    if (!granted) {
      Alert.alert(
        "Permission Denied",
        "Please enable notifications in your device settings to receive updates.",
        [{ text: "OK" }]
      );
    }
  };

  const handleClearCache = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Clear Cache",
      "This will clear all cached data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", "Cache cleared successfully!");
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "⚠️ Reset Settings",
      "This will reset all settings to default. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            saveSettings(defaultSettings);
            Alert.alert("Success", "Settings reset to default!");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Text className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} pt-16 pb-6 px-6 shadow-md`}>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className={`${isDark ? 'bg-white/20' : 'bg-gray-100'} p-2 rounded-full mr-4`}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? 'white' : '#1F2937'} />
          </Pressable>
          <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-3xl font-bold`}>Settings</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Notifications Section */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-lg p-4 mb-6`}
          >
            <View className={`flex-row items-center mb-4 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="bg-blue-100 p-3 rounded-full mr-3">
                <Ionicons name="notifications-outline" size={24} color="#3B82F6" />
              </View>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-lg font-bold flex-1`}>
                Notifications
              </Text>
            </View>

            <View className={`flex-row items-center justify-between py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="flex-1">
                <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>All Notifications</Text>
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                  {notificationPermission ? "Enabled" : "Enable all notifications"}
                </Text>
              </View>
              <AnimatedSwitch
                value={settings.notifications}
                onValueChange={() => toggleSetting("notifications")}
                color="#3B82F6"
              />
            </View>

            <View className={`flex-row items-center justify-between py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="flex-1">
                <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>Email Notifications</Text>
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Receive updates via email</Text>
              </View>
              <AnimatedSwitch
                value={settings.emailNotifications}
                onValueChange={() => toggleSetting("emailNotifications")}
                disabled={!settings.notifications}
                color="#3B82F6"
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1">
                <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>Push Notifications</Text>
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Receive push notifications</Text>
              </View>
              <AnimatedSwitch
                value={settings.pushNotifications}
                onValueChange={() => toggleSetting("pushNotifications")}
                disabled={!settings.notifications}
                color="#3B82F6"
              />
            </View>
          </Animated.View>

          {/* Appearance Section */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-lg p-4 mb-6`}
          >
            <View className={`flex-row items-center mb-4 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="bg-purple-100 p-3 rounded-full mr-3">
                <Ionicons name="color-palette-outline" size={24} color="#8B5CF6" />
              </View>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-lg font-bold flex-1`}>
                Appearance
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1 flex-row items-center">
                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                <View className="ml-3 flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>
                    {isDark ? "Dark Mode" : "Light Mode"}
                  </Text>
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                    {isDark ? "Using dark theme" : "Using light theme"}
                  </Text>
                </View>
              </View>
              <AnimatedSwitch
                value={isDark}
                onValueChange={toggleTheme}
                color="#8B5CF6"
              />
            </View>
          </Animated.View>

          {/* Data & Storage Section */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-lg p-4 mb-6`}
          >
            <View className={`flex-row items-center mb-4 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="bg-green-100 p-3 rounded-full mr-3">
                <Ionicons name="server-outline" size={24} color="#10B981" />
              </View>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-lg font-bold flex-1`}>
                Data & Storage
              </Text>
            </View>

            <View className={`flex-row items-center justify-between py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="flex-1">
                <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>Auto Download</Text>
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Download course content automatically</Text>
              </View>
              <AnimatedSwitch
                value={settings.autoDownload}
                onValueChange={() => toggleSetting("autoDownload")}
                color="#10B981"
              />
            </View>

            <View className={`flex-row items-center justify-between py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="flex-1">
                <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>Reduce Data Usage</Text>
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Use less mobile data</Text>
              </View>
              <AnimatedSwitch
                value={settings.dataUsage}
                onValueChange={() => toggleSetting("dataUsage")}
                color="#10B981"
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1">
                <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>Offline Mode</Text>
                <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Access downloaded content offline</Text>
              </View>
              <AnimatedSwitch
                value={settings.offlineMode}
                onValueChange={() => toggleSetting("offlineMode")}
                color="#10B981"
              />
            </View>
          </Animated.View>

          {/* App Info Section */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-lg p-4 mb-6`}
          >
            <View className={`flex-row items-center mb-4 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <View className="bg-orange-100 p-3 rounded-full mr-3">
                <Ionicons name="information-circle-outline" size={24} color="#F97316" />
              </View>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-lg font-bold flex-1`}>
                App Information
              </Text>
            </View>

            <View className={`flex-row items-center justify-between py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>Version</Text>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>1.0.0</Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>Last Updated</Text>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </Animated.View>

          {/* Danger Zone */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} className="mb-8">
            <View className="flex-row items-center mb-3 px-2">
              <Ionicons name="warning" size={20} color="#EF4444" />
              <Text className="text-red-500 font-bold text-sm ml-2">DANGER ZONE</Text>
            </View>

            <Pressable
              onPress={handleClearCache}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm border-2 border-yellow-500/20`}
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-yellow-100 p-3 rounded-full mr-3">
                  <Ionicons name="trash-outline" size={24} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>Clear Cache</Text>
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Free up storage space</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </Pressable>

            <Pressable
              onPress={handleResetSettings}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 flex-row items-center justify-between shadow-sm border-2 border-red-500/20`}
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-red-100 p-3 rounded-full mr-3">
                  <Ionicons name="refresh-outline" size={24} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-semibold`}>Reset Settings</Text>
                  <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Restore default settings</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
