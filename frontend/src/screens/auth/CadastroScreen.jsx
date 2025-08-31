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

const CadastroScreen = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { signUp } = useAuth();

  const formatarCPF = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatarData = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const handleCadastro = async () => {
    setErro('');

    if (!nome || !cpf || !dataNascimento || !email || !senha || !confirmarSenha || !estado || !cidade) {
      setErro('Por favor, preencha todos os campos');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      console.log('Iniciando cadastro via backend local...');
      
      const response = await fetch('http://192.168.0.12:3001/api/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          cpf,
          dataNascimento,
          email,
          senha,
          estado,
          cidade
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no cadastro');
      }

      console.log('Cadastro realizado com sucesso:', data);
      
      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              setNome('');
              setCpf('');
              setDataNascimento('');
              setEmail('');
              setSenha('');
              setConfirmarSenha('');
              setEstado('');
              setCidade('');
              navigation.navigate('Login');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setErro('Falha ao criar conta. Tente novamente.');
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
              Crie sua{'\n'}
              <Text style={styles.titleHighlight}>conta</Text>
            </Text>
          </View>

          {erro ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              label="Nome completo"
              placeholder="Digite seu nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />

            <Input
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(formatarCPF(text))}
              keyboardType="numeric"
              maxLength={14}
            />

            <Input
              label="Data de nascimento"
              placeholder="DD/MM/AAAA"
              value={dataNascimento}
              onChangeText={(text) => setDataNascimento(formatarData(text))}
              keyboardType="numeric"
              maxLength={10}
            />

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
              value={senha}
              onChangeText={setSenha}
            />

            <PasswordInput
              label="Confirmar senha"
              placeholder="Confirme sua senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Estado"
                  placeholder="UF"
                  value={estado}
                  onChangeText={(text) => setEstado(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={2}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Cidade"
                  placeholder="Digite sua cidade"
                  value={cidade}
                  onChangeText={setCidade}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <Button
              title={loading ? 'Criando conta...' : 'Criar conta'}
              onPress={handleCadastro}
              disabled={loading}
              style={styles.cadastroButton}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Já tenho uma conta</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  cadastroButton: {
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

export default CadastroScreen;
