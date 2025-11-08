import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/auth';
import { LoginScreen, CadastroScreen, EsqueciSenhaScreen, HomeScreen, ConfiguracoesScreen, BuscarDentistaScreen, ProcedimentosScreen, AgendarConsultaScreen, DetalhesLocalScreen, ClinicasPorCidadeScreen, SelecionarHorarioScreen } from './screens';
import SplashScreen from './screens/SplashScreen';
import FaleConoscoScreen from './screens/home/FaleConosco';
import DetalhesAgendamento from './screens/home/DetalhesAgendamento';
import DetalhesAgendamentoItem from './screens/home/MeusAgendamentos';

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
          <Stack.Screen name="FaleConosco" component={FaleConoscoScreen} />
          <Stack.Screen name="DetalhesAgendamento" component={DetalhesAgendamento} />
          <Stack.Screen name="DetalhesAgendamentoItem" component={DetalhesAgendamentoItem} />
          <Stack.Screen name="BuscarDentista" component={BuscarDentistaScreen} options={{ title: 'Buscar Dentista' }} />
          <Stack.Screen name="Procedimentos" component={ProcedimentosScreen} options={{ title: 'Nossos Procedimentos' }} />
          <Stack.Screen name="AgendarConsulta" component={AgendarConsultaScreen} options={{ title: 'Agendar Avaliação' }} />
          <Stack.Screen name="DetalhesLocal" component={DetalhesLocalScreen} options={{ title: 'Detalhes da Clínica' }} />
          <Stack.Screen name="ClinicasPorCidade" component={ClinicasPorCidadeScreen} options={{ title: 'Clínicas por Cidade' }} />
          <Stack.Screen name="SelecionarHorario" component={SelecionarHorarioScreen} options={{ title: 'Agendar Consulta' }} />
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
