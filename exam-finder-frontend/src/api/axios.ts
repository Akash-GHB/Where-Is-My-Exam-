import axios from "axios";
import { getToken, removeToken } from "@/utils/auth";

// Axios instance (Vite proxy handles /api and /auth)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "", // uses env variable
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    // Basic JWT format check (3 parts separated by dots)
    if (token && token.split('.').length === 3) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If backend returns 401 → remove token only (ProtectedRoute handles the redirect via React Router)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't redirect here — let ProtectedRoute and AuthContext handle it
      // This prevents full page reloads which break SPA navigation
      removeToken();
    }
    return Promise.reject(error);
  }
);

// ------------------------------------------------------
// TYPES
// ------------------------------------------------------

export interface SearchParams {
  reg_no: string;
  date: string;
  session: "FN" | "AN";
}

export interface ExamResult {
  program: string;
  branch: string;
  course_name: string;
  room_no: string;
  block: string;
  floor: string;
  reg_no: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UploadResponse {
  message: string;
  successCount?: number;
  errors?: string[];
}

export interface BatchInfo {
  id: number;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  recordCount?: number;
  description?: string;
}

// ------------------------------------------------------
// API FUNCTIONS
// ------------------------------------------------------

// GET /api/search
export async function searchExam(params: SearchParams): Promise<ExamResult> {
  const response = await api.get<ExamResult>("/api/search", { params });
  return response.data;
}

// POST /auth/login
export async function loginUser(
  credentials: LoginCredentials
): Promise<AuthSuccessResponse> {
  const response = await api.post<AuthSuccessResponse>("/auth/login", credentials);
  return response.data;
}

// POST /auth/google
export async function loginWithGoogleApi(token: string): Promise<AuthSuccessResponse> {
  const response = await api.post<AuthSuccessResponse>("/auth/google", { token });
  return response.data;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  email: string;
}

export interface AuthSuccessResponse extends LoginResponse {
  name: string;
  email: string;
  role: string;
}

// POST /auth/register
export async function registerUser(
  credentials: RegisterCredentials
): Promise<AuthSuccessResponse> {
  const response = await api.post<AuthSuccessResponse>("/auth/register", credentials);
  return response.data;
}

// POST /api/upload
export async function uploadCsv(
  file: File,
  uploadedBy: string = "admin",
  description: string = ""
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uploadedBy", uploadedBy);
  formData.append("description", description);

  const response = await api.post<UploadResponse>("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

// GET /api/admin/batches (optional)
export async function getBatches(): Promise<BatchInfo[]> {
  try {
    const response = await api.get<BatchInfo[]>("/api/admin/batches");
    return response.data;
  } catch (err) {
    console.warn("getBatches failed or unavailable:", err);
    return [];
  }
}

export interface AdminStats {
  totalStudents: number;
  totalExams: number;
  totalSearches: number;
}

export interface SearchLogEntry {
  id: number;
  regNo: string;
  timestamp: string;
}

// GET /api/admin/stats
export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get<AdminStats>("/api/admin/stats");
  return response.data;
}

export interface SearchLogPage {
  content: SearchLogEntry[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  last: boolean;
}

// GET /api/admin/search-logs
export async function getSearchLogs(page: number = 0, size: number = 50): Promise<SearchLogPage> {
  const response = await api.get<SearchLogPage>("/api/admin/search-logs", { params: { page, size } });
  return response.data;
}

// GET /api/admin/export/search-logs
export async function exportSearchLogsCsv(): Promise<void> {
  const response = await api.get("/api/admin/export/search-logs", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "search-logs.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export interface DownloadHistoryEntry {
  id: number;
  regNo: string;
  examDate: string;
  session: string;
  downloadedAt: string;
}

export interface SaveHistoryRequest {
  regNo: string;
  examDate: string;
  session: string;
}

// POST /api/history
export async function saveDownloadHistory(data: SaveHistoryRequest): Promise<void> {
  await api.post("/api/history", data);
}

// GET /api/history
export async function getDownloadHistory(): Promise<DownloadHistoryEntry[]> {
  const response = await api.get<DownloadHistoryEntry[]>("/api/history");
  return response.data;
}

// ------------------------------------------------------
// PASSWORD RESET
// ------------------------------------------------------

// POST /auth/forgot-password
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/forgot-password", { email });
  return response.data;
}

// POST /auth/verify-otp
export async function verifyOtp(email: string, otp: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/verify-otp", { email, otp });
  return response.data;
}

// POST /auth/reset-password
export async function resetPassword(email: string, newPassword: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/reset-password", { email, newPassword });
  return response.data;
}

// ------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "ALERT";
  read: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<Notification[]>("/api/notifications");
  return response.data;
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await api.put(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.put("/api/notifications/read-all");
}

export interface SendRemindersResponse {
  success: boolean;
  date: string;
  emailsSent: number;
  message: string;
}

// POST /api/admin/email/send-reminders
export async function sendEmailReminders(date?: string): Promise<SendRemindersResponse> {
  const response = await api.post<SendRemindersResponse>("/api/admin/email/send-reminders", null, {
    params: { date }
  });
  return response.data;
}

// ------------------------------------------------------
// PROFILE
// ------------------------------------------------------

export interface UserProfile {
  username: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export async function getProfile(): Promise<UserProfile> {
  const response = await api.get<UserProfile>("/api/user/profile");
  return response.data;
}

export async function updateProfile(data: { name?: string; password?: string; avatarUrl?: string }): Promise<{ message: string }> {
  const response = await api.put<{ message: string }>("/api/user/profile", data);
  return response.data;
}

export default api;

