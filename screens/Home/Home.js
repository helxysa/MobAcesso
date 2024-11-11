import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchable = styled(TouchableOpacity);

export function Home() {
  const navigation = useNavigation();

  return (
    <StyledView className="flex-1 bg-white p-4">
      <StyledText className="text-2xl font-bold text-blue-500 mb-4">
        MobiAcess
      </StyledText>
      <StyledText className="text-gray-600 mb-2">
        Para onde você quer ir?
      </StyledText>
      
      <StyledTouchable 
        className="w-full bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200 flex-row items-center"
        onPress={() => navigation.navigate('SearchDestination')}
      >
        <Ionicons name="search" size={20} color="#6B7280" />
        <StyledText className="text-gray-400 ml-3">
          Digite seu destino
        </StyledText>
      </StyledTouchable>

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