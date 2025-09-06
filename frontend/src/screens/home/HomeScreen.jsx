import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
  Modal,
} from 'react-native';
import { Image } from "react-native";
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/auth';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuSlideAnim] = useState(new Animated.Value(-width * 0.8));

  useEffect(() => {
    // Animação de entrada mais sofisticada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Atualizar hora a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Dados dos tratamentos organizados em slides
  const treatmentsData = [
    [
      { id: 1, emoji: '🧽', title: 'Limpeza Dental', description: 'Profilaxia e remoção de tártaro' },
      { id: 2, emoji: '🔧', title: 'Restauração', description: 'Correção de cáries e fraturas' },
      { id: 3, emoji: '🔬', title: 'Canal', description: 'Tratamento endodôntico' },
      { id: 4, emoji: '⚙️', title: 'Implante', description: 'Reabilitação oral' },
    ],
    [
      { id: 5, emoji: '🦷', title: 'Ortodontia', description: 'Aparelhos ortodônticos' },
      { id: 6, emoji: '👑', title: 'Prótese', description: 'Coroas e pontes' },
      { id: 7, emoji: '✨', title: 'Clareamento', description: 'Clareamento dental' },
      { id: 8, emoji: '🏥', title: 'Cirurgia', description: 'Extração e cirurgias' },
    ],
    [
      { id: 9, emoji: '🦷', title: 'Periodontia', description: 'Tratamento gengival' },
      { id: 10, emoji: '👶', title: 'Odontopediatria', description: 'Cuidados infantis' },
      { id: 11, emoji: '🦷', title: 'Estética', description: 'Procedimentos estéticos' },
      { id: 12, emoji: '🦷', title: 'Emergência', description: 'Atendimento urgente' },
    ],
  ];

  const renderTreatmentSlide = ({ item }) => (
    <View style={styles.treatmentSlide}>
      <View style={styles.treatmentRow}>
        <View style={styles.treatmentCard}>
          <View style={styles.treatmentIcon}>
            <Text style={styles.treatmentEmoji}>{item[0].emoji}</Text>
          </View>
          <Text style={styles.treatmentTitle}>{item[0].title}</Text>
          <Text style={styles.treatmentDescription}>{item[0].description}</Text>
        </View>

        <View style={styles.treatmentCard}>
          <View style={styles.treatmentIcon}>
            <Text style={styles.treatmentEmoji}>{item[1].emoji}</Text>
          </View>
          <Text style={styles.treatmentTitle}>{item[1].title}</Text>
          <Text style={styles.treatmentDescription}>{item[1].description}</Text>
        </View>
      </View>

      <View style={styles.treatmentRow}>
        <View style={styles.treatmentCard}>
          <View style={styles.treatmentIcon}>
            <Text style={styles.treatmentEmoji}>{item[2].emoji}</Text>
          </View>
          <Text style={styles.treatmentTitle}>{item[2].title}</Text>
          <Text style={styles.treatmentDescription}>{item[2].description}</Text>
        </View>

        <View style={styles.treatmentCard}>
          <View style={styles.treatmentIcon}>
            <Text style={styles.treatmentEmoji}>{item[3].emoji}</Text>
          </View>
          <Text style={styles.treatmentTitle}>{item[3].title}</Text>
          <Text style={styles.treatmentDescription}>{item[3].description}</Text>
        </View>
      </View>
    </View>
  );

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {treatmentsData.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            currentSlide === index && styles.paginationDotActive
          ]}
          onPress={() => {
            setCurrentSlide(index);
            flatListRef.current?.scrollToIndex({ index, animated: true });
          }}
        />
      ))}
    </View>
  );

  const handleLogout = async () => {
    try {
      await signOut()
      console.log("Logout realizado com sucesso")
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }

  const menuItems = [
    { 
      title: "Buscar Dentistas", 
      icon: <Feather name="search" size={22} color={colors.primary} />, 
      onPress: () => {
        console.log('Buscar Dentistas');
        setMenuVisible(false);
      } 
    },
    { 
      title: "Meus Agendamentos", 
      icon: <Feather name="calendar" size={22} color={colors.primary} />, 
      onPress: () => {
        console.log('Meus Agendamentos');
        setMenuVisible(false);
      } 
    },
    { 
      title: "Relatórios", 
      icon: <Feather name="bar-chart-2" size={22} color={colors.primary} />, 
      onPress: () => {
        console.log('Relatórios');
        setMenuVisible(false);
      } 
    },
    { 
      title: "Configurações", 
      icon: <Feather name="settings" size={22} color={colors.primary} />, 
      onPress: () => {
        console.log('Configurações');
        setMenuVisible(false);
      } 
    },
    { 
      title: "Suporte", 
      icon: <Feather name="headphones" size={22} color={colors.primary} />, 
      onPress: () => {
        console.log('Suporte');
        setMenuVisible(false);
      } 
    },
  ];

  useEffect(() => {
    if (menuVisible) {
      Animated.timing(menuSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(menuSlideAnim, {
        toValue: -width * 0.8,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        menuSlideAnim.setValue(-width * 0.8);
      });
    }
  }, [menuVisible, menuSlideAnim]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <View style={styles.menuIconContainer}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>DentalConnect</Text>
        </View>
      </View>


      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Section Moderna */}
        <Animated.View style={[styles.welcomeContainer, { 
          opacity: fadeAnim, 
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ] 
        }]}>
          <View style={styles.welcomeGradient}>
            <View style={styles.welcomePattern} />
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeTextSection}>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
                  <View style={styles.greetingGlow} />
                </View>
                <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Usuário'}</Text>
                <Text style={styles.subtitle}>Bem-vindo ao DentalConnect</Text>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {currentTime.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              </View>
              <Animated.View style={[styles.logoContainerAnimated, {
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }]}>
                <Text style={styles.logo}>🦷</Text>
                <View style={styles.logoGlow} />
                <View style={styles.logoRing} />
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* Cards de funcionalidades principais */}
        <Animated.View style={[styles.mainFeatures, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>O que você precisa hoje?</Text>
            <View style={styles.sectionDivider} />
          </View>
          
          <View style={styles.featuresGrid}>
            <TouchableOpacity style={[styles.featureCard, styles.primaryCard]} activeOpacity={0.8}>
              <View style={styles.cardGradient}>
                <View style={styles.cardGlassEffect} />
                <View style={styles.cardIcon}>
                  <Text style={styles.cardEmoji}>📅</Text>
                  <View style={styles.cardIconGlow} />
                </View>
                <Text style={styles.cardTitle}>Agendar Consulta</Text>
                <Text style={styles.cardDescription}>Marque sua consulta</Text>
                <View style={styles.cardBadge}>
                  <Text style={styles.badgeText}>Popular</Text>
                </View>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
                <View style={styles.cardShine} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featureCard, styles.secondaryCard]} activeOpacity={0.8}>
              <View style={styles.cardGradient}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardEmoji}>🔍</Text>
                </View>
                <Text style={styles.cardTitle}>Buscar Dentistas</Text>
                <Text style={styles.cardDescription}>Encontre profissionais</Text>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featureCard, styles.tertiaryCard]} activeOpacity={0.8}>
              <View style={styles.cardGradient}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardEmoji}>📋</Text>
                </View>
                <Text style={styles.cardTitle}>Meus Agendamentos</Text>
                <Text style={styles.cardDescription}>Veja suas consultas</Text>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featureCard, styles.quaternaryCard]} activeOpacity={0.8}>
              <View style={styles.cardGradient}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardEmoji}>📊</Text>
                </View>
                <Text style={styles.cardTitle}>Relatórios</Text>
                <Text style={styles.cardDescription}>Acompanhe seu histórico</Text>
                <View style={styles.cardArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Seção de informações rápidas */}
        <Animated.View style={[styles.quickInfo, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suas Estatísticas</Text>
            <View style={styles.sectionDivider} />
          </View>
          
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>📅</Text>
              </View>
              <Text style={styles.infoNumber}>0</Text>
              <Text style={styles.infoLabel}>Consultas Agendadas</Text>
              <View style={styles.infoProgress}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
              </View>
            </View>
            
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Text style={styles.infoIcon}>✅</Text>
              </View>
              <Text style={styles.infoNumber}>0</Text>
              <Text style={styles.infoLabel}>Consultas Realizadas</Text>
              <View style={styles.infoProgress}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Seção de tratamentos com carrossel */}
        <Animated.View style={[styles.treatmentsSection, { opacity: fadeAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Conheça nossos tratamentos</Text>
            <View style={styles.sectionDivider} />
          </View>
          
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={treatmentsData}
              renderItem={renderTreatmentSlide}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentSlide(slideIndex);
              }}
              style={styles.carousel}
            />
            
            {renderPaginationDots()}
          </View>
        </Animated.View>


        {/* Ações rápidas modernas */}
        <Animated.View style={[styles.quickActions, { opacity: fadeAnim }]}>
          <View style={styles.quickActionsHeader}>
            <Text style={styles.quickActionsTitle}>Ações Rápidas</Text>
            <View style={styles.quickActionsSubtitle}>
              <Text style={styles.quickActionsSubtitleText}>Acesso rápido às principais funcionalidades</Text>
            </View>
          </View>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.quickActionEmoji}>⚙️</Text>
                <View style={styles.actionIconGlow} />
              </View>
              <Text style={styles.quickActionText}>Configurações</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.quickActionEmoji}>📞</Text>
                <View style={styles.actionIconGlow} />
              </View>
              <Text style={styles.quickActionText}>Suporte</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionButton} onPress={handleLogout} activeOpacity={0.7}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.quickActionEmoji}>🚪</Text>
                <View style={styles.actionIconGlow} />
              </View>
              <Text style={styles.quickActionText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Side Menu Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="none"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackground} onPress={() => setMenuVisible(false)} />
          <Animated.View style={[styles.sideMenu, { left: menuSlideAnim }]}>
            <View style={styles.menuHeader}>
              <View style={styles.menuHeaderContent}>
                <View style={styles.menuLogoContainer}>
                  <Text style={styles.menuLogo}>🦷</Text>
                </View>
                <Text style={styles.menuTitle}>DentalConnect</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setMenuVisible(false)}>
                <Feather name="x" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuContent}>
              <View style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>Navegação</Text>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => {
                      item.onPress();
                    }}
                  >
                    <View style={styles.menuItemIconContainer}>
                      {item.icon}
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    <Feather name="chevron-right" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.menuDivider} />
              
              {/* Botão Sair */}
              <TouchableOpacity
                style={styles.menuLogoutItem}
                onPress={() => {
                  handleLogout();
                  setMenuVisible(false);
                }}
              >
                <View style={styles.menuLogoutIconContainer}>
                  <Feather name="log-out" size={22} color="#FF6B35" />
                </View>
                <Text style={styles.menuLogoutText}>Sair da Conta</Text>
                <Feather name="chevron-right" size={16} color="#FF6B35" />
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
  },
  menuIconContainer: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: '100%',
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  logoutHeaderButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
  },
  logoutHeaderText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  
  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  welcomeContainer: {
    marginHorizontal: spacing.paddingHorizontal,
    marginBottom: 25,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeGradient: {
    backgroundColor: colors.primary,
    paddingTop: 25,
    paddingBottom: 35,
    paddingHorizontal: spacing.paddingHorizontal,
    position: 'relative',
    overflow: 'hidden',
  },
  welcomePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 25,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  welcomeTextSection: {
    flex: 1,
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 35,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  welcomeSection: {
    flex: 1,
  },
  greetingContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.9,
    fontWeight: '600',
    zIndex: 2,
  },
  greetingGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    zIndex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 14,
    color: colors.background,
    opacity: 0.8,
    marginBottom: 8,
  },
  timeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 12,
    color: colors.background,
    fontWeight: '600',
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logoContainerAnimated: {
    width: 75,
    height: 75,
    backgroundColor: colors.background,
    borderRadius: 37.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  logo: {
    fontSize: 34,
    zIndex: 3,
  },
  logoGlow: {
    position: 'absolute',
    width: 85,
    height: 85,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 42.5,
    top: -5,
    left: -5,
    zIndex: 1,
  },
  logoRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 45,
    top: -7.5,
    left: -7.5,
    zIndex: 0,
  },
  
  // Main features styles
  mainFeatures: {
    paddingHorizontal: spacing.paddingHorizontal,
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    width: 50,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - spacing.paddingHorizontal * 2 - 15) / 2,
    backgroundColor: colors.background,
    borderRadius: 28,
    marginBottom: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
  },
  cardGlassEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 28,
    zIndex: 1,
  },
  primaryCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.primary,
    backgroundColor: 'rgba(15, 118, 110, 0.03)',
  },
  secondaryCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.info,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
  },
  tertiaryCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
  },
  quaternaryCard: {
    borderLeftWidth: 6,
    borderLeftColor: colors.warning,
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
  },
  cardIcon: {
    width: 65,
    height: 65,
    backgroundColor: colors.secondary,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    zIndex: 2,
  },
  cardIconGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    borderRadius: 35,
    top: -2.5,
    left: -2.5,
    zIndex: 1,
  },
  cardEmoji: {
    fontSize: 30,
    zIndex: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: 11,
    color: colors.background,
    fontWeight: '700',
  },
  cardArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 28,
    height: 28,
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: colors.background,
    fontWeight: '700',
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-15deg' }],
    zIndex: 1,
  },
  
  // Quick info styles
  quickInfo: {
    paddingHorizontal: spacing.paddingHorizontal,
    marginBottom: 30,
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
    overflow: 'hidden',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 8,
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
  
  // Treatments section styles
  treatmentsSection: {
    paddingHorizontal: spacing.paddingHorizontal,
    marginBottom: 40,
  },
  carouselContainer: {
    height: 280,
  },
  carousel: {
    height: 200,
  },
  treatmentSlide: {
    width: width - spacing.paddingHorizontal * 2,
    paddingHorizontal: 0,
    height: 200,
  },
  treatmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    flex: 1,
  },
  treatmentCard: {
    width: (width - spacing.paddingHorizontal * 2 - 20) / 2,
    height: 90,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  treatmentIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  treatmentEmoji: {
    fontSize: 18,
  },
  treatmentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  treatmentDescription: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 12,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    height: 40,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  
  // Quick actions styles
  quickActions: {
    backgroundColor: colors.secondary,
    marginHorizontal: spacing.paddingHorizontal,
    borderRadius: 28,
    marginTop: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickActionsHeader: {
    paddingHorizontal: spacing.paddingHorizontal,
    paddingTop: 25,
    paddingBottom: 20,
    alignItems: 'center',
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  quickActionsSubtitle: {
    marginBottom: 5,
  },
  quickActionsSubtitleText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.paddingHorizontal,
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 20,
    minWidth: 95,
    backgroundColor: colors.background,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
    overflow: 'hidden',
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: colors.secondary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  actionIconGlow: {
    position: 'absolute',
    width: 55,
    height: 55,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    borderRadius: 27.5,
    top: -2.5,
    left: -2.5,
    zIndex: 1,
  },
  quickActionEmoji: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: spacing.paddingVertical,
  },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F4FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    position: "relative",
  },
  avatarText: {
    fontSize: 24,
    color: colors.primary,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  question: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sideMenu: {
    position: "absolute", 
    left: 0,             
    top: 0,               
    bottom: 0,            
    width: width * 0.8,
    backgroundColor: "#fff",
    paddingTop: 50,
    zIndex: 10,           
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuLogoContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  menuLogo: {
    fontSize: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.background,
  },
  closeButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuContent: {
    flex: 1,
    paddingTop: spacing.md,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: spacing.borderRadius,
    backgroundColor: 'transparent',
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  menuLogoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: spacing.borderRadius,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  menuLogoutIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuLogoutText: {
    flex: 1,
    fontSize: 16,
    color: "#FF6B35",
    fontWeight: "600",
  },
  
})

export default HomeScreen
