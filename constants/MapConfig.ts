// Configurações para o mapa Leaflet + OpenStreetMap
export const MAP_CONFIG = {
  // Configurações do OpenStreetMap (gratuito)
  TILE_SERVER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '© OpenStreetMap contributors',
  MAX_ZOOM: 19,
  SUBDOMAINS: 'abc',
  
  // Configurações padrão do mapa
  DEFAULT_CENTER: {
    latitude: -23.5505, // São Paulo
    longitude: -46.6333,
  },
  DEFAULT_ZOOM: 15,
  
  // Configurações de estilo
  STYLES: {
    // Cores do tema
    PRIMARY_COLOR: '#F26522',
    PRIMARY_LIGHT: '#FF7A3D',
    ACCENT_COLOR: '#3B82F6',
    SUCCESS_COLOR: '#10B981',
    WARNING_COLOR: '#F59E0B',
    ERROR_COLOR: '#EF4444',
    
    // Estilos dos controles
    ZOOM_CONTROL: {
      background: '#F26522',
      color: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    },
    
    // Estilos dos marcadores
    MARKERS: {
      currentLocation: {
        fill: '#F26522',
        stroke: '#FFFFFF',
        strokeWidth: 3,
        radius: 8,
      },
      routePoint: {
        fill: '#3B82F6',
        stroke: '#FFFFFF',
        strokeWidth: 2,
        radius: 4,
        opacity: 0.7,
      },
      routeLine: {
        color: '#F26522',
        weight: 4,
        opacity: 0.8,
      },
    },
    
    // Estilos do indicador GPS
    GPS_INDICATOR: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '12px 16px',
      minWidth: '120px',
      textAlign: 'center',
    },
  },
  
  // Configurações de performance
  PERFORMANCE: {
    UPDATE_INTERVAL: 1000, // ms
    MIN_DISTANCE_UPDATE: 5, // metros
    MAX_POINTS_IN_MEMORY: 1000,
    CLUSTER_THRESHOLD: 50, // pontos para agrupar
  },
  
  // Configurações de GPS
  GPS: {
    ACCURACY_THRESHOLDS: {
      excellent: 10, // < 10m
      good: 20,      // < 20m
      fair: 50,      // < 50m
      poor: 50,      // >= 50m
    },
    QUALITY_COLORS: {
      excellent: '#10B981',
      good: '#3B82F6',
      fair: '#F59E0B',
      poor: '#EF4444',
    },
    QUALITY_LABELS: {
      excellent: 'Excelente',
      good: 'Boa',
      fair: 'Razoável',
      poor: 'Baixa',
    },
  },
  
  // Configurações de rota
  ROUTE: {
    SMOOTHING: true,
    SIMPLIFICATION_TOLERANCE: 2, // metros
    MAX_POINTS_PER_SEGMENT: 100,
    ANIMATION_DURATION: 300, // ms
  },
  
  // Configurações de interação
  INTERACTION: {
    DRAGGING: true,
    TOUCH_ZOOM: true,
    SCROLL_WHEEL_ZOOM: false,
    DOUBLE_CLICK_ZOOM: true,
    BOX_ZOOM: false,
    KEYBOARD: false,
    TAP: true,
  },
};

// Configurações específicas para diferentes tipos de atividade
export const ACTIVITY_MAP_CONFIGS = {
  running: {
    zoom: 16,
    updateInterval: 1000,
    minDistanceUpdate: 5,
    showPace: true,
    showElevation: true,
  },
  walking: {
    zoom: 15,
    updateInterval: 2000,
    minDistanceUpdate: 10,
    showPace: false,
    showElevation: false,
  },
  cycling: {
    zoom: 14,
    updateInterval: 500,
    minDistanceUpdate: 2,
    showPace: true,
    showElevation: true,
  },
};

export default MAP_CONFIG;
