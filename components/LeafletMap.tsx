import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
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

  // HTML do mapa Leaflet
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>Corrida App - Mapa</title>
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
        .route-line {
          stroke: #F26522;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0.8;
        }
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
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div id="gps-indicator" class="gps-indicator" style="display: none;">
        <div id="gps-status">GPS</div>
        <div id="gps-accuracy">--</div>
      </div>
      
      <script>
        let map;
        let currentMarker;
        let routeLayer;
        let routePoints = [];
        let isInitialized = false;
        
        // Configurações do mapa
        const MAP_CONFIG = {
          TILE_SERVER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          ATTRIBUTION: '© OpenStreetMap contributors',
          MAX_ZOOM: 19,
          SUBDOMAINS: 'abc',
          DEFAULT_CENTER: { latitude: -23.5505, longitude: -46.6333 },
          DEFAULT_ZOOM: 15,
          GPS: {
            QUALITY_LABELS: {
              excellent: 'Excelente',
              good: 'Boa',
              fair: 'Razoável',
              poor: 'Baixa'
            }
          },
          INTERACTION: {
            DRAGGING: true,
            TOUCH_ZOOM: true,
            SCROLL_WHEEL_ZOOM: false,
            DOUBLE_CLICK_ZOOM: true,
            BOX_ZOOM: false,
            KEYBOARD: false,
            TAP: true
          }
        };
        
        // Inicializar mapa
        function initMap() {
          // Coordenadas padrão
          const defaultLat = MAP_CONFIG.DEFAULT_CENTER.latitude;
          const defaultLng = MAP_CONFIG.DEFAULT_CENTER.longitude;
          
          map = L.map('map', {
            center: [defaultLat, defaultLng],
            zoom: MAP_CONFIG.DEFAULT_ZOOM,
            zoomControl: true,
            attributionControl: true,
            dragging: MAP_CONFIG.INTERACTION.DRAGGING,
            touchZoom: MAP_CONFIG.INTERACTION.TOUCH_ZOOM,
            scrollWheelZoom: MAP_CONFIG.INTERACTION.SCROLL_WHEEL_ZOOM,
            doubleClickZoom: MAP_CONFIG.INTERACTION.DOUBLE_CLICK_ZOOM,
            boxZoom: MAP_CONFIG.INTERACTION.BOX_ZOOM,
            keyboard: MAP_CONFIG.INTERACTION.KEYBOARD,
            tap: MAP_CONFIG.INTERACTION.TAP,
          });
          
          // Adicionar tiles do OpenStreetMap (gratuito)
          L.tileLayer(MAP_CONFIG.TILE_SERVER, {
            attribution: MAP_CONFIG.ATTRIBUTION,
            maxZoom: MAP_CONFIG.MAX_ZOOM,
            subdomains: MAP_CONFIG.SUBDOMAINS,
          }).addTo(map);
          
          // Adicionar camada para a rota
          routeLayer = L.layerGroup().addTo(map);
          
          // Adicionar marcador da localização atual
          currentMarker = L.circleMarker([defaultLat, defaultLng], {
            className: 'current-location',
            zIndexOffset: 1000,
          }).addTo(map);
          
          // Adicionar popup informativo
          currentMarker.bindPopup('<b>Sua Localização</b><br>GPS inicializando...');
          
          isInitialized = true;
          
          // Notificar que o mapa está pronto
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapReady',
              success: true
            }));
          }
        }
        
        // Atualizar localização atual
        function updateCurrentLocation(lat, lng, accuracy, quality) {
          if (!isInitialized) return;
          
          const newPos = [lat, lng];
          
          // Atualizar marcador
          currentMarker.setLatLng(newPos);
          
          // Centralizar mapa na primeira vez
          if (routePoints.length === 0) {
            map.setView(newPos, 16);
          }
          
          // Atualizar popup
          const qualityText = MAP_CONFIG.GPS.QUALITY_LABELS[quality] || 'Desconhecida';
          
          currentMarker.getPopup().setContent(
            '<b>Sua Localização</b><br>' +
            'Precisão: ' + Math.round(accuracy) + 'm<br>' +
            'Qualidade: ' + qualityText + '<br>' +
            'Lat: ' + lat.toFixed(6) + '<br>' +
            'Lng: ' + lng.toFixed(6)
          );
          
          // Mostrar indicador GPS
          showGpsIndicator(quality, accuracy);
        }
        
        // Adicionar ponto à rota
        function addRoutePoint(lat, lng, accuracy, quality) {
          if (!isInitialized) return;
          
          routePoints.push([lat, lng]);
          
          // Adicionar ponto visual
          L.circleMarker([lat, lng], {
            className: 'route-point',
            radius: 4,
          }).addTo(routeLayer);
          
          // Atualizar linha da rota
          if (routePoints.length > 1) {
            // Remover linha anterior
            routeLayer.clearLayers();
            
            // Adicionar pontos
            routePoints.forEach(point => {
              L.circleMarker(point, {
                className: 'route-point',
                radius: 4,
              }).addTo(routeLayer);
            });
            
            // Adicionar nova linha
            L.polyline(routePoints, {
              className: 'route-line',
              weight: 4,
              opacity: 0.8,
              color: '#F26522',
            }).addTo(routeLayer);
          }
          
          // Ajustar zoom para mostrar toda a rota
          if (routePoints.length > 1) {
            const bounds = L.latLngBounds(routePoints);
            map.fitBounds(bounds, { padding: [20, 20] });
          }
        }
        
        // Mostrar indicador GPS
        function showGpsIndicator(quality, accuracy) {
          const indicator = document.getElementById('gps-indicator');
          const status = document.getElementById('gps-status');
          const accuracyEl = document.getElementById('gps-accuracy');
          
          if (indicator) {
            indicator.style.display = 'block';
            
            // Remover classes anteriores
            status.className = '';
            status.classList.add('gps-' + quality);
            
            const qualityText = MAP_CONFIG.GPS.QUALITY_LABELS[quality] || 'Desconhecida';
            status.textContent = 'GPS ' + qualityText;
            accuracyEl.textContent = Math.round(accuracy) + 'm';
          }
        }
        
        // Limpar rota
        function clearRoute() {
          if (!isInitialized) return;
          
          routePoints = [];
          routeLayer.clearLayers();
          
          // Ocultar indicador GPS
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
                updateCurrentLocation(data.lat, data.lng, data.accuracy, data.quality);
                break;
              case 'addRoutePoint':
                addRoutePoint(data.lat, data.lng, data.accuracy, data.quality);
                break;
              case 'clearRoute':
                clearRoute();
                break;
              case 'setRoute':
                if (data.route && data.route.length > 0) {
                  clearRoute();
                  data.route.forEach(point => {
                    addRoutePoint(point.latitude, point.longitude, point.accuracy, point.quality);
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
