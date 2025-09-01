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
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const EsqueciSenhaScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleRecuperarSenha = async () => {
    setErro('');
    setSucesso(false);

    if (!email) {
      setErro('Por favor, digite seu e-mail');
      return;
    }

    setLoading(true);
    try {
      console.log('Solicitando recuperação de senha para:', email);
      
      // Por enquanto, apenas simula o envio
      // Implementar quando o backend tiver essa funcionalidade
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSucesso(true);
      setEmail('');
      
      Alert.alert(
        'E-mail enviado!',
        'Verifique sua caixa de entrada para instruções de recuperação de senha.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      setErro('Falha ao enviar e-mail de recuperação. Tente novamente.');
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
              Recuperar{'\n'}
              <Text style={styles.titleHighlight}>senha</Text>
            </Text>
          </View>

          <Text style={styles.description}>
            Digite seu e-mail e enviaremos instruções para redefinir sua senha.
          </Text>

          {erro ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          {sucesso ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                E-mail de recuperação enviado com sucesso!
              </Text>
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

            <Button
              title={loading ? 'Enviando...' : 'Enviar e-mail'}
              onPress={handleRecuperarSenha}
              disabled={loading}
              style={styles.recuperarButton}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Voltar para o login</Text>
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
    marginBottom: spacing.lg,
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
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
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
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successText: {
    color: colors.success,
    textAlign: 'center',
    fontSize: 16,
  },
  form: {
    marginBottom: spacing.xl,
  },
  recuperarButton: {
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

export default EsqueciSenhaScreen;
