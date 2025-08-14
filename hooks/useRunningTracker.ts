import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useResourceManager, RESOURCE_PRIORITIES } from './useResourceManager';

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
  const [gpsError, setGpsError] = useState<string>('');
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<LocationPoint | null>(null);
  const accuracyBuffer = useRef<number[]>([]);
  const stepsRef = useRef<number>(0);
  const lastDistanceRef = useRef<number>(0);
  const stepCountIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gpsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Gerenciador de recursos para evitar conflitos
  const resourceManager = useResourceManager();
  const gpsResourceId = useRef<string>('gps-tracking-' + Date.now());

  // Configurações de GPS de alta precisão
  const GPS_CONFIG = {
    accuracy: Location.Accuracy.Balanced, // Mudado para Balanced para melhor compatibilidade
    timeInterval: 1000, // Atualizar a cada 1 segundo
    distanceInterval: 5, // Atualizar a cada 5 metros
    maxAccuracy: 20, // Máximo 20 metros de erro (mais permissivo)
    minAccuracy: 5, // Mínimo 5 metros de erro
    qualityThresholds: {
      excellent: 10, // < 10m = excelente
      good: 20,      // < 20m = bom
      fair: 50,      // < 50m = razoável
      poor: 50       // >= 50m = ruim
    },
    timeout: 30000, // 30 segundos para timeout do GPS
  };

  // Configurações para contagem de passos
  const STEP_CONFIG = {
    baseStepLength: 0.75, // metros por passo (média para corrida)
    minStepDistance: 0.3, // distância mínima para considerar um passo
    maxStepDistance: 1.2, // distância máxima para considerar um passo
    speedFactors: {
      walking: { min: 0, max: 2, stepLength: 0.6 },
      jogging: { min: 2, max: 5, stepLength: 0.7 },
      running: { min: 5, max: 8, stepLength: 0.8 },
      sprinting: { min: 8, max: 15, stepLength: 0.9 },
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
      if (stepCountIntervalRef.current) {
        clearInterval(stepCountIntervalRef.current);
      }
      if (gpsTimeoutRef.current) {
        clearTimeout(gpsTimeoutRef.current);
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      console.log('Solicitando permissões de localização...');
      
      // Solicitar permissões de localização
      const foregroundStatus = await Location.requestForegroundPermissionsAsync();
      console.log('Status permissão foreground:', foregroundStatus.status);
      
      setLocationPermission(foregroundStatus.status);
      
      if (foregroundStatus.status === 'granted') {
        console.log('Permissão concedida, verificando serviços...');
        
        // Verificar se os serviços de localização estão habilitados
        const isLocationEnabled = await Location.hasServicesEnabledAsync();
        console.log('Serviços de localização habilitados:', isLocationEnabled);
        
        if (!isLocationEnabled) {
          setGpsError('Serviços de localização desabilitados');
          Alert.alert(
            'Serviços de Localização Desabilitados',
            'Por favor, habilite os serviços de localização nas configurações do seu dispositivo para usar o GPS.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Configurações', onPress: () => {
                // Abrir configurações do dispositivo
                if (Platform.OS === 'ios') {
                  // Para iOS, não há método direto, mas podemos mostrar instruções
                  Alert.alert(
                    'Habilitar Localização',
                    'Vá em Configurações > Privacidade > Localização e habilite para este app.'
                  );
                }
              }},
            ]
          );
          return;
        }
        
        // Tentar obter localização atual
        await getCurrentLocation();
        
      } else {
        setGpsError('Permissão de localização negada');
        console.log('Permissão negada:', foregroundStatus.status);
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
      setGpsError('Erro ao solicitar permissão');
      Alert.alert('Erro', 'Não foi possível acessar a localização');
    }
  };

  const getCurrentLocation = async () => {
    try {
      console.log('Obtendo localização atual...');
      setGpsStatus('searching');
      setGpsError('');
      
      // Configurar timeout para GPS
      gpsTimeoutRef.current = setTimeout(() => {
        if (gpsStatus === 'searching') {
          console.log('Timeout do GPS - usando localização padrão');
          setGpsError('GPS lento - usando localização padrão');
          setGpsStatus('acquired');
          
          // Usar localização padrão (São Paulo)
          const defaultLocation: Location.LocationObject = {
            coords: {
              latitude: -23.5505,
              longitude: -46.6333,
              accuracy: 100,
              altitude: 760,
              speed: 0,
              heading: 0,
              altitudeAccuracy: 10,
            },
            timestamp: Date.now(),
          };
          
          setCurrentLocation(defaultLocation);
          setGpsStatus('acquired');
        }
      }, GPS_CONFIG.timeout);

      // Tentar obter localização com diferentes configurações
      let location: Location.LocationObject | null = null;
      
      try {
        // Primeira tentativa: alta precisão
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 10,
        });
        console.log('Localização obtida com alta precisão');
      } catch (error) {
        console.log('Falha na alta precisão, tentando precisão média...');
        
        try {
          // Segunda tentativa: precisão média
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
            distanceInterval: 20,
          });
          console.log('Localização obtida com precisão média');
        } catch (error2) {
          console.log('Falha na precisão média, tentando precisão baixa...');
          
          try {
            // Terceira tentativa: precisão baixa
            location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Low,
              timeInterval: 15000,
              distanceInterval: 50,
            });
            console.log('Localização obtida com precisão baixa');
          } catch (error3) {
            console.log('Todas as tentativas falharam, usando localização padrão');
            throw new Error('GPS não disponível');
          }
        }
      }

      if (location) {
        console.log('Localização obtida com sucesso:', {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy
        });
        
        setCurrentLocation(location);
        setGpsStatus('acquired');
        setGpsError('');
        
        // Limpar timeout
        if (gpsTimeoutRef.current) {
          clearTimeout(gpsTimeoutRef.current);
          gpsTimeoutRef.current = null;
        }
        
        // Inicializar buffer de precisão
        if (location.coords.accuracy) {
          accuracyBuffer.current = [location.coords.accuracy];
        }
      }
      
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      setGpsError('Erro ao obter localização');
      
      // Usar localização padrão como fallback
      const defaultLocation: Location.LocationObject = {
        coords: {
          latitude: -23.5505,
          longitude: -46.6333,
          accuracy: 100,
          altitude: 760,
          speed: 0,
          heading: 0,
          altitudeAccuracy: 10,
        },
        timestamp: Date.now(),
      };
      
      setCurrentLocation(defaultLocation);
      setGpsStatus('acquired');
    }
  };

  const calculateStepsFromMovement = (currentDistance: number, speed: number): number => {
    let stepLength = STEP_CONFIG.baseStepLength;
    
    if (speed <= STEP_CONFIG.speedFactors.walking.max) {
      stepLength = STEP_CONFIG.speedFactors.walking.stepLength;
    } else if (speed <= STEP_CONFIG.speedFactors.jogging.max) {
      stepLength = STEP_CONFIG.speedFactors.jogging.stepLength;
    } else if (speed <= STEP_CONFIG.speedFactors.running.max) {
      stepLength = STEP_CONFIG.speedFactors.running.stepLength;
    } else {
      stepLength = STEP_CONFIG.speedFactors.sprinting.stepLength;
    }

    const distanceDiff = currentDistance - lastDistanceRef.current;
    
    if (distanceDiff >= STEP_CONFIG.minStepDistance && distanceDiff <= STEP_CONFIG.maxStepDistance) {
      const newSteps = Math.round(distanceDiff / stepLength);
      stepsRef.current += newSteps;
    }
    
    lastDistanceRef.current = currentDistance;
    return stepsRef.current;
  };

  const startStepCounting = () => {
    stepCountIntervalRef.current = setInterval(() => {
      if (currentSession && isRunning) {
        const currentMetrics = currentSession.metrics;
        const speed = currentMetrics.speed;
        
        const newSteps = calculateStepsFromMovement(currentMetrics.distance, speed);
        
        setCurrentSession(prev => {
          if (!prev || !prev.isActive) return prev;
          
          return {
            ...prev,
            metrics: {
              ...prev.metrics,
              steps: newSteps,
            },
          };
        });
      }
    }, 1000);
    
    console.log('Contagem de passos iniciada');
  };

  const stopStepCounting = () => {
    if (stepCountIntervalRef.current) {
      clearInterval(stepCountIntervalRef.current);
      stepCountIntervalRef.current = null;
      console.log('Contagem de passos parada');
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

    if (quality === 'poor') {
      return null;
    }

    if (lastLocationRef.current) {
      const distance = calculateDistance(
        lastLocationRef.current.latitude,
        lastLocationRef.current.longitude,
        newLocation.coords.latitude,
        newLocation.coords.longitude
      );
      
      const timeDiff = (newLocation.timestamp - lastLocationRef.current.timestamp) / 1000;
      const speed = distance / timeDiff;
      
      if (speed > 15) { // Aumentado para 15 m/s (54 km/h)
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
      // Verificar se podemos ativar o GPS sem conflitos
      if (!resourceManager.canActivateResource('gps', RESOURCE_PRIORITIES.GPS_TRACKING)) {
        Alert.alert(
          'Recurso em Uso',
          'Outro recurso está usando o GPS. Aguarde um momento ou pare a música para liberar o recurso.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Parar Música', onPress: () => {
              // Aqui você pode chamar uma função para parar a música
              console.log('Solicitando parada da música para liberar GPS');
            }}
          ]
        );
        return false;
      }

      // Registrar o recurso GPS
      if (!resourceManager.registerResource(gpsResourceId.current, 'gps', RESOURCE_PRIORITIES.GPS_TRACKING)) {
        Alert.alert('Erro', 'Não foi possível ativar o GPS devido a conflitos de recursos');
        return false;
      }

      // Verificar se temos alguma localização
      if (!currentLocation) {
        console.log('Nenhuma localização disponível, tentando obter...');
        await getCurrentLocation();
        
        if (!currentLocation) {
          Alert.alert('GPS não disponível', 'Não foi possível obter sua localização. Tente novamente.');
          resourceManager.deactivateResource(gpsResourceId.current);
          return false;
        }
      }

      console.log('Iniciando rastreamento de corrida...');
      
      // Iniciar rastreamento de localização
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: GPS_CONFIG.accuracy,
          timeInterval: GPS_CONFIG.timeInterval,
          distanceInterval: GPS_CONFIG.distanceInterval,
        },
        (location) => {
          setCurrentLocation(location);
          
          if (location.coords.accuracy && location.coords.accuracy <= GPS_CONFIG.maxAccuracy) {
            setGpsStatus('acquired');
            setGpsError('');
          } else {
            setGpsStatus('lost');
            setGpsError('GPS de baixa precisão');
          }
          
          if (currentSession && isRunning) {
            updateSessionWithLocation(location);
          }
        }
      );

      // Iniciar contagem de passos
      startStepCounting();

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

      console.log('Corrida iniciada com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao iniciar corrida:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o rastreamento da corrida');
      
      // Limpar recursos em caso de erro
      resourceManager.deactivateResource(gpsResourceId.current);
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

    if (stepCountIntervalRef.current) {
      stopStepCounting();
    }

    // Desativar o recurso GPS
    resourceManager.deactivateResource(gpsResourceId.current);

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
    const smoothedLocation = smoothLocationData(location);
    if (!smoothedLocation) return;

    setCurrentSession(prev => {
      if (!prev || !prev.isActive) return prev;

      const updatedRoute = [...prev.route, smoothedLocation];
      
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
        
        if (prevPoint.altitude && currentPoint.altitude) {
          const elevationDiff = currentPoint.altitude - prevPoint.altitude;
          if (elevationDiff > 0) {
            elevationGain += elevationDiff;
          } else {
            elevationLoss += Math.abs(elevationDiff);
          }
        }
        
        totalAccuracy += currentPoint.accuracy;
        if (currentPoint.quality === 'excellent' || currentPoint.quality === 'good') {
          accuratePoints++;
        }
      }

      const elapsedTimeHours = prev.metrics.elapsedTime / 3600;
      const pace = elapsedTimeHours > 0 ? (prev.metrics.elapsedTime / 60) / (totalDistance / 1000) : 0;
      const speed = elapsedTimeHours > 0 ? totalDistance / 1000 / elapsedTimeHours : 0;

      const calories = Math.round(totalDistance * 65 + (elevationGain * 0.1));

      const averageAccuracy = totalAccuracy / updatedRoute.length;
      const gpsQuality = getGpsQuality(averageAccuracy);

      const currentSteps = calculateStepsFromMovement(totalDistance, speed);

      return {
        ...prev,
        route: updatedRoute,
        metrics: {
          ...prev.metrics,
          distance: totalDistance,
          pace: Math.round(pace * 100) / 100,
          speed: Math.round(speed * 100) / 100,
          calories,
          steps: currentSteps,
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
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
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

  const retryGps = async () => {
    console.log('Tentando reconectar GPS...');
    setGpsStatus('searching');
    setGpsError('');
    await getCurrentLocation();
  };

  return {
    isRunning,
    currentSession,
    locationPermission,
    currentLocation,
    gpsStatus,
    gpsError,
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
    retryGps,
    getGpsQuality,
  };
}; 