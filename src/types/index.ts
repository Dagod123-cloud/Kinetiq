export type EventCategory =
  | 'Sports'
  | 'Arts & Drama'
  | 'STEM & Robotics'
  | 'Social & Fun'
  | 'Academic & Careers'
  | 'Community & Charity'
  | 'Leadership & Council';

export type EventAudience = 'ALL_SCHOOL' | 'YEAR_GROUP' | 'REGISTERED_ONLY';

export type EventStatus = 'UPCOMING' | 'POSTPONED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED';

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  audience: EventAudience;
  targetYearGroups?: number[]; // e.g., [10, 11]
  requiresRegistration: boolean;
  capacity: number;
  registeredStudentIds: string[];
  registrationDeadline: string; // YYYY-MM-DD HH:MM
  status: EventStatus;
  changeReason?: string;
  previousDate?: string;
  previousTime?: string;
  previousLocation?: string;
  organizerName: string;
  featured?: boolean;
  requiresParentConsent?: boolean;
  consentFormId?: string;
  posterTheme?: string;
  schoolName?: string;
  targetClasses?: string[];
  compulsory?: boolean;
  houseAffiliation?: HouseName | 'ALL_HOUSES';
  isPersonal?: boolean;
  userId?: string;
  userEmail?: string;
  personalColor?: string;
  notes?: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  eventTitle: string;
  liked: string;
  disliked: string;
  recommend: boolean; // Yes / No
  rating: number; // 1 to 5
  timestamp: string;
  isAnonymous: true;
}

export interface EventSuggestion {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  estimatedScale: 'Small (Class/Club)' | 'Medium (Year Group)' | 'Large (Whole School)';
  studentYearGroup?: number;
  upvotes: number;
  upvotedByMe?: boolean;
  status: 'Under Consideration' | 'Approved & Scheduled' | 'Feasibility Review' | 'Archived';
  organizerNotes?: string;
  createdAt: string;
}

export type HouseName = 'Crimson' | 'Tiger' | 'Amber' | 'Lime' | 'Sapphire';

export interface YearGroupConfig {
  year: number;
  classes: string[];
}

export interface SchoolStructure {
  id: string;
  name: string;
  yearGroups: YearGroupConfig[];
  sections: string[];
  isDefault?: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  schoolName: string;
  yearGroup: number;
  className: string; // e.g. "10-A"
  sectionName: string; // e.g. "Alpha"
  avatarSeed: string;
  studentIdNumber: string;
  house: HouseName;
  houseVerified?: boolean;
  role: 'STUDENT';
  points: number;
  parentEmail?: string;
}

export interface OrganiserProfile {
  id: string;
  name: string;
  email: string;
  schoolName?: string;
  role: 'ORGANISER';
  title: string;
  department: string;
  avatarSeed: string;
}

export type UserAccount = StudentProfile | OrganiserProfile;

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'EVENT_CHANGE' | 'DEADLINE_ALERT' | 'NEW_EVENT' | 'REGISTRATION_CONFIRMED' | 'FEEDBACK_INVITE' | 'CONSENT_REQUEST' | 'CONSENT_APPROVED';
  eventId?: string;
  timestamp: string;
  read: boolean;
  changeDetails?: {
    status: EventStatus;
    reason?: string;
    newDate?: string;
    newTime?: string;
    newLocation?: string;
  };
}

export interface SchedulingConflict {
  eventId1: string;
  eventId2: string;
  event1Title: string;
  event2Title: string;
  date: string;
  location: string;
  overlapPeriod: string;
}

export interface AiAnalysisResult {
  summary?: {
    overallSentiment: string;
    keyPraises: string[];
    recurringComplaints: string[];
    studentSuggestions: string[];
  };
  recommendations?: Array<{
    area: string;
    issue: string;
    solution: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
}

export interface ConsentFormTemplate {
  id: string;
  eventId: string;
  eventTitle: string;
  title: string;
  activityOverview: string;
  date: string;
  location: string;
  departureTime?: string;
  returnTime?: string;
  supervisingStaff: string;
  emergencyProcedures: string;
  medicalConditionsRequired: boolean;
  submissionDeadline: string;
  rulesAndExpectations: string[];
}

export interface ConsentSubmission {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  yearGroup: number;
  className: string;
  sectionName: string;
  parentGuardianName: string;
  parentEmail: string;
  emergencyPhone: string;
  medicalNotes?: string;
  dietaryRestrictions?: string;
  permissionGranted: boolean;
  electronicSignature: string;
  signedAt: string;
  status: 'APPROVED' | 'PENDING' | 'DECLINED';
}

export interface GeneratedPoster {
  headline: string;
  tagline: string;
  description: string;
  bulletHighlights: string[];
  callToAction: string;
  badgeText: string;
  colorPalette: {
    gradient: string;
    accentColor: string;
    textColor: string;
  };
}
