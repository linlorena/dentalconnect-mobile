import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import API_CONFIG from '../../config/api';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth';
import Input from '../../components/common/Input';
import PasswordInput from '../../components/common/PasswordInput';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const {height } = Dimensions.get('window');

const ConfiguracoesScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setNome(user?.nome || '');
    setEmail(user?.email || '');
  }, [user]);

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalScaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const normalizeEmail = (email) => {
    if (!email) return '';
    return email.trim().toLowerCase();
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType('');
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  };

  const handleUpdateNome = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Nome não pode estar vazio");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: nome.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao atualizar nome');
      }

      const freshDataResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${user.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (freshDataResponse.ok) {
        const freshUserData = await freshDataResponse.json();
        if (user.updateUserData) {
          user.updateUserData(freshUserData);
        }
      } else {
        if (user.updateUserData) {
          user.updateUserData({ nome: nome.trim() });
        }
        console.warn("Falha ao buscar dados frescos do usuário após atualização de nome.");
      }
      
      Alert.alert("Sucesso", "Nome atualizado com sucesso!");
      closeModal();
      setRefreshKey(prev => prev + 1);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao atualizar nome:", error.message);
      Alert.alert("Erro", error.message || "Falha ao atualizar nome. Verifique o console para mais detalhes.");
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!isValidEmail(email)) {
      Alert.alert("Erro", "Email inválido");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizeEmail(email) }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao atualizar email');
      }

      const freshDataResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${user.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (freshDataResponse.ok) {
        const freshUserData = await freshDataResponse.json();
        if (user.updateUserData) {
          user.updateUserData(freshUserData);
        }
      } else {
        if (user.updateUserData) {
          user.updateUserData({ email: normalizeEmail(email) });
        }
        console.warn("Falha ao buscar dados frescos do usuário após atualização de email.");
      }
      
      Alert.alert("Sucesso", "Email atualizado com sucesso!");
      closeModal();
      setRefreshKey(prev => prev + 1);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao atualizar email:", error.message);
      Alert.alert("Erro", error.message || "Falha ao atualizar email. Verifique o console para mais detalhes.");
      setLoading(false);
    }
  };

  const handleUpdateSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 8) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${user.id}/password`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentPassword: senhaAtual,
          newPassword: novaSenha
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao atualizar senha');
      }

      const freshDataResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${user.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (freshDataResponse.ok) {
        const freshUserData = await freshDataResponse.json();
        if (user.updateUserData) {
          user.updateUserData(freshUserData);
        }
      } else {
        console.warn("Falha ao buscar dados frescos do usuário após atualização de senha.");
      }
      
      Alert.alert('Sucesso', 'Senha atualizada com sucesso!');
      closeModal();
      setRefreshKey(prev => prev + 1);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao atualizar senha:", error.message);
      Alert.alert('Erro', error.message || 'Falha ao atualizar senha. Verifique o console para mais detalhes.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    );
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'nome':
        return (
          <View style={styles.modalFormContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome completo</Text>
              <Input
                placeholder="Digite seu nome completo"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                style={styles.modalInput}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleUpdateNome}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'email':
        return (
          <View style={styles.modalFormContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <Input
                placeholder="Digite seu e-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.modalInput}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleUpdateEmail}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'senha':
        return (
          <View style={styles.modalFormContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha atual</Text>
              <PasswordInput
                placeholder="Digite sua senha atual"
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                style={styles.modalInput}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nova senha</Text>
              <PasswordInput
                placeholder="Digite sua nova senha"
                value={novaSenha}
                onChangeText={setNovaSenha}
                style={styles.modalInput}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmar nova senha</Text>
              <PasswordInput
                placeholder="Confirme sua nova senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                style={styles.modalInput}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleUpdateSenha}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'faq':
        return (
          <View style={styles.faqContent}>
            <View style={styles.faqItem}>
              <View style={styles.faqIconContainer}>
                <MaterialIcons name="schedule" size={20} color={colors.primary} />
              </View>
              <View style={styles.faqTextContainer}>
                <Text style={styles.faqQuestion}>Como agendar uma consulta?</Text>
                <Text style={styles.faqAnswer}>
                  Acesse a seção "Agendar" no menu principal, escolha o dentista e horário desejado.
                </Text>
              </View>
            </View>
            
            <View style={styles.faqItem}>
              <View style={styles.faqIconContainer}>
                <MaterialIcons name="cancel" size={20} color={colors.primary} />
              </View>
              <View style={styles.faqTextContainer}>
                <Text style={styles.faqQuestion}>Posso cancelar uma consulta?</Text>
                <Text style={styles.faqAnswer}>
                  Sim, você pode cancelar até 24 horas antes do horário agendado.
                </Text>
              </View>
            </View>
            
            <View style={styles.faqItem}>
              <View style={styles.faqIconContainer}>
                <MaterialIcons name="edit" size={20} color={colors.primary} />
              </View>
              <View style={styles.faqTextContainer}>
                <Text style={styles.faqQuestion}>Como alterar meus dados?</Text>
                <Text style={styles.faqAnswer}>
                  Acesse "Configurações" e clique em "Editar" ao lado do dado que deseja alterar.
                </Text>
              </View>
            </View>
            
            <View style={styles.faqItem}>
              <View style={styles.faqIconContainer}>
                <MaterialIcons name="lock-reset" size={20} color={colors.primary} />
              </View>
              <View style={styles.faqTextContainer}>
                <Text style={styles.faqQuestion}>Esqueci minha senha, e agora?</Text>
                <Text style={styles.faqAnswer}>
                  Na tela de login, clique em "Esqueci minha senha" e siga as instruções.
                </Text>
              </View>
            </View>
            
            <View style={styles.faqItem}>
              <View style={styles.faqIconContainer}>
                <MaterialIcons name="support-agent" size={20} color={colors.primary} />
              </View>
              <View style={styles.faqTextContainer}>
                <Text style={styles.faqQuestion}>Como entrar em contato com suporte?</Text>
                <Text style={styles.faqAnswer}>
                  Use a seção "Fale Conosco" no menu principal ou envie um email para suporte@dentalconnect.com
                </Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container} key={refreshKey}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Configurações</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}
        >
          <Animated.View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.nome || 'Usuário'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'email@exemplo.com'}</Text>
                <View style={styles.userTypeBadge}>
                  <Text style={styles.userTypeText}>
                    {user?.tipo === 'dentista' ? 'Dentista' : 'Paciente'}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            </View>
            
            <View style={styles.settingsList}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => openModal('nome')}
                activeOpacity={0.7}
              >
                <View style={styles.settingIconContainer}>
                  <MaterialIcons name="badge" size={22} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Nome Completo</Text>
                  <Text style={styles.settingValue}>{user?.nome || 'Não informado'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => openModal('email')}
                activeOpacity={0.7}
              >
                <View style={styles.settingIconContainer}>
                  <MaterialIcons name="email" size={22} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>E-mail</Text>
                  <Text style={styles.settingValue}>{user?.email || 'Não informado'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => openModal('senha')}
                activeOpacity={0.7}
              >
                <View style={styles.settingIconContainer}>
                  <MaterialIcons name="lock" size={22} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Senha</Text>
                  <Text style={styles.settingValue}>••••••••</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="help-outline" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Ajuda e Suporte</Text>
            </View>
            
            <View style={styles.settingsList}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => openModal('faq')}
                activeOpacity={0.7}
              >
                <View style={styles.settingIconContainer}>
                  <MaterialIcons name="quiz" size={22} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Perguntas Frequentes</Text>
                  <Text style={styles.settingSubtext}>Tire suas dúvidas</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.7}
              >
                <View style={styles.settingIconContainer}>
                  <MaterialIcons name="support-agent" size={22} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Suporte Técnico</Text>
                  <Text style={styles.settingSubtext}>Entre em contato</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.7}
              >
                <View style={styles.settingIconContainer}>
                  <MaterialIcons name="info-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Sobre o App</Text>
                  <Text style={styles.settingSubtext}>Versão 1.0.0</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="account-circle" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Conta</Text>
            </View>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <View style={styles.logoutIconContainer}>
                <MaterialIcons name="logout" size={22} color="white" />
              </View>
              <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Animated.View 
          style={[styles.modalOverlay, { opacity: modalOpacityAnim }]}
        >
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1}
            onPress={closeModal}
          />
          <Animated.View 
            style={[styles.modalContainer, { transform: [{ scale: modalScaleAnim }], opacity: modalOpacityAnim }]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'nome' && 'Editar Nome'}
                {modalType === 'email' && 'Editar Email'}
                {modalType === 'senha' && 'Alterar Senha'}
                {modalType === 'faq' && 'Perguntas Frequentes'}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {renderModalContent()}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  headerGradient: {
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.paddingHorizontal,
    paddingTop: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.paddingHorizontal,
    paddingTop: spacing.lg,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  userTypeBadge: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  settingsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingValue: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  settingSubtext: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutIconContainer: {
    marginRight: spacing.sm,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    maxHeight: height * 0.6,
  },
  modalFormContent: {
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginLeft: spacing.sm,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  faqContent: {
    padding: spacing.lg,
  },
  faqItem: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  faqIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  faqTextContainer: {
    flex: 1,
  },
  faqQuestion: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  faqAnswer: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ConfiguracoesScreen;
