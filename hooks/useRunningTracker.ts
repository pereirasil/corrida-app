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
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface RunningSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  metrics: RunningMetrics;
  route: LocationPoint[];
  isActive: boolean;
}

export const useRunningTracker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<RunningSession | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        // Obter localização atual
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        setCurrentLocation(location);
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
      Alert.alert('Erro', 'Não foi possível acessar a localização');
    }
  };

  const startRunning = async () => {
    if (locationPermission !== 'granted') {
      Alert.alert('Permissão necessária', 'É necessário permitir o acesso à localização para rastrear a corrida');
      return false;
    }

    try {
      // Iniciar rastreamento de localização
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Atualizar a cada segundo
          distanceInterval: 5, // Atualizar a cada 5 metros
        },
        (location) => {
          setCurrentLocation(location);
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
        },
        route: currentLocation ? [{
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          timestamp: Date.now(),
        }] : [],
        isActive: true,
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
    setCurrentSession(prev => {
      if (!prev || !prev.isActive) return prev;

      const newRoutePoint: LocationPoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      };

      const updatedRoute = [...prev.route, newRoutePoint];
      
      // Calcular nova distância
      let totalDistance = 0;
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
      }

      // Calcular pace e velocidade
      const elapsedTimeHours = prev.metrics.elapsedTime / 3600;
      const pace = elapsedTimeHours > 0 ? (prev.metrics.elapsedTime / 60) / (totalDistance / 1000) : 0;
      const speed = elapsedTimeHours > 0 ? totalDistance / 1000 / elapsedTimeHours : 0;

      // Calcular calorias (estimativa simples)
      const calories = Math.round(totalDistance * 60); // ~60 cal/km

      return {
        ...prev,
        route: updatedRoute,
        metrics: {
          ...prev.metrics,
          distance: totalDistance,
          pace: Math.round(pace * 100) / 100,
          speed: Math.round(speed * 100) / 100,
          calories,
        },
      };
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
    startRunning,
    pauseRunning,
    resumeRunning,
    stopRunning,
    getCurrentMetrics,
    getCurrentRoute,
    formatTime,
    formatPace,
    requestLocationPermission,
  };
}; 