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

  useEffect(() => {
    initializeLocation();
  }, []);

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

  const handleSearch = async (text, isOrigin = true) => {
    try {
      if (isOrigin) {
        setOrigin(text);
        setSelectedOrigin(null);
        if (text.length > 3) {
          setIsLoadingSearch(true);
          const results = await searchLocation(text, userLocation);
          setOriginResults(results);
        } else {
          setOriginResults([]);
        }
      } else {
        if (!selectedOrigin) {
          Alert.alert('Atenção', 'Por favor, selecione primeiro o local de origem');
          return;
        }
        setDestination(text);
        setSelectedDestination(null);
        if (text.length > 3) {
          setIsLoadingSearch(true);
          const results = await searchLocation(text, userLocation);
          setDestinationResults(results);
        } else {
          setDestinationResults([]);
        }
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const handleSelectLocation = (item, isOrigin = true) => {
    if (isOrigin) {
      setOrigin(item.name);
      setOriginResults([]);
      setSelectedOrigin(item);
      setIsSearchingOrigin(false);
    } else {
      setDestination(item.name);
      setDestinationResults([]);
      setSelectedDestination(item);
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

  return (
    <StyledView className="bg-white p-5 shadow-lg rounded-t-3xl">
      {isLoadingLocation ? (
        <StyledView className="h-32 justify-center items-center">
          <StyledActivityIndicator size="large" color="#3B82F6" />
          <StyledText className="mt-3 text-gray-600 text-center text-base">
            Obtendo sua localização...
          </StyledText>
        </StyledView>
      ) : (
        <>
          <StyledView className="mb-6">
            <StyledText className="text-xl font-bold text-gray-800 mb-4">
              Para onde vamos?
            </StyledText>

            <StyledView className="flex-row justify-between mb-5">
              <StyledTouchable
                className={`flex-1 p-4 rounded-2xl mr-2 ${useCurrentLocation ? 'bg-blue-500' : 'bg-gray-50'}`}
                onPress={handleUseCurrentLocation}
              >
                <Ionicons 
                  name="location" 
                  size={24} 
                  color={useCurrentLocation ? "white" : "#4B5563"} 
                  style={{ alignSelf: 'center', marginBottom: 4 }}
                />
                <StyledText className={`text-center text-base ${useCurrentLocation ? 'text-white' : 'text-gray-700'}`}>
                  Localização Atual
                </StyledText>
              </StyledTouchable>
              <StyledTouchable
                className={`flex-1 p-4 rounded-2xl ml-2 ${!useCurrentLocation ? 'bg-blue-500' : 'bg-gray-50'}`}
                onPress={handleManualLocation}
              >
                <Ionicons 
                  name="pencil" 
                  size={24} 
                  color={!useCurrentLocation ? "white" : "#4B5563"} 
                  style={{ alignSelf: 'center', marginBottom: 4 }}
                />
                <StyledText className={`text-center text-base ${!useCurrentLocation ? 'text-white' : 'text-gray-700'}`}>
                  Digite o Endereço
                </StyledText>
              </StyledTouchable>
            </StyledView>

            <StyledView className="relative mb-4">
              <StyledView className="flex-row items-center bg-gray-50 rounded-xl p-4">
                <Ionicons name="location-outline" size={24} color="#3B82F6" style={{ marginRight: 12 }} />
                <StyledInput
                  className={`flex-1 text-base ${selectedOrigin ? 'text-green-700' : 'text-gray-700'}`}
                  placeholder="Local de partida"
                  value={origin}
                  onChangeText={(text) => handleSearch(text, true)}
                  placeholderTextColor="#9CA3AF"
                  editable={!useCurrentLocation}
                />
                {origin.length > 0 && !useCurrentLocation && (
                  <StyledTouchable onPress={clearOrigin}>
                    <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                  </StyledTouchable>
                )}
              </StyledView>
              {isLoadingSearch && isSearchingOrigin && (
                <StyledView className="absolute -bottom-8 w-full items-center">
                  <StyledView className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full">
                    <StyledActivityIndicator size="small" color="#3B82F6" />
                    <StyledText className="ml-2 text-gray-600">Buscando endereços...</StyledText>
                  </StyledView>
                </StyledView>
              )}
            </StyledView>

            {originResults.length > 0 && (
              <StyledFlatList
                data={originResults}
                renderItem={({ item }) => renderLocationItem({ item, isOrigin: true })}
                keyExtractor={item => item.id.toString()}
                className="max-h-40 bg-white rounded-xl shadow-sm mb-4"
              />
            )}

            <StyledView className="relative">
              <StyledView className="flex-row items-center bg-gray-50 rounded-xl p-4">
                <Ionicons name="navigate" size={24} color="#EF4444" style={{ marginRight: 12 }} />
                <StyledInput
                  className={`flex-1 text-base ${selectedDestination ? 'text-green-700' : 'text-gray-700'}`}
                  placeholder="Para onde você quer ir?"
                  value={destination}
                  onChangeText={(text) => handleSearch(text, false)}
                  placeholderTextColor="#9CA3AF"
                  editable={!!selectedOrigin}
                />
                {destination.length > 0 && (
                  <StyledTouchable onPress={clearDestination}>
                    <Ionicons name="close-circle" size={24} color="#9CA3AF" />
                  </StyledTouchable>
                )}
              </StyledView>
              {!isSearchingOrigin && destination.length > 2 && destinationResults.length === 0 && isLoadingSearch && (
                <StyledView className="absolute -bottom-8 w-full items-center">
                  <StyledView className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full">
                    <StyledActivityIndicator size="small" color="#3B82F6" />
                    <StyledText className="ml-2 text-gray-600">Buscando destinos...</StyledText>
                  </StyledView>
                </StyledView>
              )}
            </StyledView>

            {destinationResults.length > 0 && (
              <StyledFlatList
                data={destinationResults}
                renderItem={({ item }) => renderLocationItem({ item, isOrigin: false })}
                keyExtractor={item => item.id.toString()}
                className="max-h-40 bg-white rounded-xl shadow-sm mt-4"
              />
            )}
          </StyledView>

          <StyledTouchable
            className={`w-full rounded-2xl p-4 ${
              selectedOrigin && selectedDestination 
                ? 'bg-blue-500' 
                : 'bg-gray-200'
            }`}
            onPress={handleSearchRoute}
            disabled={!selectedOrigin || !selectedDestination}
          >
            <StyledText className="text-white text-center font-bold text-lg">
              Traçar Rota Acessível
            </StyledText>
          </StyledTouchable>
        </>
      )}
    </StyledView>
  );
}