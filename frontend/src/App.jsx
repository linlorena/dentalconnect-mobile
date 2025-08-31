import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider, useAuth } from './context/auth';
import { LoginScreen, CadastroScreen, EsqueciSenhaScreen, HomeScreen } from './screens';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; 
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
              {user ? (
          // Usuário logado
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
        // Usuário não logado
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
