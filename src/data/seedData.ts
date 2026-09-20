import { Call, MonthlyArchiveRecord, FieldNote, AppNotification, UserProfile, LeaderboardUser, ActivityEvaluation, AppUserInboundNote } from '../types';

export const INITIAL_CALLS: Call[] = [];

export const INITIAL_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  role: 'association',
  avatarUrl: '/app-logo.jpg',
  location: {
    useGps: true,
    latitude: 36.7538,
    longitude: 3.0588,
    city: 'الجزائر',
    neighborhood: '',
    maxRadiusKm: 25
  },
  skills: [],
  interests: [],
  notificationSettings: {
    nearbyAlerts: true,
    urgentOnly: false,
    quietHoursStart: '23:00',
    quietHoursEnd: '06:00'
  },
  monthlyPoints: 0,
  totalImpactPoints: 0,
  savedCallIds: []
};

export const INITIAL_NOTES: FieldNote[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const CURRENT_LEADERBOARD: LeaderboardUser[] = [];
export const INITIAL_LEADERBOARD: LeaderboardUser[] = [];
export const INITIAL_ARCHIVES: MonthlyArchiveRecord[] = [];
export const INITIAL_ACTIVITY_EVALUATIONS: ActivityEvaluation[] = [];
export const INITIAL_EVALUATIONS: ActivityEvaluation[] = [];
export const INITIAL_INBOUND_NOTES: AppUserInboundNote[] = [];

