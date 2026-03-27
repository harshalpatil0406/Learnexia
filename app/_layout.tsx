import { Stack } from "expo-router";
import { useEffect } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import { notificationService } from "../services/notificationService";
import "../global.css";
import { OfflineBanner } from "@/components/OfflineBanner";

export default function RootLayout() {

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
    <ThemeProvider>
      <OfflineBanner />
      <Stack 
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}
