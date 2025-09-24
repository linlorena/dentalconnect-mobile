import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import API_CONFIG from '../../config/api';
// Funções utilitárias inline
const formatDateForAPI = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const isValidDate = (dateString) => {
  if (!dateString) return false;
  const parts = dateString.split('/');
  if (parts.length !== 3) return false;
  const [day, month, year] = parts;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day;
};

const isNotFutureDate = (dateString) => {
  if (!isValidDate(dateString)) return false;
  const parts = dateString.split('/');
  const [day, month, year] = parts;
  const date = new Date(year, month - 1, day);
  const today = new Date();
  return date <= today;
};

const isValidCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  console.log('Validando CPF:', cpf, '-> Limpo:', cleanCPF, 'Tamanho:', cleanCPF.length);
  
  // Verificar se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    console.log('CPF rejeitado: não tem 11 dígitos');
    return false;
  }
  
  // Verificar se não é uma sequência de números iguais (11111111111, 22222222222, etc.)
  if (/(\d)\1{10}/.test(cleanCPF)) {
    console.log('CPF rejeitado: sequência de números iguais');
    return false;
  }
  
  console.log('CPF aceito');
  return true;
};

const removeCPFFormatting = (cpf) => {
  return cpf.replace(/\D/g, '');
};

const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const normalizeEmail = (email) => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

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
  const [tipo, setTipo] = useState('paciente');

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

    if (!isValidDate(dataNascimento)) {
      setErro('Data de nascimento inválida');
      return;
    }

    if (!isNotFutureDate(dataNascimento)) {
      setErro('Data de nascimento não pode ser futura');
      return;
    }

    if (!isValidCPF(cpf)) {
      console.log('CPF inválido:', cpf);
      setErro('CPF inválido - deve ter 11 dígitos e não pode ser sequência de números iguais. Exemplo: 123.456.789-01');
      return;
    }

    if (!isValidEmail(email)) {
      setErro('Email inválido');
      return;
    }

    setLoading(true);
    try {
      console.log('Iniciando cadastro via backend local...');
      
      // Converter data de DD/MM/AAAA para AAAA-MM-DD
      const dataFormatada = formatDateForAPI(dataNascimento);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          email: normalizeEmail(email),
          senha,
          data_nascimento: dataFormatada, 
          tipo, 
          cpf: removeCPFFormatting(cpf),
          cidade,
          estado
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro no cadastro');
      }

      console.log('Cadastro realizado com sucesso:', data);
      
      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso! Você pode fazer login agora.',
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
      
      let errorMessage = 'Falha ao criar conta. Tente novamente.';
      
      if (error.message.includes('Email já cadastrado')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message.includes('duplicate key value violates unique constraint')) {
        errorMessage = 'CPF já cadastrado. Tente fazer login.';
      } else if (error.message.includes('Resposta inválida do servidor')) {
        errorMessage = 'Servidor não está respondendo. Verifique se o backend está rodando.';
      } else if (error.message.includes('Todos os campos são obrigatórios')) {
        errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      } else if (error.message.includes('Tipo de usuário inválido')) {
        errorMessage = 'Tipo de usuário inválido. Deve ser paciente ou dentista.';
      } else if (error.message.includes('Erro interno do servidor')) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      } else if (error.message.includes('Todos os campos são obrigatórios')) {
        errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErro(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
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

              <View style={styles.tipoContainer}>
              <Text style={styles.tipoLabel}>Tipo de usuário</Text>
              <View style={styles.tipoOptions}>
                <TouchableOpacity
                  style={[
                    styles.tipoOption,
                    tipo === 'paciente' && styles.tipoOptionSelected
                  ]}
                  onPress={() => setTipo('paciente')}
                >
                  <Text style={tipo === 'paciente' ? styles.tipoTextSelected : styles.tipoText}>Paciente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoOption,
                    tipo === 'dentista' && styles.tipoOptionSelected
                  ]}
                  onPress={() => setTipo('dentista')}
                >
                  <Text style={tipo === 'dentista' ? styles.tipoTextSelected : styles.tipoText}>Dentista</Text>
                </TouchableOpacity>
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
      </KeyboardAvoidingView>
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
    tipoContainer: {
    marginBottom: spacing.md,
  },
  tipoLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.textPrimary,
  },
  tipoOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipoOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.borderRadiusSmall,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: colors.background,
  },
  tipoOptionSelected: {
    backgroundColor: colors.primary,
  },
  tipoText: {
    color: colors.primary,
    fontSize: 16,
  },
  tipoTextSelected: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },

  });

export default CadastroScreen;
