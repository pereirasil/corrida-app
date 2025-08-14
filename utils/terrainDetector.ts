// Sistema inteligente para detectar tipos de terreno
export interface TerrainInfo {
  type: 'road' | 'bike_path' | 'park' | 'trail' | 'sidewalk' | 'unknown';
  name?: string;
  color: string;
  width: number;
  opacity: number;
  description: string;
}

export interface TerrainSegment {
  startPoint: number;
  endPoint: number;
  terrain: TerrainInfo;
  confidence: number;
}

// Configurações de cores para diferentes tipos de terreno
export const TERRAIN_COLORS = {
  road: {
    color: '#F26522', // Laranja principal
    width: 4,
    opacity: 0.9,
    description: 'Rua/Estrada'
  },
  bike_path: {
    color: '#10B981', // Verde para ciclovias
    width: 6,
    opacity: 0.95,
    description: 'Ciclovia'
  },
  park: {
    color: '#059669', // Verde escuro para parques
    width: 5,
    opacity: 0.8,
    description: 'Parque/Área Verde'
  },
  trail: {
    color: '#7C3AED', // Roxo para trilhas
    width: 3,
    opacity: 0.7,
    description: 'Trilha'
  },
  sidewalk: {
    color: '#6B7280', // Cinza para calçadas
    width: 2,
    opacity: 0.6,
    description: 'Calçada'
  },
  unknown: {
    color: '#F59E0B', // Amarelo para desconhecido
    width: 3,
    opacity: 0.5,
    description: 'Terreno Desconhecido'
  }
};

// Coordenadas conhecidas de ciclovias (exemplo para São Paulo)
const KNOWN_BIKE_PATHS = [
  {
    name: 'Ciclovia Marginal Pinheiros',
    bounds: {
      north: -23.5500,
      south: -23.6500,
      east: -46.7000,
      west: -46.8000
    },
    path: [
      [-23.5500, -46.7000],
      [-23.5600, -46.7200],
      [-23.5700, -46.7400],
      [-23.5800, -46.7600],
      [-23.5900, -46.7800],
      [-23.6000, -46.8000]
    ]
  },
  {
    name: 'Ciclovia Faria Lima',
    bounds: {
      north: -23.5600,
      south: -23.5800,
      east: -46.6800,
      west: -46.7200
    },
    path: [
      [-23.5600, -46.6800],
      [-23.5650, -46.6900],
      [-23.5700, -46.7000],
      [-23.5750, -46.7100],
      [-23.5800, -46.7200]
    ]
  }
];

// Coordenadas conhecidas de parques
const KNOWN_PARKS = [
  {
    name: 'Parque Ibirapuera',
    bounds: {
      north: -23.5800,
      south: -23.6000,
      east: -46.6500,
      west: -46.6800
    }
  },
  {
    name: 'Parque Villa-Lobos',
    bounds: {
      north: -23.5400,
      south: -23.5600,
      east: -46.7200,
      west: -46.7400
    }
  }
];

// Função para detectar se um ponto está dentro de uma área
function isPointInBounds(
  lat: number, 
  lng: number, 
  bounds: { north: number; south: number; east: number; west: number }
): boolean {
  return lat <= bounds.north && lat >= bounds.south && 
         lng <= bounds.east && lng >= bounds.west;
}

// Função para calcular distância entre dois pontos
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Função para detectar se um ponto está próximo a uma ciclovia
function isNearBikePath(lat: number, lng: number, threshold: number = 50): boolean {
  for (const bikePath of KNOWN_BIKE_PATHS) {
    // Verificar se está dentro dos limites aproximados
    if (isPointInBounds(lat, lng, bikePath.bounds)) {
      // Verificar distância até o caminho da ciclovia
      for (const pathPoint of bikePath.path) {
        const distance = calculateDistance(lat, lng, pathPoint[0], pathPoint[1]);
        if (distance <= threshold) {
          return true;
        }
      }
    }
  }
  return false;
}

// Função para detectar se um ponto está em um parque
function isInPark(lat: number, lng: number): boolean {
  for (const park of KNOWN_PARKS) {
    if (isPointInBounds(lat, lng, park.bounds)) {
      return true;
    }
  }
  return false;
}

