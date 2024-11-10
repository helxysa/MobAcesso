import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);

export function Home() {
  return (
    <StyledView className="flex-1 bg-white p-4">
      <StyledText className="text-2xl font-bold text-blue-500 mb-4">
        MobiAcess
      </StyledText>
      <StyledText className="text-gray-600 mb-2">
        Para onde você quer ir?
      </StyledText>
      <StyledInput 
        className="w-full bg-gray-100 rounded-lg p-4 mb-4"
        placeholder="Digite seu destino"
        placeholderTextColor="#9CA3AF"
      />
      <StyledView className="bg-white rounded-lg p-4 shadow-md mb-4">
        <StyledText className="text-lg font-semibold">
          Terminal Central → Shopping Plaza
        </StyledText>
        <StyledText className="text-gray-600">
          Ônibus 123 - Adaptado
        </StyledText>
        <StyledView className="flex-row mt-2">
          <StyledText className="text-blue-500 mr-4">
            ⚡ Elevador disponível
          </StyledText>
          <StyledText className="text-blue-500">
            ↗ Rampa de acesso
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledView>
  );
}