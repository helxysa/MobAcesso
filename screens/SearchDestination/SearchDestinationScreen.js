import React from "react";
import { View } from "react-native";
import { styled } from "nativewind";
import { MapSearch } from "../../components/MapSearch";
import { useNavigation } from "@react-navigation/native";
const StyledView = styled(View);

export function SearchDestinationScreen() {
  const navigation = useNavigation();

  const handleRouteSelect = (route) => {
    navigation.navigate("MapScreen", { route });
  };

  return (
    <StyledView className="flex-1">
      <MapSearch onRouteSelect={handleRouteSelect} />
    </StyledView>
  );
}
