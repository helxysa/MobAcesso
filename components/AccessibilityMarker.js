import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchable = styled(TouchableOpacity);
const StyledModal = styled(Modal);

export function AccessibilityMarker({ visible, onClose, onSave, location }) {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const accessibilityOptions = [
    {
      id: 'ramp',
      icon: '↗️',
      title: 'Rampa',
      description: 'Local possui rampa de acesso'
    },
    {
      id: 'elevator',
      icon: '🛗',
      title: 'Elevador',
      description: 'Elevador acessível'
    },
    {
      id: 'tactile_floor',
      icon: '⬚',
      title: 'Piso Tátil',
      description: 'Piso com sinalização tátil'
    },
    {
      id: 'handrail',
      icon: '‖',
      title: 'Corrimão',
      description: 'Possui corrimão nas escadas/rampas'
    },
    {
      id: 'accessible_bathroom',
      icon: '🚽',
      title: 'Banheiro Acessível',
      description: 'Banheiro adaptado para PCD'
    },
    {
      id: 'parking',
      icon: '🅿️',
      title: 'Estacionamento PCD',
      description: 'Vagas reservadas'
    },
    {
      id: 'braille',
      icon: '⠿',
      title: 'Braille',
      description: 'Sinalização em Braille'
    },
    {
      id: 'libras',
      icon: '🤟',
      title: 'Libras',
      description: 'Atendimento em Libras'
    }
  ];

  const handleSave = () => {
    onSave({
      latitude: location.latitude,
      longitude: location.longitude,
      accessibility: selectedOptions
    });
    setSelectedOptions([]);
    onClose();
  };

  return (
    <StyledModal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <StyledView className="flex-1 justify-end">
        <StyledView className="bg-white rounded-t-3xl p-4 h-3/4">
          <StyledText className="text-xl font-bold mb-4 text-center">
            Marcar Acessibilidade no Local
          </StyledText>
          
          <StyledText className="text-gray-600 mb-4">
            Selecione os recursos de acessibilidade disponíveis neste local:
          </StyledText>

          <StyledScrollView className="flex-1">
            <StyledView className="space-y-2">
              {accessibilityOptions.map(option => (
                <StyledTouchable
                  key={option.id}
                  className={`p-3 rounded-lg flex-row items-center ${
                    selectedOptions.includes(option.id)
                      ? 'bg-blue-100 border border-blue-500'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  onPress={() => {
                    setSelectedOptions(prev => 
                      prev.includes(option.id)
                        ? prev.filter(id => id !== option.id)
                        : [...prev, option.id]
                    );
                  }}
                >
                  <StyledText className="text-2xl mr-3">{option.icon}</StyledText>
                  <StyledView className="flex-1">
                    <StyledText className="font-semibold">{option.title}</StyledText>
                    <StyledText className="text-gray-600 text-sm">
                      {option.description}
                    </StyledText>
                  </StyledView>
                  {selectedOptions.includes(option.id) && (
                    <StyledText className="text-blue-500 text-xl">✓</StyledText>
                  )}
                </StyledTouchable>
              ))}
            </StyledView>
          </StyledScrollView>

          <StyledView className="flex-row space-x-3 mt-4">
            <StyledTouchable 
              className="flex-1 p-4 rounded-lg bg-gray-200"
              onPress={onClose}
            >
              <StyledText className="text-center font-semibold">
                Cancelar
              </StyledText>
            </StyledTouchable>

            <StyledTouchable 
              className={`flex-1 p-4 rounded-lg ${
                selectedOptions.length > 0 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onPress={handleSave}
              disabled={selectedOptions.length === 0}
            >
              <StyledText className={`text-center font-semibold ${
                selectedOptions.length > 0 ? 'text-white' : 'text-gray-500'
              }`}>
                Salvar ({selectedOptions.length})
              </StyledText>
            </StyledTouchable>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledModal>
  );
}