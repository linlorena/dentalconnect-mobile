import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState, useEffect } from 'react';
import BuscarDentistaScreen from './screens/home/BuscarDentistaScreen';
import { AuthProvider, useAuth } from './context/auth';
import { LoginScreen, CadastroScreen, EsqueciSenhaScreen, HomeScreen, ConfiguracoesScreen, AgendarConsultaScreen, DetalhesLocalScreen, ClinicasPorCidadeScreen } from './screens';
import SplashScreen from './screens/SplashScreen';
import DetalhesAgendamento from './screens/home/DetalhesAgendamento';


const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return null;

  if (showSplash) {
    return <SplashScreen />;
  }

      return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
          <Stack.Screen name="DetalhesAgendamento" component={DetalhesAgendamento} />
          <Stack.Screen name="BuscarDentista" component={BuscarDentistaScreen} options={{ title: 'Buscar Dentista' }} />
          <Stack.Screen name="AgendarConsulta" component={AgendarConsultaScreen} options={{ title: 'Agendar Consulta' }} />
          <Stack.Screen name="DetalhesLocal" component={DetalhesLocalScreen} options={{ title: 'Detalhes da Clínica' }} />
          <Stack.Screen name="ClinicasPorCidade" component={ClinicasPorCidadeScreen} options={{ title: 'Clínicas por Cidade' }} />
        </>
      ) : (
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
