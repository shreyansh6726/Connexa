export type UserRole = 'EMPLOYEE' | 'EMPLOYER' | 'ADMIN';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'CONTRACT' | 'INTERNSHIP';

export type JobStatus = 'OPEN' | 'CLOSED' | 'UNDER_REVIEW';

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED';

export type NotificationType = 'NEW_JOB_POSTED' | 'NEW_APPLICATION' | 'STATUS_CHANGE';

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface ContactDetails {
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  website?: string;
}

export interface UserProfile {
  headline?: string;
  bio?: string;
  skills: string[];
  experience: Experience[];
  resumeUrl?: string;
  resumeText?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  contactDetails?: ContactDetails;
  profile?: UserProfile;
  companyName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface Job {
  _id: string;
  postedBy: {
    _id: string;
    name: string;
    companyName?: string;
    email: string;
  };
  title: string;
  companyName: string;
  location: string;
  jobType: JobType;
  salaryRange: SalaryRange;
  description: string;
  requirements: string[];
  keywords: string[];
  status: JobStatus;
  applicantCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Application {
  _id: string;
  job: Job | string;
  jobId?: string;
  jobTitle?: string;
  companyName?: string;
  applicant: User | string;
  applicantId?: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantSkills?: string[];
  employer: User | string;
  employerId?: string;
  status: ApplicationStatus;
  aiMatchScore: number;
  aiMatchAnalysis: string;
  appliedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
  };
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AiMatchResult {
  matchScore: number;
  analysis: string;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
}

export interface BioGenerationResult {
  bio: string;
  headline: string;
  suggestedSkills: string[];
}

export interface EnhanceJobResult {
  enhancedDescription: string;
  extractedRequirements: string[];
  suggestedKeywords: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
