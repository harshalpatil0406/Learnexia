import api from "./api";

export const getInstructors = async (page: number = 1, limit: number = 20) => {
  try {
    const res = await api.get(
      `/public/randomusers?page=${page}&limit=${limit}`
    );
    console.log("Instructors response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch instructors:", error);
    console.error("Error response:", error.response?.data);
    throw error.response?.data || "Failed to fetch instructors";
  }
};

export const getCourses = async (page: number = 1, limit: number = 20) => {
  try {
    const res = await api.get(
      `/public/randomproducts?page=${page}&limit=${limit}`
    );
    console.log("Courses response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch courses:", error);
    console.error("Error response:", error.response?.data);
    throw error.response?.data || "Failed to fetch courses";
  }
};