// Função principal para detectar tipo de terreno
export function detectTerrain(
  lat: number, 
  lng: number, 
  speed: number,
  previousTerrain?: TerrainInfo
): TerrainInfo {
  // Detectar ciclovia (prioridade alta)
  if (isNearBikePath(lat, lng)) {
    return {
      type: 'bike_path',
      name: 'Ciclovia',
      ...TERRAIN_COLORS.bike_path
    };
  }

  // Detectar parque
  if (isInPark(lat, lng)) {
    return {
      type: 'park',
      name: 'Parque',
      ...TERRAIN_COLORS.park
    };
  }

  // Detectar por velocidade e padrão de movimento
  if (speed > 15) { // Mais de 54 km/h - provavelmente estrada
    return {
      type: 'road',
      name: 'Estrada',
      ...TERRAIN_COLORS.road
    };
  }

  if (speed > 8) { // Entre 8-15 km/h - provavelmente rua
    return {
      type: 'road',
      name: 'Rua',
      ...TERRAIN_COLORS.road
    };
  }

  if (speed > 2) { // Entre 2-8 km/h - pode ser ciclovia ou calçada
    // Se o terreno anterior era ciclovia, manter
    if (previousTerrain?.type === 'bike_path') {
      return {
        type: 'bike_path',
        name: 'Ciclovia',
        ...TERRAIN_COLORS.bike_path
      };
    }
    
    return {
      type: 'sidewalk',
      name: 'Calçada',
      ...TERRAIN_COLORS.sidewalk
    };
  }

  // Velocidade baixa - pode ser trilha ou parque
  return {
    type: 'trail',
    name: 'Trilha',
    ...TERRAIN_COLORS.trail
  };
}

// Função para analisar uma rota completa e detectar segmentos de terreno
export function analyzeRouteTerrain(route: Array<{latitude: number; longitude: number; speed?: number}>): TerrainSegment[] {
  const segments: TerrainSegment[] = [];
  let currentTerrain: TerrainInfo | undefined;
  let segmentStart = 0;

  for (let i = 0; i < route.length; i++) {
    const point = route[i];
    const speed = point.speed || 0;
    
    const detectedTerrain = detectTerrain(
      point.latitude, 
      point.longitude, 
      speed,
      currentTerrain
    );

    // Se o terreno mudou, criar novo segmento
    if (!currentTerrain || currentTerrain.type !== detectedTerrain.type) {
      // Salvar segmento anterior
      if (currentTerrain) {
        segments.push({
          startPoint: segmentStart,
          endPoint: i - 1,
          terrain: currentTerrain,
          confidence: calculateTerrainConfidence(route, segmentStart, i - 1)
        });
      }

      // Iniciar novo segmento
      currentTerrain = detectedTerrain;
      segmentStart = i;
    }
  }

  // Adicionar último segmento
  if (currentTerrain) {
    segments.push({
      startPoint: segmentStart,
      endPoint: route.length - 1,
      terrain: currentTerrain,
      confidence: calculateTerrainConfidence(route, segmentStart, route.length - 1)
    });
  }

  return segments;
}

// Função para calcular confiança da detecção de terreno
function calculateTerrainConfidence(
  route: Array<{latitude: number; longitude: number; speed?: number}>,
  start: number,
  end: number
): number {
  const segment = route.slice(start, end + 1);
  let consistentTerrain = 0;
  let totalPoints = segment.length;

  for (let i = 1; i < segment.length; i++) {
    const prevPoint = segment[i - 1];
    const currPoint = segment[i];
    
    const prevTerrain = detectTerrain(prevPoint.latitude, prevPoint.longitude, prevPoint.speed || 0);
    const currTerrain = detectTerrain(currPoint.latitude, currPoint.longitude, currPoint.speed || 0);
    
    if (prevTerrain.type === currTerrain.type) {
      consistentTerrain++;
    }
  }

  return Math.min(1, consistentTerrain / Math.max(1, totalPoints - 1));
}

// Função para obter cor do terreno baseado no tipo
export function getTerrainColor(type: string): string {
  return TERRAIN_COLORS[type as keyof typeof TERRAIN_COLORS]?.color || TERRAIN_COLORS.unknown.color;
}

// Função para obter configurações completas do terreno
export function getTerrainConfig(type: string): TerrainInfo {
  const config = TERRAIN_COLORS[type as keyof typeof TERRAIN_COLORS];
  if (config) {
    return {
      type: type as TerrainInfo['type'],
      name: config.description,
      ...config
    };
  }
  
  return {
    type: 'unknown',
    name: 'Desconhecido',
    ...TERRAIN_COLORS.unknown
  };
}
