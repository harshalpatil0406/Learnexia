import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { getCourses, getInstructors } from "../services/courseService";
import { Course, Instructor } from "../types/course";
import { notificationService } from "../services/notificationService";

const BOOKMARKS_KEY = "bookmarked_courses";
const ENROLLED_KEY = "enrolled_courses";

interface CourseState {
  courses: Course[];
  instructors: Instructor[];
  bookmarkedCourses: string[];
  enrolledCourses: string[];
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  fetchCourses: () => Promise<void>;
  toggleBookmark: (courseId: string) => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  getFilteredCourses: () => Course[];
  initializeStorage: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  instructors: [],
  bookmarkedCourses: [],
  enrolledCourses: [],
  loading: false,
  refreshing: false,
  searchQuery: "",

  fetchCourses: async () => {
    try {
      console.log("Starting to fetch courses...");
      set({ loading: true });

      // Fetch instructors and courses in parallel
      const [instructorsRes, coursesRes] = await Promise.all([
        getInstructors(1, 20),
        getCourses(1, 20),
      ]);

      console.log("Instructors data:", instructorsRes);
      console.log("Courses data:", coursesRes);

      const instructors = instructorsRes.data?.data || [];
      const coursesData = coursesRes.data?.data || [];

      console.log("Parsed instructors:", instructors.length);
      console.log("Parsed courses:", coursesData.length);

      // Map courses with instructors
      const courses: Course[] = coursesData.map((product: any, index: number) => {
        const instructor = instructors[index % instructors.length];
        
        // Try to get the best available image
        let thumbnail = "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Course";
        if (product.images && product.images.length > 0) {
          thumbnail = product.images[0]; // Use first full image instead of thumbnail
        } else if (product.thumbnail) {
          thumbnail = product.thumbnail;
        }
        
        const course = {
          id: product.id?.toString() || `course-${index}`,
          title: product.title || "Untitled Course",
          description: product.description || "No description available",
          thumbnail: thumbnail,
          price: product.price || 0,
          category: product.category || product.brand || "General",
          instructor: instructor ? {
            id: instructor.id?.toString() || `instructor-${index}`,
            name: `${instructor.name?.first || ''} ${instructor.name?.last || ''}`.trim() || "Unknown",
            email: instructor.email || "",
            avatar: instructor.picture?.large || instructor.picture?.medium || "https://i.pravatar.cc/150?img=" + (index + 1),
            username: instructor.login?.username || "user",
          } : undefined,
        };
        
        console.log(`Course ${index}:`, {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
        });
        
        return course;
      });

      console.log("Mapped courses:", courses.length);

      const { bookmarkedCourses, enrolledCourses } = get();

      // Add bookmark and enrollment status
      const coursesWithStatus = courses.map((course) => ({
        ...course,
        isBookmarked: bookmarkedCourses.includes(course.id),
        isEnrolled: enrolledCourses.includes(course.id),
      }));

      console.log("Final courses with status:", coursesWithStatus.length);

      set({
        courses: coursesWithStatus,
        instructors,
        loading: false,
        refreshing: false,
      });
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      set({ loading: false, refreshing: false });
      throw error;
    }
  },

  toggleBookmark: async (courseId: string) => {
    console.log("toggleBookmark called for:", courseId);
    const { bookmarkedCourses, courses } = get();
    const isBookmarked = bookmarkedCourses.includes(courseId);
    console.log("Current bookmark status:", isBookmarked);
    console.log("Current courses length:", courses.length);

    let updatedBookmarks: string[];
    if (isBookmarked) {
      updatedBookmarks = bookmarkedCourses.filter((id) => id !== courseId);
    } else {
      updatedBookmarks = [...bookmarkedCourses, courseId];

      // Show notification when user bookmarks 5+ courses
      if (updatedBookmarks.length === 5) {
        await notificationService.showBookmarkMilestoneNotification(5);
      } else if (updatedBookmarks.length === 10) {
        await notificationService.showBookmarkMilestoneNotification(10);
      } else if (updatedBookmarks.length === 20) {
        await notificationService.showBookmarkMilestoneNotification(20);
      }
      
    }

    console.log("Updated bookmarks:", updatedBookmarks);

    // Update courses with new bookmark status - CREATE NEW ARRAY
    const updatedCourses = courses.map((course) =>
      course.id === courseId
        ? { ...course, isBookmarked: !isBookmarked }
        : course
    );

    console.log("Updated courses length:", updatedCourses.length);
    console.log("Course bookmark status:", updatedCourses.find(c => c.id === courseId)?.isBookmarked);

    // Use set with new object references to trigger re-render
    set({ 
      bookmarkedCourses: updatedBookmarks, 
      courses: updatedCourses 
    });

    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      console.log("Bookmarks saved to storage");
    } catch (error) {
      console.error("Failed to save bookmarks:", error);
    }
  },

  enrollCourse: async (courseId: string) => {
    const { enrolledCourses, courses } = get();

    if (enrolledCourses.includes(courseId)) {
      return; // Already enrolled
    }

    const updatedEnrolled = [...enrolledCourses, courseId];

    // Update courses with enrollment status
    const updatedCourses = courses.map((course) =>
      course.id === courseId ? { ...course, isEnrolled: true } : course
    );

    set({ enrolledCourses: updatedEnrolled, courses: updatedCourses });

    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(ENROLLED_KEY, JSON.stringify(updatedEnrolled));
    } catch (error) {
      console.error("Failed to save enrollment:", error);
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  getFilteredCourses: () => {
    const { courses, searchQuery } = get();

    if (!searchQuery.trim()) {
      return courses;
    }

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.instructor?.name.toLowerCase().includes(query)
    );
  },

  initializeStorage: async () => {
    try {
      const [bookmarksStr, enrolledStr] = await Promise.all([
        AsyncStorage.getItem(BOOKMARKS_KEY),
        AsyncStorage.getItem(ENROLLED_KEY),
      ]);

      const bookmarkedCourses = bookmarksStr ? JSON.parse(bookmarksStr) : [];
      const enrolledCourses = enrolledStr ? JSON.parse(enrolledStr) : [];

      set({ bookmarkedCourses, enrolledCourses });
    } catch (error) {
      console.error("Failed to load storage:", error);
    }
  },
}));
