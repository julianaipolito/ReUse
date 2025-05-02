import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import { AlertProvider } from './context/AlertContext';
enableScreens(true);

// Telas
import Login from './pages/loginScreen';

import Register from './pages/registroScreen';
import Home from './pages/homeScreen';
import Termos from './pages/termos'
import Profile from './pages/ProfileScreen'

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Termos: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <AlertProvider>
      <SafeAreaProvider> {/* Adicione este wrapper */}
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            {/** Remover a headerbar  **/}
            <Stack.Screen name="Login" options={{ headerShown: false }} component={Login} />
            <Stack.Screen name="Register" options={{ headerShown: false }} component={Register} />
            <Stack.Screen name="Termos" options={{ headerShown: true }} component={Termos} />
            <Stack.Screen name="Home" options={{ headerShown: false }} component={Home} />
            <Stack.Screen name="Profile" options={{ headerShown: false }} component={Profile} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AlertProvider>
  );
};

export default App;