import { APP_CONFIG } from './Config';

// Configuração da API
export const API_CONFIG = {
  // URL base da API
  BASE_URL: APP_CONFIG.API.BASE_URL,
  
  // Endpoints de autenticação
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
    CHANGE_PASSWORD: '/api/auth/change-password',
    LOGOUT: '/api/auth/logout',
  },
  
  // Endpoints de usuários
  USERS: {
    PROFILE: '/api/users/profile',
    STATS: '/api/users/stats',
    RUNS: '/api/users/runs',
    SEARCH: '/api/users/search',
  },
  
  // Endpoints de corridas
  RUNNING: {
    SESSIONS: '/api/running/sessions',
    POINTS: '/api/running/sessions/:id/points',
    ROUTE: '/api/running/sessions/:id/route',
    GROUP_JOIN: '/api/running/sessions/:id/join',
    GROUP_LEAVE: '/api/running/sessions/:id/leave',
  },
  
  // Endpoints de música
  MUSIC: {
    SESSIONS: '/api/music/sessions',
    JOIN: '/api/music/sessions/:id/join',
    LEAVE: '/api/music/sessions/:id/leave',
    PLAYLIST: '/api/music/sessions/:id/playlist',
    CONTROL: '/api/music/sessions/:id/control',
  },
  
  // Endpoints de amigos
  FRIENDS: {
    REQUESTS: '/api/friends/requests',
    LIST: '/api/friends/list',
    BLOCK: '/api/friends/block/:userId',
    UNBLOCK: '/api/friends/unblock/:userId',
  },
  
  // Endpoints de conquistas
  ACHIEVEMENTS: {
    USER: '/api/achievements/user',
    CHALLENGES: '/api/achievements/challenges',
    JOIN_CHALLENGE: '/api/achievements/challenges/:id/join',
    PROGRESS: '/api/achievements/challenges/:id/progress',
  },
};

// Função para construir URLs completas
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};

// Função para obter headers de autenticação
export const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

// Função para obter headers básicos
export const getBasicHeaders = () => ({
  'Content-Type': 'application/json',
}); 