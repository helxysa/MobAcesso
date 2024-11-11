import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { styled } from 'nativewind';
import { searchLocation, getCurrentLocation } from '../services/Map';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledTouchable = styled(TouchableOpacity);
const StyledFlatList = styled(FlatList);
const StyledActivityIndicator = styled(ActivityIndicator);

const headers = {
  'User-Agent': 'MobiAcess/1.0',
  'Accept-Language': 'pt-BR,pt;q=0.9',
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export function MapSearch({ onRouteSelect }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originResults, setOriginResults] = useState([]);
  const [destinationResults, setDestinationResults] = useState([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(true);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [initialLocation, setInitialLocation] = useState(null);
  const [routeOptions, setRouteOptions] = useState([]);
  const [showRouteOptions, setShowRouteOptions] = useState(false);

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (selectedOrigin && selectedDestination) {
      fetchRouteOptions();
    }
  }, [selectedOrigin, selectedDestination]);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        
        const userLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        
        setInitialLocation(userLoc);
        setUserLocation(userLoc);

        // Passa a localização inicial para o MapShow
        onRouteSelect({ origin: userLoc });
        
        if (useCurrentLocation) {
          const address = await reverseGeocode(userLoc.latitude, userLoc.longitude);
          if (address) {
            setOrigin(address.name);
            setSelectedOrigin(address);
          }
        }
      }
    } catch (error) {
      console.error('Erro na inicialização:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getCurrentUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const userLoc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      setUserLocation(userLoc);
      
      const address = await reverseGeocode(userLoc.latitude, userLoc.longitude);
      if (address) {
        setOrigin(address.name);
        setSelectedOrigin(address);
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        "Erro",
        "Não foi possível obter sua localização atual. Por favor, tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      await delay(300);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { 
          method: 'GET',
          headers: headers 
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.place_id,
        name: data.display_name,
        latitude,
        longitude
      };
    } catch (error) {
      console.error('Erro no geocoding reverso:', error);
      return null;
    }
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const handleSearch = async (text, isOrigin) => {
    try {
      if (isOrigin) {
        setOrigin(text);
        setIsSearchingOrigin(true);
      } else {
        setDestination(text);
        setIsSearchingOrigin(false);
      }

      if (text.length < 3) {
        if (isOrigin) {
          setOriginResults([]);
        } else {
          setDestinationResults([]);
        }
        return;
      }

      setIsLoadingSearch(true);

      const results = await searchLocation(text, userLocation);
      
      // Filtra resultados para Macapá
      const filteredResults = results.filter(item => 
        item.name.toLowerCase().includes('macapá')
      );

      if (isOrigin) {
        setOriginResults(filteredResults);
      } else {
        setDestinationResults(filteredResults);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      Alert.alert('Erro', 'Não foi possível realizar a busca.');
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleSelectLocation = (item, isOrigin) => {
    if (isOrigin) {
      setOrigin(item.name);
      setSelectedOrigin(item);
      setOriginResults([]);
      setIsSearchingOrigin(false); // Muda o foco para o destino
    } else {
      setDestination(item.name);
      setSelectedDestination(item);
      setDestinationResults([]);
      if (selectedOrigin) {
        fetchRouteOptions(); // Busca rotas quando origem e destino estão selecionados
      }
    }
  };

  const clearOrigin = () => {
    setOrigin('');
    setSelectedOrigin(null);
    setOriginResults([]);
    setDestination('');
    setSelectedDestination(null);
    setDestinationResults([]);
  };

  const clearDestination = () => {
    setDestination('');
    setSelectedDestination(null);
    setDestinationResults([]);
  };

  const handleSearchRoute = () => {
    if (selectedOrigin && selectedDestination) {
      onRouteSelect({
        origin: selectedOrigin,
        destination: selectedDestination
      });
    } else {
      alert('Por favor, selecione origem e destino antes de buscar a rota');
    }
  };

  const renderLocationItem = ({ item, isOrigin }) => (
    <StyledTouchable 
      className="p-3 border-b border-gray-200"
      onPress={() => handleSelectLocation(item, isOrigin)}
    >
      <StyledText className="text-gray-800">{item.name}</StyledText>
    </StyledTouchable>
  );

  const handleUseCurrentLocation = async () => {
    setUseCurrentLocation(true);
    setIsLoadingLocation(true);
    
    try {
      if (initialLocation) {
        const address = await reverseGeocode(initialLocation.latitude, initialLocation.longitude);
        if (address) {
          setOrigin(address.name);
          setSelectedOrigin(address);
        }
      } else {
        await getCurrentUserLocation();
      }
    } catch (error) {
      console.error('Erro ao usar localização atual:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleManualLocation = () => {
    setUseCurrentLocation(false);
    setIsLoadingLocation(false);
    setOrigin('');
    setSelectedOrigin(null);
  };

  const fetchRouteOptions = async () => {
    setIsLoadingSearch(true);
    try {
      const options = [
        {
          id: 1,
          name: "Ônibus 123 - Adaptado",
          duration: "40 min",
          accessibility: ["elevator", "ramp"],
          route: {
            origin: selectedOrigin,
            destination: selectedDestination,
            type: "bus",
            line: "123"
          }
        },
        {
          id: 2,
          name: "Ônibus 456 - Adaptado",
          duration: "45 min",
          accessibility: ["ramp"],
          route: {
            origin: selectedOrigin,
            destination: selectedDestination,
            type: "bus",
            line: "456"
          }
        }
      ];
      
      setRouteOptions(options);
      setShowRouteOptions(true);
    } catch (error) {
      console.error('Erro ao buscar opções de rota:', error);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleRouteOptionSelect = (option) => {
    onRouteSelect(option.route);
  };

  const renderRouteOptions = () => (
    <StyledView className="flex-1 bg-white">
      <StyledText className="px-4 py-3 text-lg font-semibold text-gray-800">
        Rotas disponíveis
      </StyledText>
      
      <StyledFlatList
        data={routeOptions}
        renderItem={({ item }) => (
          <StyledTouchable 
            className="p-4 border-b border-gray-100"
            onPress={() => handleRouteOptionSelect(item)}
          >
            <StyledView className="flex-row justify-between items-center">
              <StyledView className="flex-1">
                <StyledText className="text-lg font-semibold text-gray-800">
                  {item.name}
                </StyledText>
                <StyledText className="text-gray-500 mt-1">
                  Tempo estimado: {item.duration}
                </StyledText>
                <StyledView className="flex-row mt-2">
                  {item.accessibility.includes("elevator") && (
                    <StyledText className="text-blue-500 mr-4">
                      ⚡ Elevador disponível
                    </StyledText>
                  )}
                  {item.accessibility.includes("ramp") && (
                    <StyledText className="text-blue-500">
                      ↗ Rampa de acesso
                    </StyledText>
                  )}
                </StyledView>
              </StyledView>
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </StyledView>
          </StyledTouchable>
        )}
        keyExtractor={item => item.id.toString()}
      />
    </StyledView>
  );

  return (
    <StyledView className="flex-1 bg-white">
      {!showRouteOptions ? (
        <>
          <StyledView className="p-4 border-b border-gray-200">
            <StyledText className="text-lg font-semibold mb-4">
              Como deseja informar seu ponto de partida?
            </StyledText>
            
            <StyledTouchable 
              className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-2"
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="locate" size={24} color="#3B82F6" />
              <StyledView className="ml-3">
                <StyledText className="font-medium">Usar localização atual</StyledText>
                <StyledText className="text-sm text-gray-500">
                  Detectar automaticamente
                </StyledText>
              </StyledView>
            </StyledTouchable>

            <StyledTouchable 
              className="flex-row items-center p-4 bg-gray-50 rounded-xl"
              onPress={handleManualLocation}
            >
              <Ionicons name="pencil" size={24} color="#3B82F6" />
              <StyledView className="ml-3">
                <StyledText className="font-medium">Digite o endereço</StyledText>
                <StyledText className="text-sm text-gray-500">
                  Informar manualmente
                </StyledText>
              </StyledView>
            </StyledTouchable>
          </StyledView>

          {/* Campos de busca */}
          <StyledView className="p-4">
            <StyledView className="mb-4">
              <StyledInput
                className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                placeholder="Origem"
                value={origin}
                onChangeText={(text) => handleSearch(text, true)}
                editable={!useCurrentLocation}
              />
              {isLoadingSearch && isSearchingOrigin && (
                <StyledActivityIndicator className="absolute right-4 top-4" />
              )}
            </StyledView>

            <StyledView>
              <StyledInput
                className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                placeholder="Destino"
                value={destination}
                onChangeText={(text) => handleSearch(text, false)}
              />
              {isLoadingSearch && !isSearchingOrigin && (
                <StyledActivityIndicator className="absolute right-4 top-4" />
              )}
            </StyledView>
          </StyledView>

          {/* Lista de resultados da busca */}
          {(originResults.length > 0 || destinationResults.length > 0) && (
            <StyledFlatList
              data={isSearchingOrigin ? originResults : destinationResults}
              renderItem={({ item }) => (
                <StyledTouchable 
                  className="flex-row items-center p-4 border-b border-gray-100"
                  onPress={() => handleSelectLocation(item, isSearchingOrigin)}
                >
                  <Ionicons name="location" size={24} color="#6B7280" />
                  <StyledView className="ml-3 flex-1">
                    <StyledText className="font-medium">{item.name}</StyledText>
                    <StyledText className="text-sm text-gray-500">
                      {item.address || 'Endereço não disponível'}
                    </StyledText>
                  </StyledView>
                </StyledTouchable>
              )}
              keyExtractor={item => item.id.toString()}
            />
          )}
        </>
      ) : (
        renderRouteOptions()
      )}
    </StyledView>
  );
}