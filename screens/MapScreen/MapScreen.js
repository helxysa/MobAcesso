import React, { useState } from 'react';
import { View } from 'react-native';
import { MapSearch } from '../../components/MapSearch';
import { MapShow } from '../../components/MapShow';

export function MapScreen() {
  const [selectedRoute, setSelectedRoute] = useState(null);

  return (
    <View className="flex-1">
      <MapSearch onRouteSelect={setSelectedRoute} />
      <MapShow route={selectedRoute} />
    </View>
  );
}