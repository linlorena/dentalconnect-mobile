import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setErro('');

    if (!email || !password) {
      setErro('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      console.log('Iniciando login via backend local...');
      
      const response = await fetch('http://192.168.0.10:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          senha: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login');
      }

      console.log('Login realizado com sucesso:', data);
      
      if (data.user && data.user.token) {
        console.log('Token JWT recebido:', data.user.token);
      }
      
      await signIn(email, password);
      
    } catch (error) {
      console.error('Erro no login:', error);
      setErro('Falha ao fazer login. Verifique suas credenciais.');
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              Entre no{'\n'}
              <Text style={styles.titleHighlight}>DentalConnect :)</Text>
            </Text>
          </View>

          {erro ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              label="E-mail"
              placeholder="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <PasswordInput
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.optionsContainer}>
              <View style={styles.checkboxContainer}>
                <View style={styles.checkbox} />
                <Text style={styles.checkboxText}>Lembrar meus dados</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('EsqueciSenha')}
              >
                <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={loading ? 'Entrando...' : 'Entrar'}
              onPress={handleLogin}
              disabled={loading}
              style={styles.loginButton}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.link}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: spacing.paddingVertical,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
  },
  title: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 44,
  },
  titleHighlight: {
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 16,
  },
  form: {
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: spacing.borderRadiusSmall,
    marginRight: spacing.sm,
  },
  checkboxText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  forgotPassword: {
    color: colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginBottom: spacing.md,
  },
  link: {
    color: colors.primary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing.marginTop,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
