import React from 'react';
import { View } from 'react-native';
import { MapShow } from '../../components/MapShow';
import { useRoute, useNavigation } from '@react-navigation/native';

export function MapScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const selectedRoute = route.params?.route;

  const handleBackToSearch = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1">
      <MapShow 
        route={selectedRoute} 
        onBackPress={handleBackToSearch}
      />
    </View>
  );
}