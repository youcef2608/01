export type CallCategory = 
  | 'help'
  | 'volunteer'
  | 'event'
  | 'initiative'
  | 'education'
  | 'tech'
  | 'resources'
  | 'community'
  | 'other';

export type CallPriority = 'low' | 'medium' | 'high' | 'urgent';

export type CallStatus = 
  | 'draft'
  | 'new'
  | 'active'
  | 'receiving_responses'
  | 'in_progress'
  | 'completed'
  | 'closed'
  | 'archived';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  placeName: string;
  city: string;
  region: string;
  approxAddress?: string;
}

export interface Call {
  id: string;
  title: string;
  description: string;
  category: CallCategory;
  goal: string;
  targetAudience: string;
  requiredSkills: string[];
  requiredCount?: number;
  startTime: string;
  endTime?: string;
  priority: CallPriority;
  requiredResources: string[];
  participationTerms?: string;
  contactInfo?: string;
  attachments?: string[];
  status: CallStatus;
  location: LocationCoords;
  creatorId: string;
  creatorName: string;
  creatorOrg?: string;
  responsesCount: number;
  confirmedCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  reportCompleted?: boolean;
  evaluationReport?: ActivityEvaluationReport;
}

export interface ActivityEvaluationReport {
  id: string;
  callId: string;
  callTitle: string;
  associationName: string;
  wilaya: string;
  targetVolunteers: number;
  actualVolunteers: number;
  beneficiariesCount: number;
  goalAchievementRate: number; // Percentage, e.g., 95
  whatWentWell: string;
  challengesFaced: string;
  operationalNotes: string;
  lessonsLearned: string[];
  rating: number; // 1 to 5 stars
  status: 'submitted' | 'approved';
  submittedAt: string;
}

export interface AssociationLeaderboardEntry {
  rank: number;
  associationName: string;
  badgeNumber: string;
  wilaya: string;
  completedAppealsCount: number;
  mobilizedVolunteers: number;
  impactHours: number;
  points: number;
  rating: number;
  verified: boolean;
  activeInitiativesCount: number;
  reportsSubmittedCount: number;
}

export type ResponseType = 'can_help' | 'want_to_join' | 'need_info' | 'cannot_now';

export interface CallResponse {
  id: string;
  callId: string;
  callTitle: string;
  userId: string;
  userName: string;
  userPhone?: string;
  responseType: ResponseType;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

export interface FieldNote {
  id: string;
  userId: string;
  callId?: string;
  callTitle?: string;
  title: string;
  content: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl?: string;
  points: number;
  responsesCount: number;
  completedCount: number;
  volunteerHours: number;
  badges: string[];
}

export interface MonthlyArchiveRecord {
  monthKey: string;
  monthName: string;
  totalResponses: number;
  totalCompletedCalls: number;
  totalVolunteers: number;
  leaderboard: LeaderboardUser[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'caller' | 'responder' | 'both';
  avatarUrl?: string;
  location: {
    useGps: boolean;
    latitude: number;
    longitude: number;
    city: string;
    neighborhood?: string;
    maxRadiusKm: number;
  };
  skills: string[];
  interests: string[];
  notificationSettings: {
    nearbyAlerts: boolean;
    urgentOnly: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  monthlyPoints: number;
  totalImpactPoints: number;
  savedCallIds: string[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'nearby_call' | 'response_status' | 'urgent_alert' | 'rank_update' | 'general' | 'system';
  callId?: string;
  read: boolean;
  createdAt: string;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number; // 0 to 1
  callCount: number;
  city: string;
  region: string;
  dominantCategory: CallCategory;
  activeCalls: number;
  calls: Call[];
}

export interface ActivityEvaluation {
  id: string;
  callId?: string;
  activityTitle: string;
  associationName: string;
  date: string;
  whatWentWell: string;
  challengesFaced: string;
  operationalNotes?: string;
  ratingScore: number; // 1 to 5
  aiAnalysis?: {
    summary: string;
    lessonsLearned: string[];
    futureRiskMitigations: string[];
    crossAssociationAdvice: string[];
    readinessScore: number; // e.g. 85%
    playbook?: {
      playbookTitle: string;
      phases: { phase: string; items: string[] }[];
    };
  };
  createdAt: string;
}

export interface AppUserInboundNote {
  id: string;
  senderName: string;
  senderPhone?: string;
  type: 'field_observation' | 'issue_report' | 'suggestion' | 'emergency_tip';
  callId?: string;
  callTitle?: string;
  message: string;
  locationName?: string;
  cityName?: string;
  rating?: number;
  status: 'new' | 'reviewed' | 'resolved';
  appVersion?: string;
  createdAt: string;
}

export interface SmartSearchPipelineStep {
  step: 'server_search' | 'internet_search';
  name: string;
  status: 'searching' | 'found' | 'not_found' | 'completed';
  message: string;
  timestamp: string;
}

export interface BookChapter {
  number: number;
  title: string;
  summary: string;
  keyTopics: string[];
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  category: 'management' | 'relief_emergency' | 'volunteering' | 'logistics' | 'safety' | 'governance';
  coverGradient: string;
  isbn: string;
  pagesCount: number;
  overview: string;
  targetAudience: string;
  chapters: BookChapter[];
  coreQuotes: string[];
}

export interface BookSearchMatch {
  bookId: string;
  bookTitle: string;
  author: string;
  category: string;
  chapterTitle?: string;
  relevanceScore: number;
  excerpt: string;
}

export interface BookSearchQueryResult {
  query: string;
  matchedBooks: BookSearchMatch[];
  answer: string;
  keyTakeaways: string[];
  recommendedReading: string[];
  source: 'books_library' | 'gemini_library_synthesis';
}

export type UserRole = 'association' | 'association_leader' | 'volunteer' | 'field_medic' | 'coordinator';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  roleTitle: string;
  associationName: string;
  wilaya: string;
  avatarUrl?: string;
  badgeNumber: string;
  isVerified: boolean;
  activeInitiativesCount: number;
  volunteerHours: number;
  points: number;
  description?: string;
}

export interface GeminiChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  source?: string;
  attachment?: {
    type: 'call' | 'wilaya' | 'document' | 'emergency';
    title: string;
    details?: string;
  };
}

