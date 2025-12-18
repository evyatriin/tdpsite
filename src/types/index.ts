// Type definitions for TDP Social Network

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'LEADER' | 'CADRE';

export type EventCategory = 'OUTREACH' | 'WELFARE' | 'MEETING' | 'PROTEST' | 'SOCIAL_SERVICE';

export type EventStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type SocialPlatform = 'YOUTUBE' | 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM';

export interface User {
    id: string;
    name: string;
    mobile: string;
    role: UserRole;
    state?: string;
    district?: string;
    constituency?: string;
    isActive: boolean;
    canPost: boolean;
    createdAt: Date;
}

export interface EventImage {
    id: string;
    url: string;
    order: number;
}

export interface SocialLink {
    id: string;
    platform: SocialPlatform;
    url: string;
    thumbnailUrl?: string;
}

export interface Event {
    id: string;
    title: string;
    category: EventCategory;
    description: string;
    state: string;
    district: string;
    constituency: string;
    status: EventStatus;
    language: string;
    userId: string;
    user?: User;
    images: EventImage[];
    socialLinks: SocialLink[];
    comments?: Comment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface MediaByte {
    id: string;
    videoUrl: string;
    videoType: 'youtube' | 'upload';
    message?: string;
    viewCount: number;
    language: string;
    userId: string;
    user?: User;
    comments?: Comment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaderProfile {
    id: string;
    userId: string;
    user?: User;
    photoUrl?: string;
    designation: string;
    constituency?: string;
    bio?: string;
    socialLinks?: {
        youtube?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
    };
    isVerified: boolean;
}

export interface Comment {
    id: string;
    content: string;
    userId: string;
    user?: User;
    eventId?: string;
    mediaByteId?: string;
    createdAt: Date;
}

export interface InviteCode {
    id: string;
    code: string;
    role: UserRole;
    createdById: string;
    used: boolean;
    expiresAt?: Date;
    createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Form types
export interface CreateEventInput {
    title: string;
    category: EventCategory;
    description: string;
    state: string;
    district: string;
    constituency: string;
    language?: string;
    images: File[];
    socialLinks: Array<{
        platform: SocialPlatform;
        url: string;
    }>;
}

export interface CreateMediaByteInput {
    videoUrl?: string;
    videoFile?: File;
    message?: string;
    language?: string;
}

// Filter types
export interface EventFilters {
    state?: string;
    district?: string;
    constituency?: string;
    category?: EventCategory;
    status?: EventStatus;
    search?: string;
}

// Location types
export interface State {
    id: string;
    name: string;
    nameTE?: string;
}

export interface District {
    id: string;
    name: string;
    nameTE?: string;
    stateId: string;
}

export interface Constituency {
    id: string;
    name: string;
    nameTE?: string;
    districtId: string;
}

// Analytics types
export interface AnalyticsData {
    totalEvents: number;
    eventsLast7Days: number;
    eventsLast30Days: number;
    eventsByState: Record<string, number>;
    eventsByDistrict: Record<string, number>;
    eventsByCategory: Record<EventCategory, number>;
    topConstituencies: Array<{ constituency: string; count: number }>;
    topCadres: Array<{ user: User; count: number }>;
    mediaByteViews: number;
    eventsOverTime: Array<{ date: string; count: number }>;
}

// Permission types
export const ROLE_PERMISSIONS = {
    SUPER_ADMIN: {
        canViewFeed: true,
        canPostEvent: false,
        canPostMediaByte: false,
        canComment: false,
        canModerate: true,
        canManageUsers: true,
        canGenerateInvites: true,
        canViewAnalytics: true,
        canEditLeaderProfiles: true,
    },
    ADMIN: {
        canViewFeed: true,
        canPostEvent: false,
        canPostMediaByte: false,
        canComment: false,
        canModerate: true,
        canManageUsers: true,
        canGenerateInvites: true,
        canViewAnalytics: true,
        canEditLeaderProfiles: true,
    },
    LEADER: {
        canViewFeed: true,
        canPostEvent: false,
        canPostMediaByte: true,
        canComment: true,
        canModerate: false,
        canManageUsers: false,
        canGenerateInvites: false,
        canViewAnalytics: false,
        canEditLeaderProfiles: false,
    },
    CADRE: {
        canViewFeed: true,
        canPostEvent: true,
        canPostMediaByte: false,
        canComment: true,
        canModerate: false,
        canManageUsers: false,
        canGenerateInvites: false,
        canViewAnalytics: false,
        canEditLeaderProfiles: false,
    },
} as const;

export type RolePermissions = typeof ROLE_PERMISSIONS[UserRole];
