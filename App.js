import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { Proveedor } from './Contexts/Proveedor'


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar backgroundColor="#f0fff0" barStyle="dark-content" />

      <Proveedor>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </Proveedor>
    </GestureHandlerRootView>

  );
}