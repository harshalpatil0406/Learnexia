
import api from "./api";

export const registerUser = async (data: {
  email: string;
  password: string;
  username: string;
  role: string;
}) => {
  const res = await api.post("/users/register", data);
  return res.data;
};

export const loginUser = async (email: string, password: string) => {
  try {
    const res = await api.post("/users/login", {
      email,
      password,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || "Login failed";
  }
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const res = await api.post("/users/refresh-token", {
      refreshToken,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || "Token refresh failed";
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/users/current-user");
    return res.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to fetch user";
  }
};

export const updateAvatar = async (imageUri: string) => {
  try {
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const res = await api.patch("/users/avatar", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return res.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to update avatar";
  }
};


export const forgotPassword = async (email: string) => {
  try {
    const res = await api.post("/users/forgot-password", {
      email,
    });
    return res.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to send reset email";
  }
};