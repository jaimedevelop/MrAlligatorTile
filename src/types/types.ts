// types.ts - Combined definitions

export type ServiceType = 
  | 'repair'
  | 'installation'
  | 'maintenance'
  | 'inspection'
  | 'emergency'
  | 'other';

export type AppointmentStatus = 
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type PageType = 'page' | 'card';

// Type for gallery items stored in Firestore (part of Project)
export interface GalleryPhoto {
  url: string;
  caption: string;
}

// New type for gallery items used within the form state
export interface GalleryFormItem {
  url?: string;
  caption: string;
  file?: File;
  previewUrl?: string;
}

export interface ProjectDetails {
  challenge: string;
  solution: string;
  outcome: string;
}

export interface ProjectSpecifications {
  duration: string;
  location: string;
  services: string[];
  materials: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'Commercial' | 'Residential' | 'Emergency';
  image: string;
  imageUrl?: string; // Optional as it appears only in the second definition
  completionDate: string | { seconds: number; nanoseconds: number }; // Allow string or Timestamp-like object
  highlights: string[];
  type: string;
  details: string;
  tableOnly?: boolean;
  specifications: ProjectSpecifications;
  projectDetails: ProjectDetails;
  gallery: GalleryPhoto[]; // Use GalleryPhoto for the final Project structure
}

// Updated ProjectFormData to use GalleryFormItem
export interface ProjectFormData extends Omit<Project, 'id' | 'gallery' | 'completionDate'> {
  id?: string;
  completionDate: string; // Keep as string in form data
  newImage?: File;
  tableOnly?: boolean;
  gallery?: GalleryFormItem[]; // Use GalleryFormItem for form state
}

export interface PageContent {
  id: string;
  title: string;
  content: string;
  type: PageType;
  seo: PageSeo;
}

export interface SeoSettings {
  title: string;
  description: string;
  keywords: string[];
}

export interface SocialMediaMeta {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

export interface RobotsMeta {
  noindex: boolean;
  nofollow: boolean;
  noarchive: boolean;
  nosnippet: boolean;
  noimageindex: boolean;
  notranslate: boolean;
}

export interface PageSeo {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  redirectUrl: string;
  robots: RobotsMeta;
  schema: string;
  social: SocialMediaMeta;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface Appointment {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: ServiceType;
  preferredDate: Date;
  alternativeDate?: Date;
  description: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentSettings {
  enableScheduling: boolean;
  availableDays: number[];  // 0-6, where 0 is Sunday
  availableHours: {
    start: string;  // Format: "HH:mm"
    end: string;    // Format: "HH:mm"
  };
  excludedDates: string[];  // ISO date strings (YYYY-MM-DD)
  maxDaysInAdvance: number;
  minDaysInAdvance: number;
}