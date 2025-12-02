import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: "#0F76AE",
  primaryLight: "#3598C9",
  primaryDark: "#0B5B87",
  accent: "#0F76AE",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  background: "#F8FAFC",
  backgroundAlt: "#F0F4F8",
  white: "#FFFFFF",
  border: "#DDE1E6",
  success: "#10B981",
  lightBlue: "#E6F3F9",
  lightBlueAccent: "#B3DCEF",
  teal: "#E0F2F1",
  purple: "#F3E5F5",
  error: "#EF4444",
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  paddingHorizontal: 16,
}

const DetalhesLocalScreen = ({ route, navigation }) => {
  const { local } = route.params;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const verificarStatusClinica = () => {
    const agora = new Date();
    const diaSemana = agora.getDay();
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();
    const horaAtualDecimal = horaAtual + minutoAtual / 60;

    if (local.horario) {
      const horarioStr = local.horario.toLowerCase();
      
      if (horarioStr.includes('seg') && horarioStr.includes('sex')) {
        const match = horarioStr.match(/(\d+)h-(\d+)h/);
        if (match) {
          const horaAbertura = parseInt(match[1]);
          const horaFechamento = parseInt(match[2]);
          
          if (diaSemana >= 1 && diaSemana <= 5) {
            if (horaAtualDecimal >= horaAbertura && horaAtualDecimal < horaFechamento) {
              return { aberto: true, texto: 'Aberto agora' };
            } else {
              return { aberto: false, texto: 'Fechado agora' };
            }
          } else {
            return { aberto: false, texto: 'Fechado agora' };
          }
        }
      }
      
      const match24h = horarioStr.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
      if (match24h) {
        const horaAbertura = parseInt(match24h[1]) + parseInt(match24h[2]) / 60;
        const horaFechamento = parseInt(match24h[3]) + parseInt(match24h[4]) / 60;
        
        if (diaSemana >= 1 && diaSemana <= 5) {
          if (horaAtualDecimal >= horaAbertura && horaAtualDecimal < horaFechamento) {
            return { aberto: true, texto: 'Aberto agora' };
          } else {
            return { aberto: false, texto: 'Fechado agora' };
          }
        } else {
          return { aberto: false, texto: 'Fechado agora' };
        }
      }
    }

    if (diaSemana >= 1 && diaSemana <= 5) {
      if (horaAtualDecimal >= 8 && horaAtualDecimal < 18) {
        return { aberto: true, texto: 'Aberto agora' };
      } else {
        return { aberto: false, texto: 'Fechado agora' };
      }
    } else {
      return { aberto: false, texto: 'Fechado agora' };
    }
  };

  const statusClinica = verificarStatusClinica();

  useEffect(() => {
    iniciarAnimacoes();
  }, []);

  const iniciarAnimacoes = () => {
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
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
  };

  const handleAgendarConsulta = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate('SelecionarHorario', {
      clinicaId: local.id,
      nomeDaClinica: local.nome,
    });
  };

  const handleCall = () => {
    if (local.telefone) {
      Linking.openURL(`tel:${local.telefone}`);
    }
  };

  const handleDirections = () => {
    const address = encodeURIComponent(local.endereco);
    Linking.openURL(`https://maps.google.com/?q=${address}`);
  };

  const renderInfoCard = (icon, label, value, onPress = null) => (
    <Animated.View
      style={[
        styles.infoCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.infoCardContent}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.cardGradientBg} />
        <View style={styles.infoBody}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIcon}>
              <Ionicons name={icon} size={24} color={COLORS.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {value || 'Não informado'}
              </Text>
            </View>
            {onPress && (
              <View style={styles.chevronIcon}>
                <Feather name="arrow-right" size={20} color={COLORS.primary} />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderServiceTag = (servico, index) => (
    <Animated.View
      key={index}
      style={[
        styles.serviceTag,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.serviceTagContent}>
        <MaterialCommunityIcons name="tooth-outline" size={16} color={COLORS.primary} />
        <Text style={styles.serviceTagText}>{servico}</Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack && navigation.goBack()}>
          <View style={styles.backButtonContainer}>
            <Feather name="arrow-left" size={24} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Detalhes da Clínica</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Banner Único para Detalhes da Clínica */}
          <Animated.View
            style={[
              styles.clinicDetailBanner,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.bannerDecorative1} />
            <View style={styles.bannerDecorative2} />

            <View style={styles.bannerContent}>
              <View style={styles.bannerIcon}>
                <MaterialCommunityIcons name="hospital-box" size={48} color={COLORS.white} />
              </View>
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>{local.nome}</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusDot, 
                    { backgroundColor: statusClinica.aberto ? COLORS.success : COLORS.error }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: COLORS.white } // Cor do texto do status branca para contraste no banner escuro
                  ]}>
                    {statusClinica.texto}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Card de informações principais */}
          <Animated.View
            style={[
              styles.mainCard,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <View style={styles.mainCardBody}>
              <Text style={styles.mainDescription}>
                Clínica odontológica moderna com equipamentos de última geração e profissionais especializados.
              </Text>
            </View>
          </Animated.View>

          {/* Informações de contato */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações de Contato</Text>
            {renderInfoCard('location-outline', 'Endereço', local.endereco, handleDirections)}
            {renderInfoCard('call-outline', 'Telefone', local.telefone, handleCall)}
            {renderInfoCard('time-outline', 'Horário', local.horario || 'Seg-Sex: 8h-18h')}
            {renderInfoCard('mail-outline', 'Email', local.email)}
          </View>

          {/* Serviços oferecidos */}
          {local.servicos && local.servicos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Serviços Oferecidos</Text>
              <Animated.View
                style={[
                  styles.servicesCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <View style={styles.servicesGrid}>
                  {local.servicos.map(renderServiceTag)}
                </View>
              </Animated.View>
            </View>
          )}

          {/* Botão de Ação */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAgendarConsulta}
              activeOpacity={0.8}
            >
              <View style={styles.primaryButtonContent}>
                <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>Agendar Consulta</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.paddingHorizontal,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.paddingHorizontal,
    paddingBottom: SPACING.xl * 2,
  },
  content: {
    flex: 1,
  },
  // Banner Único para Detalhes da Clínica
  clinicDetailBanner: {
    backgroundColor: COLORS.primaryDark, // Cor mais escura para um visual mais premium
    borderRadius: 24,
    padding: SPACING.xl * 1.5,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    overflow: "hidden",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 12,
  },
  bannerDecorative1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.1,
  },
  bannerDecorative2: {
    position: "absolute",
    bottom: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.1,
  },
  bannerContent: {
    flexDirection: "column", // Alinhamento vertical para mais personalidade
    alignItems: "flex-start",
  },
  bannerIcon: {
    width: 90, // Ícone ainda maior
    height: 90,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 28, // Título ainda maior
    fontWeight: "900",
    color: COLORS.white,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Fim do Banner

  mainCard: {
    marginBottom: SPACING.xl,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  mainCardBody: {
    padding: SPACING.xl,
  },
  mainDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },

  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    letterSpacing: -0.3,
  },

  // Info Card (Endereço, Telefone, etc.)
  infoCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  infoCardContent: {
    flex: 1,
  },
  cardGradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.lightBlueAccent,
  },
  infoBody: {
    padding: SPACING.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chevronIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
  },

  // Serviços
  servicesCard: {
    borderRadius: 16,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  serviceTag: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceTagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBlue,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },
  serviceTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginLeft: SPACING.xs,
  },

  // Botões de Ação
  actionsContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    marginLeft: SPACING.sm,
    letterSpacing: -0.3,
  },
});

export default DetalhesLocalScreen;
