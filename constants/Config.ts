// Configuração centralizada do app
export const APP_CONFIG = {
  // Configurações da API
  API: {
    // Em desenvolvimento, usar IP da máquina para dispositivos móveis
    BASE_URL: __DEV__ 
      ? 'http://192.168.0.127:3001' 
      : 'https://sua-api-producao.com',
    
    // Timeout das requisições (em ms)
    TIMEOUT: 10000,
    
    // Headers padrão
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  
  // Configurações do app
  APP: {
    NAME: 'Corrida App',
    VERSION: '1.0.0',
    BUILD: '1',
    
    // Configurações de localização
    LOCATION: {
      ACCURACY: 'high',
      DISTANCE_FILTER: 10, // metros
      UPDATE_INTERVAL: 1000, // ms
    },
    
    // Configurações de música
    MUSIC: {
      SYNC_INTERVAL: 5000, // ms
      MAX_PLAYLIST_SIZE: 100,
    },
  },
  
  // Configurações de armazenamento
  STORAGE: {
    // Chaves para AsyncStorage
    KEYS: {
      AUTH_TOKEN: 'auth_token',
      USER_DATA: 'user_data',
      APP_SETTINGS: 'app_settings',
      RUNNING_DATA: 'running_data',
    },
    
    // Tamanho máximo de cache (em MB)
    MAX_CACHE_SIZE: 50,
  },
  
  // Configurações de notificações
  NOTIFICATIONS: {
    // IDs das notificações
    CHANNELS: {
      RUNNING: 'running_notifications',
      SOCIAL: 'social_notifications',
      ACHIEVEMENTS: 'achievement_notifications',
    },
    
    // Configurações de som
    SOUND: {
      RUN_START: 'run_start.mp3',
      RUN_FINISH: 'run_finish.mp3',
      ACHIEVEMENT: 'achievement.mp3',
    },
  },
  
  // Configurações de validação
  VALIDATION: {
    // Regras de senha
    PASSWORD: {
      MIN_LENGTH: 6,
      REQUIRE_UPPERCASE: false,
      REQUIRE_NUMBERS: false,
      REQUIRE_SPECIAL: false,
    },
    
    // Regras de nome de usuário
    USERNAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 20,
      ALLOWED_CHARS: /^[a-zA-Z0-9_]+$/,
    },
    
    // Regras de email
    EMAIL: {
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    
    // Regras de telefone
    PHONE: {
      PATTERN: /^[0-9]{10,11}$/,
    },
  },
  
  // Configurações de UI
  UI: {
    // Cores padrão
    COLORS: {
      PRIMARY: '#16a34a',
      SECONDARY: '#0891b2',
      SUCCESS: '#059669',
      WARNING: '#d97706',
      ERROR: '#dc2626',
      INFO: '#2563eb',
    },
    
    // Tamanhos padrão
    SIZES: {
      BORDER_RADIUS: 12,
      PADDING: 16,
      MARGIN: 16,
      ICON_SIZE: 24,
    },
    
    // Animações
    ANIMATIONS: {
      DURATION: 300,
      EASING: 'ease-in-out',
    },
  },
};

// Função para obter configuração específica
export const getConfig = (path: string) => {
  const keys = path.split('.');
  let value: any = APP_CONFIG;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
};

// Função para verificar se está em desenvolvimento
export const isDevelopment = () => __DEV__;

// Função para verificar se está em produção
export const isProduction = () => !__DEV__; 