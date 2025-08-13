// Tipos principais do app de corrida

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  totalDistance: number;
  totalRuns: number;
  averagePace: string;
  joinDate: Date;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'running';
  lastRun?: Date;
  lastRunDistance?: number;
  lastRunTime?: string;
}

export interface RunningInvite {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  message: string;
  scheduledTime: Date;
  distance?: number;
  location?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface RunningSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  distance: number; // em metros
  duration: number; // em segundos
  averagePace: number; // em segundos por km
  averageSpeed: number; // em km/h
  calories: number;
  route: LocationPoint[];
  isActive: boolean;
  participants?: string[]; // IDs dos usuários participantes
  musicSessionId?: string;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  speed?: number;
  altitude?: number;
}

export interface RunningMetrics {
  distance: number;
  elapsedTime: number;
  pace: number;
  speed: number;
  calories: number;
  steps: number;
  heartRate?: number;
  elevation?: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // em segundos
  url?: string;
  artwork?: string;
  genre?: string;
}

export interface MusicSession {
  id: string;
  hostId: string;
  participants: string[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  playlist: MusicTrack[];
  createdAt: Date;
  isPublic: boolean;
  maxParticipants: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'distance' | 'speed' | 'consistency' | 'social' | 'special';
  unlockedAt?: Date;
  progress: number;
  target: number;
  isUnlocked: boolean;
}

export interface WeeklyStats {
  weekStart: Date;
  totalDistance: number;
  totalTime: number;
  totalRuns: number;
  averagePace: number;
  caloriesBurned: number;
  dailyStats: {
    [key: string]: {
      distance: number;
      time: number;
      runs: number;
    };
  };
}

export interface MonthlyStats {
  month: number;
  year: number;
  totalDistance: number;
  totalTime: number;
  totalRuns: number;
  averagePace: number;
  caloriesBurned: number;
  personalBests: {
    [key: string]: string; // distance -> time
  };
  achievements: Achievement[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'invite' | 'achievement' | 'friend_request' | 'challenge' | 'reminder';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'distance' | 'time' | 'pace' | 'streak';
  target: number;
  unit: string;
  participants: string[];
  startDate: Date;
  endDate: Date;
  leaderboard: {
    userId: string;
    progress: number;
    rank: number;
  }[];
  isActive: boolean;
}

export interface AppSettings {
  userId: string;
  notifications: {
    invites: boolean;
    achievements: boolean;
    reminders: boolean;
    challenges: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareStats: boolean;
    showOnlineStatus: boolean;
  };
  units: {
    distance: 'km' | 'miles';
    pace: 'min/km' | 'min/mile';
    temperature: 'celsius' | 'fahrenheit';
  };
  music: {
    autoSync: boolean;
    defaultVolume: number;
    allowHostControl: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

// Tipos para eventos em tempo real
export interface RealTimeEvent {
  type: 'location_update' | 'music_sync' | 'friend_joined' | 'friend_finished';
  userId: string;
  data: any;
  timestamp: Date;
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Tipos para filtros e busca
export interface RunningSessionFilters {
  dateFrom?: Date;
  dateTo?: Date;
  minDistance?: number;
  maxDistance?: number;
  minDuration?: number;
  maxDuration?: number;
  participants?: string[];
  hasMusic?: boolean;
}

export interface FriendSearchFilters {
  name?: string;
  level?: number;
  isOnline?: boolean;
  isRunning?: boolean;
  distance?: number; // proximidade geográfica
} 