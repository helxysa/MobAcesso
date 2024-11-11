import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { styled } from 'nativewind';
import { getRoute } from '../services/Map';
import * as Location from 'expo-location';

const StyledView = styled(View);
const StyledWebView = styled(WebView);
const StyledActivityIndicator = styled(ActivityIndicator);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

export function MapShow({ route }) {
  const [mapHtml, setMapHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (route?.origin && route?.destination) {
      fetchRoute();
    } else {
      const initialCoords = route?.origin || {
        latitude: -23.550520,
        longitude: -46.633308
      };
      setInitialMap(initialCoords);
    }
  }, [route]);

  const setInitialMap = (coordinates) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            const map = L.map('map', {
              zoomControl: true,
              attributionControl: false
            }).setView([${coordinates.latitude}, ${coordinates.longitude}], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19
            }).addTo(map);

            L.marker([${coordinates.latitude}, ${coordinates.longitude}], {
              icon: L.divIcon({
                html: '📍',
                className: 'location-marker',
                iconSize: [24, 24]
              })
            }).addTo(map).bindPopup('Sua localização');
          </script>
        </body>
      </html>
    `;
    setMapHtml(html);
    setIsLoading(false);
  };

  const fetchRoute = async () => {
    setIsLoading(true);
    try {
      const routeData = await getRoute(route.origin, route.destination);
      
      const routeCoordinates = routeData.route.map(coord => [coord[1], coord[0]]);
      
      setMapHtml(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
            <style>
              body { margin: 0; padding: 0; }
              #map { height: 100vh; width: 100vw; }
            </style>
          </head>
          <body>
            <div id="map"></div>
            <script>
              const map = L.map('map', {
                zoomControl: true,
                attributionControl: false
              });

              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
              }).addTo(map);

              const route = ${JSON.stringify(routeCoordinates)};
              const polyline = L.polyline(route, {
                color: 'blue',
                weight: 5,
                opacity: 0.7
              }).addTo(map);

              const originIcon = L.divIcon({
                html: '🟢',
                className: 'origin-marker',
                iconSize: [24, 24]
              });

              const destIcon = L.divIcon({
                html: '📍',
                className: 'dest-marker',
                iconSize: [24, 24]
              });

              L.marker([${route.origin.latitude}, ${route.origin.longitude}], {
                icon: originIcon
              }).addTo(map).bindPopup('Origem');

              L.marker([${route.destination.latitude}, ${route.destination.longitude}], {
                icon: destIcon
              }).addTo(map).bindPopup('Destino');

              map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

              const distance = ${routeData.distance / 1000}; // Convertendo para km
              const duration = ${Math.round(routeData.duration / 60)}; // Convertendo para minutos

              const info = L.control({ position: 'bottomleft' });
              info.onAdd = function() {
                const div = L.DomUtil.create('div', 'route-info');
                div.style.padding = '10px';
                div.style.background = 'white';
                div.style.borderRadius = '5px';
                div.style.margin = '10px';
                div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                div.innerHTML = \`
                  <strong>Distância:</strong> \${distance.toFixed(1)} km<br>
                  <strong>Tempo estimado:</strong> \${duration} min
                \`;
                return div;
              };
              info.addTo(map);
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Erro ao buscar rota:', error);
      Alert.alert('Erro', 'Não foi possível carregar a rota.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledView className="flex-1">
      {isLoading ? (
        <StyledView className="flex-1 justify-center items-center">
          <StyledActivityIndicator size="large" color="#4B5563" />
          <StyledText className="mt-3 text-gray-600">
            Calculando melhor rota...
          </StyledText>
        </StyledView>
      ) : (
        <>
          <StyledWebView
            className="flex-1"
            source={{ html: mapHtml }}
            originWhitelist={['*']}
          />
          
          {/* Bottom Sheet simplificado */}
          <StyledView className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-lg p-6">
            <StyledView className="flex-row items-center justify-between mb-4">
              <StyledView>
                <StyledText className="text-lg font-bold text-gray-800">
                  Rota encontrada
                </StyledText>
                <StyledText className="text-gray-600 mt-1">
                  {route?.destination?.name}
                </StyledText>
              </StyledView>
            </StyledView>

            <StyledTouchableOpacity
              className="w-full bg-blue-500 rounded-xl p-4"
              onPress={() => {/* tenho q colocar aq o navigation pra rota */}}
            >
              <StyledText className="text-white text-center font-bold text-lg">
                Iniciar Rota
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </>
      )}
    </StyledView>
  );
}