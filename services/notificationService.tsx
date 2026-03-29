import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const LAST_OPENED_KEY = "last_opened_timestamp";
const NOTIFICATION_PERMISSION_KEY = "notification_permission_requested";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Allow milestone notifications (bookmarks) to show even when app is open
    const notificationType = notification.request.content.data?.type;
    const isMilestone = notificationType === 'bookmark_milestone';
    
    return {
      shouldShowBanner: isMilestone, // Show banner for milestones only
      shouldShowList: isMilestone, // Add to list for milestones only
      shouldPlaySound: isMilestone, // Play sound for milestones only
      shouldSetBadge: false, // Don't update badge when app is open
    };
  },
});

export const notificationService = {
  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permission not granted");
        return false;
      }

      // Mark that we've requested permissions
      await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true");

      // Set up notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#3B82F6",
        });
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  },

  // Check if permissions have been requested before
  async hasRequestedPermissions(): Promise<boolean> {
    try {
      const requested = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_KEY);
      return requested === "true";
    } catch (error) {
      return false;
    }
  },

  // Check if permissions are granted
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch (error) {
      return false;
    }
  },

  // Show notification when user bookmarks 5+ courses
  async showBookmarkMilestoneNotification(bookmarkCount: number): Promise<void> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        console.log("No notification permission");
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎉 Bookmark Milestone!",
          body: `You've bookmarked ${bookmarkCount} courses! Keep exploring and learning.`,
          data: { type: "bookmark_milestone", count: bookmarkCount },
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error("Error showing bookmark notification:", error);
    }
  },

  // Schedule reminder notification for 24 hours later
  async scheduleInactivityReminder(): Promise<void> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        console.log("No notification permission");
        return;
      }

      // Cancel any existing reminders
      await this.cancelInactivityReminder();

      // Schedule notification for 24 hours from now
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "📚 Continue Your Learning Journey",
          body: "You haven't checked your courses today. Come back and keep learning!",
          data: { type: "inactivity_reminder" },
          sound: true,
        },
        trigger: {
          seconds: 24 * 60 * 60, // 24 hours
          channelId: "default",
        },
        identifier: "inactivity_reminder",
      });

      console.log("Inactivity reminder scheduled for 24 hours from now");
    } catch (error) {
      console.error("Error scheduling inactivity reminder:", error);
    }
  },

  // Cancel inactivity reminder
  async cancelInactivityReminder(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync("inactivity_reminder");
    } catch (error) {
      console.error("Error canceling inactivity reminder:", error);
    }
  },

  // Update last opened timestamp
  async updateLastOpened(): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      await AsyncStorage.setItem(LAST_OPENED_KEY, timestamp);
    } catch (error) {
      console.error("Error updating last opened:", error);
    }
  },

  // Get last opened timestamp
  async getLastOpened(): Promise<number | null> {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_OPENED_KEY);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error("Error getting last opened:", error);
      return null;
    }
  },

  // Check if user has been inactive for 24 hours
  async checkInactivity(): Promise<boolean> {
    try {
      const lastOpened = await this.getLastOpened();
      if (!lastOpened) return false;

      const now = Date.now();
      const hoursSinceLastOpened = (now - lastOpened) / (1000 * 60 * 60);

      return hoursSinceLastOpened >= 24;
    } catch (error) {
      console.error("Error checking inactivity:", error);
      return false;
    }
  },

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  },

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications cancelled");
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  },

  // Add notification listener
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  },

  // Add notification response listener (when user taps notification)
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
