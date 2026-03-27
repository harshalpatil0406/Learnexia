import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { notificationService } from "@/services/notificationService";

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
    
    // If turning on notifications, request permission
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
    Alert.alert(
      "Clear Cache",
      "This will clear all cached data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            // In a real app, you would clear actual cache here
            Alert.alert("Success", "Cache cleared successfully!");
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "This will reset all settings to default. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
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

  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-100';

  return (
    <View className={`flex-1 ${bgColor}`}>
      {/* Header */}
      <View className="bg-blue-500 pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="bg-white/20 p-2 rounded-full mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-3xl font-bold">Settings</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Notifications Section */}
          <View className={`${cardBg} rounded-3xl shadow-lg p-4 mb-6`}>
            <View className={`flex-row items-center mb-4 pb-4 ${borderColor} border-b`}>
              <View className="bg-blue-50 p-3 rounded-full mr-3">
                <Ionicons name="notifications-outline" size={24} color="#3B82F6" />
              </View>
              <Text className={`${textColor} text-lg font-bold flex-1`}>
                Notifications
              </Text>
            </View>

            {/* All Notifications */}
            <View className={`flex-row items-center justify-between py-3 ${borderColor} border-b`}>
              <View className="flex-1">
                <Text className={`${textColor} font-semibold`}>All Notifications</Text>
                <Text className={`${textSecondary} text-sm`}>
                  {notificationPermission ? "Enabled" : "Enable all notifications"}
                </Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={() => toggleSetting("notifications")}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={settings.notifications ? "#3B82F6" : "#F3F4F6"}
              />
            </View>

            {/* Email Notifications */}
            <View className={`flex-row items-center justify-between py-3 ${borderColor} border-b`}>
              <View className="flex-1">
                <Text className={`${textColor} font-semibold`}>Email Notifications</Text>
                <Text className={`${textSecondary} text-sm`}>Receive updates via email</Text>
              </View>
              <Switch
                value={settings.emailNotifications}
                onValueChange={() => toggleSetting("emailNotifications")}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={settings.emailNotifications ? "#3B82F6" : "#F3F4F6"}
                disabled={!settings.notifications}
              />
            </View>

            {/* Push Notifications */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1">
                <Text className={`${textColor} font-semibold`}>Push Notifications</Text>
                <Text className={`${textSecondary} text-sm`}>Receive push notifications</Text>
              </View>
              <Switch
                value={settings.pushNotifications}
                onValueChange={() => toggleSetting("pushNotifications")}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={settings.pushNotifications ? "#3B82F6" : "#F3F4F6"}
                disabled={!settings.notifications}
              />
            </View>
          </View>

          {/* Appearance Section */}
          <View className={`${cardBg} rounded-3xl shadow-lg p-4 mb-6`}>
            <View className={`flex-row items-center mb-4 pb-4 ${borderColor} border-b`}>
              <View className="bg-purple-50 p-3 rounded-full mr-3">
                <Ionicons name="color-palette-outline" size={24} color="#8B5CF6" />
              </View>
              <Text className={`${textColor} text-lg font-bold flex-1`}>
                Appearance
              </Text>
            </View>

            {/* Dark Mode */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1">
                <Text className={`${textColor} font-semibold`}>Dark Mode</Text>
                <Text className={`${textSecondary} text-sm`}>Use dark theme</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: "#D1D5DB", true: "#C4B5FD" }}
                thumbColor={isDark ? "#8B5CF6" : "#F3F4F6"}
              />
            </View>
          </View>

          {/* Data & Storage Section */}
          <View className={`${cardBg} rounded-3xl shadow-lg p-4 mb-6`}>
            <View className={`flex-row items-center mb-4 pb-4 ${borderColor} border-b`}>
              <View className="bg-green-50 p-3 rounded-full mr-3">
                <Ionicons name="server-outline" size={24} color="#10B981" />
              </View>
              <Text className={`${textColor} text-lg font-bold flex-1`}>
                Data & Storage
              </Text>
            </View>

            {/* Auto Download */}
            <View className={`flex-row items-center justify-between py-3 ${borderColor} border-b`}>
              <View className="flex-1">
                <Text className={`${textColor} font-semibold`}>Auto Download</Text>
                <Text className={`${textSecondary} text-sm`}>Download course content automatically</Text>
              </View>
              <Switch
                value={settings.autoDownload}
                onValueChange={() => toggleSetting("autoDownload")}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={settings.autoDownload ? "#10B981" : "#F3F4F6"}
              />
            </View>

            {/* Data Usage */}
            <View className={`flex-row items-center justify-between py-3 ${borderColor} border-b`}>
              <View className="flex-1">
                <Text className={`${textColor} font-semibold`}>Reduce Data Usage</Text>
                <Text className={`${textSecondary} text-sm`}>Use less mobile data</Text>
              </View>
              <Switch
                value={settings.dataUsage}
                onValueChange={() => toggleSetting("dataUsage")}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={settings.dataUsage ? "#10B981" : "#F3F4F6"}
              />
            </View>

            {/* Offline Mode */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1">
                <Text className={`${textColor} font-semibold`}>Offline Mode</Text>
                <Text className={`${textSecondary} text-sm`}>Access downloaded content offline</Text>
              </View>
              <Switch
                value={settings.offlineMode}
                onValueChange={() => toggleSetting("offlineMode")}
                trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
                thumbColor={settings.offlineMode ? "#10B981" : "#F3F4F6"}
              />
            </View>
          </View>

          {/* App Info Section */}
          <View className={`${cardBg} rounded-3xl shadow-lg p-4 mb-6`}>
            <View className={`flex-row items-center mb-4 pb-4 ${borderColor} border-b`}>
              <View className="bg-orange-50 p-3 rounded-full mr-3">
                <Ionicons name="information-circle-outline" size={24} color="#F97316" />
              </View>
              <Text className={`${textColor} text-lg font-bold flex-1`}>
                App Information
              </Text>
            </View>

            <View className={`flex-row items-center justify-between py-3 ${borderColor} border-b`}>
              <Text className={textSecondary}>Version</Text>
              <Text className={`${textColor} font-semibold`}>1.0.0</Text>
            </View>

            <View className={`flex-row items-center justify-between py-3 ${borderColor} border-b`}>
              <Text className={textSecondary}>Build Number</Text>
              <Text className={`${textColor} font-semibold`}>100</Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <Text className={textSecondary}>Last Updated</Text>
              <Text className={`${textColor} font-semibold`}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mb-8">
            {/* Clear Cache */}
            <Pressable
              onPress={handleClearCache}
              className={`${cardBg} rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm`}
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-yellow-50 p-3 rounded-full mr-3">
                  <Ionicons name="trash-outline" size={24} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-semibold`}>Clear Cache</Text>
                  <Text className={`${textSecondary} text-sm`}>Free up storage space</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </Pressable>

            {/* Reset Settings */}
            <Pressable
              onPress={handleResetSettings}
              className={`${cardBg} rounded-2xl p-4 flex-row items-center justify-between shadow-sm`}
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-red-50 p-3 rounded-full mr-3">
                  <Ionicons name="refresh-outline" size={24} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-semibold`}>Reset Settings</Text>
                  <Text className={`${textSecondary} text-sm`}>Restore default settings</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
