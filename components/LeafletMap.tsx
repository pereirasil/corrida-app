import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  speed?: number;
}

interface LeafletMapProps {
  currentLocation: LocationPoint | null;
  route: LocationPoint[];
  isRunning: boolean;
  onMapReady?: () => void;
}

const { width, height } = Dimensions.get('window');

export const LeafletMap: React.FC<LeafletMapProps> = ({
  currentLocation,
  route,
  isRunning,
  onMapReady,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);

  // HTML do mapa Leaflet com detecção de terreno
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>Corrida App - Mapa Inteligente</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #map { 
          width: 100%; 
          height: 100vh; 
          z-index: 1;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        .leaflet-control-zoom a {
          background: #F26522 !important;
          color: #FFFFFF !important;
          border: none !important;
          border-radius: 8px !important;
          margin: 2px !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 30px !important;
          font-size: 18px !important;
          font-weight: bold !important;
        }
        .leaflet-control-zoom a:hover {
          background: #E55A1A !important;
        }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.8) !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
          font-size: 10px !important;
        }
        .gps-indicator {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255,255,255,0.95);
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          font-size: 14px;
          font-weight: 600;
          min-width: 120px;
          text-align: center;
        }
        .gps-excellent { color: #10B981; }
        .gps-good { color: #3B82F6; }
        .gps-fair { color: #F59E0B; }
        .gps-poor { color: #EF4444; }
        .current-location {
          fill: #F26522;
          stroke: #FFFFFF;
          stroke-width: 3;
          r: 8;
        }
        .route-point {
          fill: #3B82F6;
          stroke: #FFFFFF;
          stroke-width: 2;
          r: 4;
          opacity: 0.7;
        }
        .terrain-legend {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(255,255,255,0.95);
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          font-size: 12px;
          min-width: 200px;
        }
        .terrain-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .terrain-color {
          width: 16px;
          height: 4px;
          margin-right: 8px;
          border-radius: 2px;
        }
        .terrain-name {
          color: #374151;
          font-weight: 500;
        }
        .terrain-stats {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(255,255,255,0.95);
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          font-size: 12px;
          min-width: 150px;
        }
        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .stat-label {
          color: #6B7280;
        }
        .stat-value {
          color: #374151;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <!-- Indicador GPS -->
      <div id="gps-indicator" class="gps-indicator" style="display: none;">
        <div id="gps-status">GPS</div>
        <div id="gps-accuracy">--</div>
      </div>
      
      <!-- Legenda de Terrenos -->
      <div id="terrain-legend" class="terrain-legend" style="display: none;">
        <div style="font-weight: 600; margin-bottom: 12px; color: #111827;">Tipos de Terreno</div>
        <div class="terrain-item">
          <div class="terrain-color" style="background: #F26522;"></div>
          <span class="terrain-name">Rua/Estrada</span>
        </div>
        <div class="terrain-item">
          <div class="terrain-color" style="background: #10B981;"></div>
          <span class="terrain-name">Ciclovia</span>
        </div>
        <div class="terrain-item">
          <div class="terrain-color" style="background: #059669;"></div>
          <span class="terrain-name">Parque</span>
        </div>
        <div class="terrain-item">
          <div class="terrain-color" style="background: #7C3AED;"></div>
          <span class="terrain-name">Trilha</span>
        </div>
        <div class="terrain-item">
          <div class="terrain-color" style="background: #6B7280;"></div>
          <span class="terrain-name">Calçada</span>
        </div>
      </div>
      
      <!-- Estatísticas da Rota -->
      <div id="terrain-stats" class="terrain-stats" style="display: none;">
        <div style="font-weight: 600; margin-bottom: 12px; color: #111827;">Estatísticas</div>
        <div class="stat-item">
          <span class="stat-label">Distância Total:</span>
          <span id="total-distance" class="stat-value">0.00 km</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Tempo:</span>
          <span id="total-time" class="stat-value">00:00:00</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Velocidade:</span>
          <span id="current-speed" class="stat-value">0.0 km/h</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Terreno Atual:</span>
          <span id="current-terrain" class="stat-value">--</span>
        </div>
      </div>
      
      <script>
        let map;
        let currentMarker;
        let routeLayer;
        let terrainLayers = new Map(); // Camadas separadas por tipo de terreno
        let routePoints = [];
        let terrainSegments = [];
        let isInitialized = false;
        let lastUpdateTime = Date.now();
        
        // Configurações de cores para diferentes tipos de terreno
        const TERRAIN_COLORS = {
          road: { color: '#F26522', width: 4, opacity: 0.9 },
          bike_path: { color: '#10B981', width: 6, opacity: 0.95 },
          park: { color: '#059669', width: 5, opacity: 0.8 },
          trail: { color: '#7C3AED', width: 3, opacity: 0.7 },
          sidewalk: { color: '#6B7280', width: 2, opacity: 0.6 },
          unknown: { color: '#F59E0B', width: 3, opacity: 0.5 }
        };
        
        // Função para detectar tipo de terreno (simplificada para o WebView)
        function detectTerrain(lat, lng, speed) {
          // Lógica simplificada baseada em coordenadas conhecidas
          if (lat >= -23.5500 && lat <= -23.6500 && lng >= -46.7000 && lng <= -46.8000) {
            return 'bike_path'; // Ciclovia Marginal Pinheiros
          }
          if (lat >= -23.5600 && lat <= -23.5800 && lng >= -46.6800 && lng <= -46.7200) {
            return 'bike_path'; // Ciclovia Faria Lima
          }
          if (lat >= -23.5800 && lat <= -23.6000 && lng >= -46.6500 && lng <= -46.6800) {
            return 'park'; // Parque Ibirapuera
          }
          if (lat >= -23.5400 && lat <= -23.5600 && lng >= -46.7200 && lng <= -46.7400) {
            return 'park'; // Parque Villa-Lobos
          }
          
          // Detectar por velocidade
          if (speed > 15) return 'road';
          if (speed > 8) return 'road';
          if (speed > 2) return 'sidewalk';
          return 'trail';
        }
        
        // Inicializar mapa
        function initMap() {
          const defaultLat = -23.5505;
          const defaultLng = -46.6333;
          
          map = L.map('map', {
            center: [defaultLat, defaultLng],
            zoom: 15,
            zoomControl: true,
            attributionControl: true,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: false,
            doubleClickZoom: true,
            boxZoom: false,
            keyboard: false,
            tap: true,
          });
          
          // Adicionar tiles do OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            subdomains: 'abc',
          }).addTo(map);
          
          // Inicializar camadas de terreno
          Object.keys(TERRAIN_COLORS).forEach(terrainType => {
            terrainLayers.set(terrainType, L.layerGroup().addTo(map));
          });
          
          // Camada para a rota geral
          routeLayer = L.layerGroup().addTo(map);
          
          // Marcador da localização atual
          currentMarker = L.circleMarker([defaultLat, defaultLng], {
            className: 'current-location',
            zIndexOffset: 1000,
          }).addTo(map);
          
          currentMarker.bindPopup('<b>Sua Localização</b><br>GPS inicializando...');
          
          isInitialized = true;
          
          // Mostrar legenda e estatísticas
          document.getElementById('terrain-legend').style.display = 'block';
          document.getElementById('terrain-stats').style.display = 'block';
          
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapReady',
              success: true
            }));
          }
        }
        
        // Atualizar localização atual
        function updateCurrentLocation(lat, lng, accuracy, quality, speed = 0) {
          if (!isInitialized) return;
          
          const newPos = [lat, lng];
          currentMarker.setLatLng(newPos);
          
          if (routePoints.length === 0) {
            map.setView(newPos, 16);
          }
          
          // Detectar terreno atual
          const currentTerrain = detectTerrain(lat, lng, speed);
          const terrainConfig = TERRAIN_COLORS[currentTerrain];
          
          // Atualizar popup
          currentMarker.getPopup().setContent(
            '<b>Sua Localização</b><br>' +
            'Precisão: ' + Math.round(accuracy) + 'm<br>' +
            'Qualidade: ' + quality + '<br>' +
            'Terreno: ' + currentTerrain.replace('_', ' ').toUpperCase() + '<br>' +
            'Velocidade: ' + speed.toFixed(1) + ' km/h<br>' +
            'Lat: ' + lat.toFixed(6) + '<br>' +
            'Lng: ' + lng.toFixed(6)
          );
          
          // Atualizar estatísticas
          updateTerrainStats(currentTerrain, speed);
          
          // Mostrar indicador GPS
          showGpsIndicator(quality, accuracy);
        }
        
        // Adicionar ponto à rota com detecção de terreno
        function addRoutePoint(lat, lng, accuracy, quality, speed = 0) {
          if (!isInitialized) return;
          
          routePoints.push([lat, lng]);
          
          // Detectar terreno para este ponto
          const terrainType = detectTerrain(lat, lng, speed);
          const terrainConfig = TERRAIN_COLORS[terrainType];
          
          // Adicionar ponto visual
          const pointMarker = L.circleMarker([lat, lng], {
            className: 'route-point',
            radius: 4,
            fillColor: terrainConfig.color,
            color: '#FFFFFF',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          });
          
          // Adicionar à camada apropriada
          const terrainLayer = terrainLayers.get(terrainType);
          if (terrainLayer) {
            terrainLayer.addLayer(pointMarker);
          }
          
          // Atualizar linha da rota com cores por terreno
          updateTerrainRoute();
          
          // Ajustar zoom para mostrar toda a rota
          if (routePoints.length > 1) {
            const bounds = L.latLngBounds(routePoints);
            map.fitBounds(bounds, { padding: [20, 20] });
          }
        }
        
        // Atualizar rota com cores por terreno
        function updateTerrainRoute() {
          if (routePoints.length < 2) return;
          
          // Limpar linhas anteriores
          Object.values(terrainLayers).forEach(layer => {
            layer.clearLayers();
          });
          
          // Recriar pontos e linhas por terreno
          let currentTerrain = null;
          let currentSegment = [];
          
          for (let i = 0; i < routePoints.length; i++) {
            const point = routePoints[i];
            const speed = 0; // Velocidade seria calculada se disponível
            
            // Detectar terreno para este ponto
            const terrainType = detectTerrain(point[0], point[1], speed);
            
            // Adicionar ponto visual com animação
            const pointMarker = L.circleMarker(point, {
              className: 'route-point',
              radius: 4,
              fillColor: TERRAIN_COLORS[terrainType].color,
              color: '#FFFFFF',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            });
            
            // Adicionar efeito de pulso para pontos novos
            if (i === routePoints.length - 1) {
              pointMarker.setRadius(6);
              setTimeout(() => {
                if (pointMarker && pointMarker.setRadius) {
                  pointMarker.setRadius(4);
                }
              }, 500);
            }
            
            terrainLayers.get(terrainType).addLayer(pointMarker);
            
            // Se o terreno mudou, criar nova linha
            if (currentTerrain !== terrainType) {
              // Finalizar segmento anterior
              if (currentSegment.length > 1) {
                createTerrainLine(currentSegment, currentTerrain);
              }
              
              // Iniciar novo segmento
              currentTerrain = terrainType;
              currentSegment = [point];
            } else {
              currentSegment.push(point);
            }
          }
          
          // Finalizar último segmento
          if (currentSegment.length > 1) {
            createTerrainLine(currentSegment, currentTerrain);
          }
          
          // Atualizar estatísticas em tempo real
          updateRealTimeStats();
        }
        
        // Atualizar estatísticas em tempo real
        function updateRealTimeStats() {
          if (routePoints.length === 0) return;
          
          // Calcular distância total
          let totalDistance = 0;
          for (let i = 1; i < routePoints.length; i++) {
            const prev = routePoints[i - 1];
            const curr = routePoints[i];
            totalDistance += calculateDistance(prev[0], prev[1], curr[0], curr[1]);
          }
          
          // Atualizar elementos da interface
          const distanceEl = document.getElementById('total-distance');
          if (distanceEl) {
            distanceEl.textContent = (totalDistance / 1000).toFixed(2) + ' km';
          }
          
          // Atualizar tempo (simulado - seria enviado do React Native)
          const timeEl = document.getElementById('total-time');
          if (timeEl) {
            const elapsed = Math.floor((Date.now() - lastUpdateTime) / 1000);
            const hours = Math.floor(elapsed / 3600);
            const minutes = Math.floor((elapsed % 3600) / 60);
            const seconds = elapsed % 60;
            timeEl.textContent = 
              hours.toString().padStart(2, '0') + ':' +
              minutes.toString().padStart(2, '0') + ':' +
              seconds.toString().padStart(2, '0');
          }
        }
        
        // Função para calcular distância entre dois pontos
        function calculateDistance(lat1, lng1, lat2, lng2) {
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
        
        // Criar linha para um segmento de terreno
        function createTerrainLine(points, terrainType) {
          if (points.length < 2) return;
          
          const config = TERRAIN_COLORS[terrainType];
          const line = L.polyline(points, {
            color: config.color,
            weight: config.width,
            opacity: config.opacity,
            lineCap: 'round',
            lineJoin: 'round'
          });
          
          // Adicionar popup informativo
          line.bindPopup('<b>' + terrainType.replace('_', ' ').toUpperCase() + '</b><br>' +
                        'Pontos: ' + points.length + '<br>' +
                        'Largura: ' + config.width + 'px<br>' +
                        'Cor: ' + config.color);
          
          terrainLayers.get(terrainType).addLayer(line);
        }
        
        // Mostrar indicador GPS
        function showGpsIndicator(quality, accuracy) {
          const indicator = document.getElementById('gps-indicator');
          const status = document.getElementById('gps-status');
          const accuracyEl = document.getElementById('gps-accuracy');
          
          if (indicator) {
            indicator.style.display = 'block';
            status.className = 'gps-' + quality;
            status.textContent = 'GPS ' + quality.charAt(0).toUpperCase() + quality.slice(1);
            accuracyEl.textContent = Math.round(accuracy) + 'm';
          }
        }
        
        // Atualizar estatísticas do terreno
        function updateTerrainStats(terrainType, speed) {
          const terrainEl = document.getElementById('current-terrain');
          const speedEl = document.getElementById('current-speed');
          
          if (terrainEl) {
            terrainEl.textContent = terrainType.replace('_', ' ').toUpperCase();
          }
          
          if (speedEl) {
            speedEl.textContent = speed.toFixed(1) + ' km/h';
          }
        }
        
        // Limpar rota
        function clearRoute() {
          if (!isInitialized) return;
          
          routePoints = [];
          Object.values(terrainLayers).forEach(layer => {
            layer.clearLayers();
          });
          
          const indicator = document.getElementById('gps-indicator');
          if (indicator) {
            indicator.style.display = 'none';
          }
        }
        
        // Receber mensagens do React Native
        function receiveMessage(event) {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case 'updateLocation':
                updateCurrentLocation(data.lat, data.lng, data.accuracy, data.quality, data.speed || 0);
                break;
              case 'addRoutePoint':
                addRoutePoint(data.lat, data.lng, data.accuracy, data.quality, data.speed || 0);
                break;
              case 'clearRoute':
                clearRoute();
                break;
              case 'setRoute':
                if (data.route && data.route.length > 0) {
                  clearRoute();
                  data.route.forEach(point => {
                    addRoutePoint(point.latitude, point.longitude, point.accuracy, point.quality, point.speed || 0);
                  });
                }
                break;
            }
          } catch (error) {
            console.error('Erro ao processar mensagem:', error);
          }
        }
        
        // Inicializar quando a página carregar
        document.addEventListener('DOMContentLoaded', initMap);
        
        // Escutar mensagens do React Native
        document.addEventListener('message', receiveMessage);
        
        // Para compatibilidade com WebView
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.onMessage = receiveMessage;
        }
      </script>
    </body>
    </html>
  `;

  // Enviar mensagens para o mapa
  const sendMessageToMap = (message: any) => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  // Atualizar localização no mapa
  useEffect(() => {
    if (currentLocation && mapReady) {
      sendMessageToMap({
        type: 'updateLocation',
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        quality: currentLocation.quality,
        speed: currentLocation.speed,
      });
    }
  }, [currentLocation, mapReady]);

  // Adicionar pontos à rota
  useEffect(() => {
    if (route.length > 0 && mapReady) {
      // Enviar rota completa
      sendMessageToMap({
        type: 'setRoute',
        route: route,
      });
    }
  }, [route, mapReady]);

  // Limpar rota quando parar
  useEffect(() => {
    if (!isRunning && mapReady) {
      sendMessageToMap({ type: 'clearRoute' });
    }
  }, [isRunning, mapReady]);

  // Handler para mensagens do WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapReady') {
        setMapReady(true);
        onMapReady?.();
      }
    } catch (error) {
      console.error('Erro ao processar mensagem do mapa:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: leafletHTML }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height * 0.4,
    backgroundColor: '#f0f0f0',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
