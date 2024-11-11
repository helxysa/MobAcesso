import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Home } from "../screens/Home/Home";
import { SearchDestinationScreen } from "../screens/SearchDestination/SearchDestinationScreen";
import { MapScreen } from "../screens/MapScreen/MapScreen";
import { ReportScreen } from "../screens/ReportScreen/ReportScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen
        name="Início"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
          headerShown: true,
          headerTitle: "MobiAcess",
          headerTitleStyle: {
            color: '#3B82F6',
            fontWeight: 'bold',
          }
        }}
      />
      <Tab.Screen
        name="Reportar"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="alert-circle" size={24} color={color} />
          ),
          headerShown: true
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="TabHome" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SearchDestination"
          component={SearchDestinationScreen}
          options={{
            presentation: 'modal',
            headerTitle: "Buscar destino",
            headerLeft: () => null,
          }}
        />
        <Stack.Screen 
          name="MapScreen" 
          component={MapScreen}
          options={{
            headerTitle: "Sua rota",
            headerBackTitle: "Voltar"
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
