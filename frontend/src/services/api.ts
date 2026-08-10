import {
  AiMatchResult,
  Application,
  AuthResponse,
  BioGenerationResult,
  EnhanceJobResult,
  Job,
  Notification,
  User,
} from '../types';

const TOKEN_KEY = 'connexa_jwt_token';
const RAW_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? '';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

function buildApiUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(buildApiUrl(endpoint), {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (isJson && typeof data === 'object' && data !== null && 'message' in data) {
      throw new Error(String((data as { message?: unknown }).message || `HTTP error ${response.status}`));
    }

    const preview = typeof data === 'string' ? data.slice(0, 120).trim() : '';
    throw new Error(
      preview
        ? `HTTP error ${response.status}: ${preview}`
        : `HTTP error ${response.status}`
    );
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string; role: string; companyName?: string }) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  updateProfile: (payload: Partial<User>) =>
    request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Jobs
  getJobs: (params?: { keyword?: string; location?: string; jobType?: string; postedBy?: string; status?: string }) => {
    const search = new URLSearchParams();
    if (params?.keyword) search.append('keyword', params.keyword);
    if (params?.location) search.append('location', params.location);
    if (params?.jobType) search.append('jobType', params.jobType);
    if (params?.postedBy) search.append('postedBy', params.postedBy);
    if (params?.status) search.append('status', params.status);

    const query = search.toString() ? `?${search.toString()}` : '';
    return request<{ jobs: Job[]; count: number }>(`/api/jobs${query}`);
  },

  getJobById: (id: string) => request<{ job: Job }>(`/api/jobs/${id}`),

  createJob: (payload: Partial<Job>) =>
    request<{ job: Job }>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateJob: (id: string, payload: Partial<Job>) =>
    request<{ job: Job }>(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getCandidates: (params?: { keyword?: string; skill?: string }) => {
    const search = new URLSearchParams();
    if (params?.keyword) search.append('keyword', params.keyword);
    if (params?.skill) search.append('skill', params.skill);

    const query = search.toString() ? `?${search.toString()}` : '';
    return request<{ candidates: User[]; count: number }>(`/api/jobs/candidates${query}`);
  },

  // Applications
  applyJob: (jobId: string) =>
    request<{ application: Application; aiMatch: AiMatchResult }>('/api/applications/apply', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    }),

  getEmployerApplications: (jobId?: string) => {
    const query = jobId ? `?jobId=${jobId}` : '';
    return request<{ applications: (Application & { applicantDetails: User | null })[]; count: number }>(
      `/api/applications/employer${query}`
    );
  },

  getEmployeeApplications: () =>
    request<{ applications: Application[]; count: number }>('/api/applications/employee'),

  updateApplicationStatus: (id: string, status: string) =>
    request<{ application: Application }>(`/api/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // AI
  calculateAiMatch: (payload: { jobId?: string; candidateId?: string; candidateData?: any; jobData?: any }) =>
    request<{ result: AiMatchResult }>('/api/ai/match', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  generateAiBio: (payload: { name?: string; targetRole?: string; currentSkills: string[]; yearsOfExperience?: string }) =>
    request<{ result: BioGenerationResult }>('/api/ai/generate-bio', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  enhanceJobWithAi: (payload: { title: string; rawDescription: string; companyName?: string }) =>
    request<{ result: EnhanceJobResult }>('/api/ai/enhance-job', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: Notification[]; unreadCount: number; count: number }>('/api/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PUT',
    }),

  // Admin
  getAdminStats: () =>
    request<{
      totalUsers: number;
      employees: number;
      employers: number;
      admins: number;
      totalJobs: number;
      openJobs: number;
      totalApplications: number;
    }>('/api/admin/stats'),

  getAdminUsers: () => request<{ users: User[] }>('/api/admin/users'),
};
