import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { MapShow } from '../../components/MapShow';

const StyledView = styled(View);
const StyledText = styled(Text);

export function ReportScreen() {
  return (
    <StyledView className="flex-1">
      <StyledView className="p-4 bg-white">
        <StyledText className="text-xl font-bold">
          Marcar Ponto de Acessibilidade
        </StyledText>
        <StyledText className="text-gray-600 mt-2">
          Toque no mapa para marcar um local com recursos de acessibilidade
        </StyledText>
      </StyledView>
      
      <MapShow isReportMode={true} />
    </StyledView>
  );
}