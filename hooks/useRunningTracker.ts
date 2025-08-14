import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

export interface RunningMetrics {
  distance: number;
  elapsedTime: number;
  pace: number;
  speed: number;
  calories: number;
  steps: number;
  elevation: number;
  elevationGain: number;
  elevationLoss: number;
  accuracy: number;
  gpsQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface RunningSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  metrics: RunningMetrics;
  route: LocationPoint[];
  isActive: boolean;
  gpsStats: {
    totalPoints: number;
    accuratePoints: number;
    averageAccuracy: number;
    signalStrength: number;
  };
}

export const useRunningTracker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<RunningSession | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'acquired' | 'lost'>('searching');
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<LocationPoint | null>(null);
  const accuracyBuffer = useRef<number[]>([]);

  // Configurações de GPS de alta precisão
  const GPS_CONFIG = {
    accuracy: Location.Accuracy.BestForNavigation, // Máxima precisão
    timeInterval: 500, // Atualizar a cada 500ms para maior frequência
    distanceInterval: 2, // Atualizar a cada 2 metros para maior precisão
    maxAccuracy: 10, // Máximo 10 metros de erro
    minAccuracy: 3, // Mínimo 3 metros de erro (ideal)
    qualityThresholds: {
      excellent: 5, // < 5m = excelente
      good: 10,     // < 10m = bom
      fair: 20,     // < 20m = razoável
      poor: 20      // >= 20m = ruim
    }
  };

  // Solicitar permissões de localização
  useEffect(() => {
    requestLocationPermission();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      // Solicitar permissões de localização em primeiro plano e segundo plano
      const foregroundStatus = await Location.requestForegroundPermissionsAsync();
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      
      setLocationPermission(foregroundStatus.status);
      
      if (foregroundStatus.status === 'granted') {
        // Verificar se os serviços de localização estão habilitados
        const isLocationEnabled = await Location.hasServicesEnabledAsync();
        
        if (!isLocationEnabled) {
          Alert.alert(
            'Serviços de Localização Desabilitados',
            'Por favor, habilite os serviços de localização nas configurações do seu dispositivo para usar o GPS de alta precisão.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Configurações', onPress: () => Location.openSettings() }
            ]
          );
          return;
        }
        
        // Obter localização atual com alta precisão
        const location = await Location.getCurrentPositionAsync({
          accuracy: GPS_CONFIG.accuracy,
          timeInterval: 1000,
          distanceInterval: 1,
        });
        
        setCurrentLocation(location);
        setGpsStatus('acquired');
        
        // Inicializar buffer de precisão
        if (location.coords.accuracy) {
          accuracyBuffer.current = [location.coords.accuracy];
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
      Alert.alert('Erro', 'Não foi possível acessar a localização');
    }
  };

  const getGpsQuality = (accuracy: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (accuracy <= GPS_CONFIG.qualityThresholds.excellent) return 'excellent';
    if (accuracy <= GPS_CONFIG.qualityThresholds.good) return 'good';
    if (accuracy <= GPS_CONFIG.qualityThresholds.fair) return 'fair';
    return 'poor';
  };

  const isLocationAccurate = (location: Location.LocationObject): boolean => {
    const accuracy = location.coords.accuracy || 999;
    return accuracy <= GPS_CONFIG.maxAccuracy;
  };

  const smoothLocationData = (newLocation: Location.LocationObject): LocationPoint | null => {
    if (!lastLocationRef.current) {
      return createLocationPoint(newLocation);
    }

    const accuracy = newLocation.coords.accuracy || 999;
    const quality = getGpsQuality(accuracy);

    // Filtrar pontos com baixa precisão
    if (quality === 'poor') {
      return null;
    }

    // Aplicar filtro de velocidade para detectar outliers
    if (lastLocationRef.current) {
      const distance = calculateDistance(
        lastLocationRef.current.latitude,
        lastLocationRef.current.longitude,
        newLocation.coords.latitude,
        newLocation.coords.longitude
      );
      
      const timeDiff = (newLocation.timestamp - lastLocationRef.current.timestamp) / 1000;
      const speed = distance / timeDiff; // m/s
      
      // Filtrar velocidades impossíveis (> 10 m/s = 36 km/h para corrida)
      if (speed > 10) {
        return null;
      }
    }

    return createLocationPoint(newLocation);
  };

  const createLocationPoint = (location: Location.LocationObject): LocationPoint => {
    const accuracy = location.coords.accuracy || 999;
    const quality = getGpsQuality(accuracy);
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
      accuracy,
      altitude: location.coords.altitude || undefined,
      speed: location.coords.speed || undefined,
      heading: location.coords.heading || undefined,
      quality,
    };
  };

  const startRunning = async () => {
    if (locationPermission !== 'granted') {
      Alert.alert('Permissão necessária', 'É necessário permitir o acesso à localização para rastrear a corrida');
      return false;
    }

    try {
      // Verificar se o GPS está funcionando
      if (gpsStatus !== 'acquired') {
        Alert.alert('GPS não disponível', 'Aguardando sinal GPS. Aguarde alguns segundos e tente novamente.');
        return false;
      }

      // Verificar se os serviços de localização ainda estão habilitados
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        Alert.alert(
          'Serviços de Localização Desabilitados',
          'Os serviços de localização foram desabilitados. Por favor, habilite-os nas configurações.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurações', onPress: () => Location.openSettings() }
          ]
        );
        return false;
      }

      // Iniciar rastreamento de localização com alta precisão
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: GPS_CONFIG.accuracy,
          timeInterval: GPS_CONFIG.timeInterval,
          distanceInterval: GPS_CONFIG.distanceInterval,
          showsBackgroundLocationIndicator: true,
        },
        (location) => {
          setCurrentLocation(location);
          
          // Atualizar status do GPS
          if (location.coords.accuracy && location.coords.accuracy <= GPS_CONFIG.maxAccuracy) {
            setGpsStatus('acquired');
          } else {
            setGpsStatus('lost');
          }
          
          if (currentSession && isRunning) {
            updateSessionWithLocation(location);
          }
        }
      );

      // Criar nova sessão
      const newSession: RunningSession = {
        id: Date.now().toString(),
        startTime: new Date(),
        metrics: {
          distance: 0,
          elapsedTime: 0,
          pace: 0,
          speed: 0,
          calories: 0,
          steps: 0,
          elevation: 0,
          elevationGain: 0,
          elevationLoss: 0,
          accuracy: 0,
          gpsQuality: 'good',
        },
        route: currentLocation ? [createLocationPoint(currentLocation)] : [],
        isActive: true,
        gpsStats: {
          totalPoints: 0,
          accuratePoints: 0,
          averageAccuracy: 0,
          signalStrength: 0,
        },
      };

      setCurrentSession(newSession);
      setIsRunning(true);

      // Iniciar timer
      intervalRef.current = setInterval(() => {
        setCurrentSession(prev => {
          if (prev && prev.isActive) {
            return {
              ...prev,
              metrics: {
                ...prev.metrics,
                elapsedTime: prev.metrics.elapsedTime + 1,
              },
            };
          }
          return prev;
        });
      }, 1000);

      return true;
    } catch (error) {
      console.error('Erro ao iniciar corrida:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o rastreamento da corrida');
      return false;
    }
  };

  const pauseRunning = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    
    setCurrentSession(prev => {
      if (prev) {
        return { ...prev, isActive: false };
      }
      return prev;
    });
  };

  const resumeRunning = () => {
    setIsRunning(true);
    
    setCurrentSession(prev => {
      if (prev) {
        return { ...prev, isActive: true };
      }
      return prev;
    });

    // Reiniciar timer
    intervalRef.current = setInterval(() => {
      setCurrentSession(prev => {
        if (prev && prev.isActive) {
          return {
            ...prev,
            metrics: {
              ...prev.metrics,
              elapsedTime: prev.metrics.elapsedTime + 1,
            },
          };
        }
        return prev;
      });
    }, 1000);
  };

  const stopRunning = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
    
    setCurrentSession(prev => {
      if (prev) {
        return {
          ...prev,
          endTime: new Date(),
          isActive: false,
        };
      }
      return prev;
    });
  };

  const updateSessionWithLocation = (location: Location.LocationObject) => {
    // Aplicar filtros de qualidade
    const smoothedLocation = smoothLocationData(location);
    if (!smoothedLocation) return;

    setCurrentSession(prev => {
      if (!prev || !prev.isActive) return prev;

      const updatedRoute = [...prev.route, smoothedLocation];
      
      // Calcular nova distância com algoritmo melhorado
      let totalDistance = 0;
      let elevationGain = 0;
      let elevationLoss = 0;
      let totalAccuracy = 0;
      let accuratePoints = 0;
      
      for (let i = 1; i < updatedRoute.length; i++) {
        const prevPoint = updatedRoute[i - 1];
        const currentPoint = updatedRoute[i];
        
        const distance = calculateDistance(
          prevPoint.latitude,
          prevPoint.longitude,
          currentPoint.latitude,
          currentPoint.longitude
        );
        
        totalDistance += distance;
        
        // Calcular elevação
        if (prevPoint.altitude && currentPoint.altitude) {
          const elevationDiff = currentPoint.altitude - prevPoint.altitude;
          if (elevationDiff > 0) {
            elevationGain += elevationDiff;
          } else {
            elevationLoss += Math.abs(elevationDiff);
          }
        }
        
        // Estatísticas de precisão
        totalAccuracy += currentPoint.accuracy;
        if (currentPoint.quality === 'excellent' || currentPoint.quality === 'good') {
          accuratePoints++;
        }
      }

      // Calcular pace e velocidade
      const elapsedTimeHours = prev.metrics.elapsedTime / 3600;
      const pace = elapsedTimeHours > 0 ? (prev.metrics.elapsedTime / 60) / (totalDistance / 1000) : 0;
      const speed = elapsedTimeHours > 0 ? totalDistance / 1000 / elapsedTimeHours : 0;

      // Calcular calorias (estimativa mais precisa)
      const calories = Math.round(totalDistance * 65 + (elevationGain * 0.1)); // 65 cal/km + bônus de elevação

      // Determinar qualidade geral do GPS
      const averageAccuracy = totalAccuracy / updatedRoute.length;
      const gpsQuality = getGpsQuality(averageAccuracy);

      return {
        ...prev,
        route: updatedRoute,
        metrics: {
          ...prev.metrics,
          distance: totalDistance,
          pace: Math.round(pace * 100) / 100,
          speed: Math.round(speed * 100) / 100,
          calories,
          elevation: smoothedLocation.altitude || 0,
          elevationGain: Math.round(elevationGain),
          elevationLoss: Math.round(elevationLoss),
          accuracy: Math.round(averageAccuracy * 100) / 100,
          gpsQuality,
        },
        gpsStats: {
          totalPoints: updatedRoute.length,
          accuratePoints,
          averageAccuracy: Math.round(averageAccuracy * 100) / 100,
          signalStrength: Math.round((accuratePoints / updatedRoute.length) * 100),
        },
      };
    });

    lastLocationRef.current = smoothedLocation;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Fórmula de Haversine para cálculo preciso de distância
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
  };

  const getCurrentMetrics = (): RunningMetrics | null => {
    return currentSession?.metrics || null;
  };

  const getCurrentRoute = (): LocationPoint[] => {
    return currentSession?.route || [];
  };

  const getGpsStats = () => {
    return currentSession?.gpsStats || null;
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (secondsPerKm: number): string => {
    const mins = Math.floor(secondsPerKm / 60);
    const secs = Math.round(secondsPerKm % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRunning,
    currentSession,
    locationPermission,
    currentLocation,
    gpsStatus,
    startRunning,
    pauseRunning,
    resumeRunning,
    stopRunning,
    getCurrentMetrics,
    getCurrentRoute,
    getGpsStats,
    formatTime,
    formatPace,
    requestLocationPermission,
  };
}; 