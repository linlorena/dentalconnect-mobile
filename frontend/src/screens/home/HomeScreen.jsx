import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/auth';
import API_CONFIG from '../../config/api';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const { width } = Dimensions.get('window');

const getFirstName = (fullName) => {
  if (!fullName) return 'Usuário';
  return fullName.split(' ')[0];
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [agendamentosCount, setAgendamentosCount] = useState(0);
  const [realizadosCount, setRealizadosCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const menuAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

  const fetchStats = async () => {
    if (!user?.id || !user?.token) {
      setLoadingStats(false);
      return;
    }

    setLoadingStats(true);
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONSULTATION}/paciente/${user.id}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const agendamentos = await response.json();
        const agendados = agendamentos.filter(a => a.status !== 'realizado' && a.status !== 'cancelado').length;
        const realizados = agendamentos.filter(a => a.status === 'realizado').length;
        
        setAgendamentosCount(agendados);
        setRealizadosCount(realizados);
      } else {
        console.error('Erro ao buscar estatísticas:', response.status);
      }
    } catch (error) {
      console.error('Erro de rede ao buscar estatísticas:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleLogout = async () => {
    try { await signOut(); } catch (error) { console.error("Erro no logout:", error); }
  };

  const menuItems = [
    {
      title: "Agendar Consulta",
      icon: <Feather name="calendar" size={22} color={colors.primary} />,
      onPress: () => {
        setMenuVisible(false);
        navigation.navigate('AgendarConsulta');
      }
    },
    {
      title: "Buscar Dentistas",
      icon: <Feather name="search" size={22} color={colors.primary} />,
      onPress: () => {
        setMenuVisible(false);
        navigation.navigate('BuscarDentista');
      }
    },
    { 
      title: "Meus Agendamentos", 
      icon: <Feather name="calendar" size={22} color={colors.primary} />, 
      onPress: () => {
        setMenuVisible(false);
        navigation.navigate('DetalhesAgendamento');
      } 
    },
    { 
      title: "Procedimentos", 
      icon: <Feather name="activity" size={22} color={colors.primary} />, 
      onPress: () => {
        setMenuVisible(false);
        navigation.navigate('Procedimentos');
      } 
    },
    { 
      title: "Configurações", 
      icon: <Feather name="settings" size={22} color={colors.primary} />, 
      onPress: () => {
        setMenuVisible(false);
        navigation.navigate('Configuracoes');
      } 
    },
{ 
      title: "Suporte", 
      icon: <Feather name="headphones" size={22} color={colors.primary} />, 
      onPress: () => {
        navigation.navigate('FaleConosco'); // Lógica de navegação aplicada
        setMenuVisible(false);
      } 
    },

  ];

  const toggleMenu = () => {
    const toValue = menuVisible ? 0 : 1;
    setMenuVisible(!menuVisible);
    Animated.spring(menuAnimation, {
      toValue,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const onMenuItemPress = (item) => {
    toggleMenu();
    setTimeout(() => {
      item.onPress();
    }, 250);
  };

  const menuTranslateX = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.82, 0],
  });

  const overlayOpacity = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <View style={styles.menuIconContainer}>
            <Feather name="menu" size={24} color={colors.primary} />
          </View>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="tooth-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.logoText}>DentalConnect</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
          <View style={styles.welcomeGradient}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeTextSection}>
                <View style={styles.greetingContainer}><Text style={styles.greeting}>{getGreeting()}! 👋</Text></View>
                <Text style={styles.userName}>{getFirstName(user?.nome)}</Text>
                <Text style={styles.subtitle}>Bem-vindo ao DentalConnect</Text>
                <View style={styles.timeContainer}><Feather name="clock" size={12} color={colors.background} style={{ marginRight: 4 }} /><Text style={styles.timeText}>{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text></View>
              </View>
              <Animated.View style={[styles.logoContainerAnimated, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.logoGlow} /><MaterialCommunityIcons name="tooth-outline" size={42} color={colors.primary} style={styles.logoIcon} />
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.mainFeatures, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>O que você precisa hoje?</Text><View style={styles.sectionDivider} /></View>
          <View style={styles.featuresGrid}>
            <TouchableOpacity 
              style={[styles.featureCard, styles.primaryCard]} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AgendarConsulta')}
            >
              <View style={styles.cardGradient}>
                <View style={styles.cardGlassEffect} />
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons name="hospital-building" size={28} color={colors.primary} />
                  <View style={styles.cardIconGlow} />
                </View>
                <Text style={styles.cardTitle}>Agendar Consulta</Text>
                <Text style={styles.cardDescription}>Escolha sua cidade e clínica preferida</Text>
                <View style={styles.cardBadge}>
                  <Text style={styles.badgeText}>Rápido</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
                <View style={styles.cardShine} />
              </View>
            </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.featureCard, styles.secondaryCard]} 
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate('BuscarDentista');
                }}
              >
                <View style={styles.cardGradient}>
                  <View style={styles.cardIcon}>
                    <MaterialCommunityIcons name="account-search" size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.cardTitle}>Buscar Dentistas</Text>
                  <Text style={styles.cardDescription}>Encontre especialistas próximos</Text>
                  <View style={styles.cardBadge}>
                    <Text style={styles.badgeText}>Próximo</Text>
                  </View>
                  <View style={styles.cardArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.featureCard, styles.tertiaryCard]} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DetalhesAgendamento')}
            >
              <View style={styles.cardGradient}>
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons name="calendar-check" size={28} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Meus Agendamentos</Text>
                <Text style={styles.cardDescription}>Veja suas consultas marcadas</Text>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.featureCard, styles.quaternaryCard]} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Procedimentos')}
            >
              <View style={styles.cardGradient}>
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons name="clipboard-text-outline" size={28} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Procedimentos</Text>
                <Text style={styles.cardDescription}>Conheça nossos procedimentos</Text>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.quickInfo, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Suas Estatísticas</Text><View style={styles.sectionDivider} /></View>
          <View style={styles.infoCards}>
            <View style={[styles.infoCard, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}><View style={[styles.infoIconContainer, { backgroundColor: colors.primary + '15' }]}><MaterialCommunityIcons name="calendar-multiple" size={24} color={colors.primary} /></View><Text style={styles.infoNumber}>{loadingStats ? <ActivityIndicator size="small" color={colors.primary} /> : agendamentosCount}</Text><Text style={styles.infoLabel}>Consultas Agendadas</Text></View>
            <View style={[styles.infoCard, { borderLeftWidth: 4, borderLeftColor: '#10B981' }]}><View style={[styles.infoIconContainer, { backgroundColor: '#10B98115' }]}><MaterialCommunityIcons name="calendar-check-outline" size={24} color="#10B981" /></View><Text style={styles.infoNumber}>{loadingStats ? <ActivityIndicator size="small" color="#10B981" /> : realizadosCount}</Text><Text style={styles.infoLabel}>Consultas Realizadas</Text></View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.quickActions, { opacity: fadeAnim }]}>
          <View style={styles.quickActionsHeader}><Text style={styles.quickActionsTitle}>Ações Rápidas</Text></View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7} onPress={() => navigation.navigate('Configuracoes')}><View style={[styles.actionIconContainer, { backgroundColor: '#F3F4F6' }]}><Feather name="settings" size={24} color={colors.primary} /></View><Text style={styles.quickActionText}>Configurações</Text></TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7} onPress={() => navigation.navigate('FaleConosco')}><View style={[styles.actionIconContainer, { backgroundColor: '#F3F4F6' }]}><Feather name="headphones" size={24} color={colors.primary} /></View><Text style={styles.quickActionText}>Suporte</Text></TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleLogout} activeOpacity={0.7}><View style={[styles.actionIconContainer, { backgroundColor: '#FEE2E2' }]}><Feather name="log-out" size={24} color="#EF4444" /></View><Text style={styles.quickActionText}>Sair</Text></TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {menuVisible && (
        <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={toggleMenu} />
        </Animated.View>
      )}
      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuTranslateX }] }]}>
        <View style={styles.menuHeader}>
          <View style={styles.menuHeaderContent}><View style={styles.menuLogoContainer}><MaterialCommunityIcons name="tooth-outline" size={24} color={colors.primary} /></View><Text style={styles.menuTitle}>DentalConnect</Text></View>
          <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}><Feather name="x" size={24} color={colors.background} /></TouchableOpacity>
        </View>
        <ScrollView style={styles.menuContent}>
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Navegação</Text>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={() => onMenuItemPress(item)} activeOpacity={0.7}><View style={styles.menuItemIconContainer}>{item.icon}</View><Text style={styles.menuItemText}>{item.title}</Text><Feather name="chevron-right" size={18} color={colors.textSecondary} /></TouchableOpacity>
            ))}
          </View>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuLogoutItem} onPress={() => { toggleMenu(); setTimeout(handleLogout, 300); }} activeOpacity={0.7}><View style={styles.menuLogoutIconContainer}><Feather name="log-out" size={22} color="#EF4444" /></View><Text style={styles.menuLogoutText}>Sair da Conta</Text></TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuButton: {
    padding: 8
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30
  },
  welcomeContainer: {
    marginHorizontal: spacing.paddingHorizontal,
    marginTop: 20,
    marginBottom: 28,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12
  },
  welcomeGradient: {
    backgroundColor: colors.primary,
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden'
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -30,
    right: -20,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -20,
    left: -10,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2
  },
  welcomeTextSection: {
    flex: 1
  },
  greetingContainer: {
    marginBottom: 6
  },
  greeting: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textTransform: 'capitalize',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  timeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoContainerAnimated: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative'
  },
  logoIcon: {
    zIndex: 3
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
    zIndex: 1
  },
  mainFeatures: {
    paddingHorizontal: spacing.paddingHorizontal,
    marginBottom: 32
  },
  sectionHeader: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  sectionDivider: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    width: 60
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  featureCard: {
    width: (width - spacing.paddingHorizontal * 2 - 15) / 2,
    borderRadius: 24,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    minHeight: 160,
  },
  cardContent: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardIconWrapper: {
    marginBottom: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(15, 118, 110, 0.15)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  arrowText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '800',
  },
  primaryCard: {
    backgroundColor: '#E0F2F1',
  },
  secondaryCard: {
    backgroundColor: '#E3F2FD',
  },
  tertiaryCard: {
    backgroundColor: '#E0F7FA',
  },
  quaternaryCard: {
    backgroundColor: '#F3E5F5',
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlassEffect: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(15, 118, 110, 0.08)',
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(15, 118, 110, 0.15)',
  },
  cardIconGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(15, 118, 110, 0.08)',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 118, 110, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(15, 118, 110, 0.05)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  quickInfo: {
    paddingHorizontal: spacing.paddingHorizontal,
    marginBottom: 32
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  infoProgress: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '30%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  
  quickActions: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.paddingHorizontal,
    borderRadius: 24,
    marginTop: 8,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  quickActionsHeader: {
    paddingHorizontal: spacing.paddingHorizontal,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center'
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.paddingHorizontal
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    minWidth: 95
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)"
  },
  sideMenu: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.82,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  menuHeaderContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  menuLogoContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  menuContent: {
    flex: 1,
    paddingTop: 24,
    backgroundColor: '#F9FAFB',
  },
  menuSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginHorizontal: 12,
    borderRadius: 16,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 4,
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  menuItemIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
    marginVertical: 16
  },
  menuLogoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
  },
  menuLogoutIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLogoutText: {
    flex: 1,
    fontSize: 15,
    color: colors.error,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});

export default HomeScreen;
