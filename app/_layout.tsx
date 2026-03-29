import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { OfflineBanner } from "../components/OfflineBanner";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
import "../global.css";
import { notificationService } from "../services/notificationService";

function RootLayoutContent() {
  const { isDark } = useTheme();

  useEffect(() => {
    // Set Android navigation bar color based on theme
    if (Platform.OS === "android") {
      const setNavigationBar = async () => {
        try {
          // Check if NavigationBar module is available
          if (NavigationBar.setButtonStyleAsync) {
            // Set button style (light buttons on dark bg, dark buttons on light bg)
            await NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
          }
        } catch (error) {
          console.log("Navigation bar color not supported on this device");
        }
      };
      setNavigationBar();
    }
  }, [isDark]);

  useEffect(() => {
    // Initialize notifications
    const initNotifications = async () => {
      // Request permissions if not already requested
      const hasRequested = await notificationService.hasRequestedPermissions();
      if (!hasRequested) {
        await notificationService.requestPermissions();
      }

      // Update last opened timestamp
      await notificationService.updateLastOpened();

      // Cancel any existing inactivity reminders since user just opened app
      await notificationService.cancelInactivityReminder();

      // Schedule new inactivity reminder for 24 hours from now
      await notificationService.scheduleInactivityReminder();
    };

    initNotifications();

    // Set up notification listeners
    const notificationListener = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const responseListener = notificationService.addNotificationResponseListener(
      (response) => {
        console.log("Notification tapped:", response);
        // Handle notification tap - could navigate to specific screen
      }
    );

    // Cleanup listeners on unmount
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <>
      <OfflineBanner />
      <Stack 
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
