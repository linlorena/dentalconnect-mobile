import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../context/auth';

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
  error: "#EF4444", // Adicionado para o status Fechado
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  paddingHorizontal: 16,
}

const ClinicasPorCidadeScreen = ({ route, navigation }) => {
  const { cidade } = route.params;
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    carregarClinicasPorCidade();
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

  const carregarClinicasPorCidade = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOCALS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const locaisData = await response.json();
        const clinicasFiltradas = locaisData.filter(local => local.cidade === cidade);
        setClinicas(clinicasFiltradas);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar as clínicas.');
      }
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as clínicas.');
    } finally {
      setLoading(false);
    }
  };

  const handleClinicaSelecionada = (clinica) => {
    // Animação de feedback
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

    setTimeout(() => {
      navigation.navigate('DetalhesLocal', { local: clinica });
    }, 200);
  };

  const verificarStatusClinica = (local) => {
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
              return { aberto: true, texto: 'Aberto' };
            } else {
              return { aberto: false, texto: 'Fechado' };
            }
          } else {
            return { aberto: false, texto: 'Fechado' };
          }
        }
      }
      
      const match24h = horarioStr.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
      if (match24h) {
        const horaAbertura = parseInt(match24h[1]) + parseInt(match24h[2]) / 60;
        const horaFechamento = parseInt(match24h[3]) + parseInt(match24h[4]) / 60;
        
        if (diaSemana >= 1 && diaSemana <= 5) {
          if (horaAtualDecimal >= horaAbertura && horaAtualDecimal < horaFechamento) {
            return { aberto: true, texto: 'Aberto' };
          } else {
            return { aberto: false, texto: 'Fechado' };
          }
        } else {
          return { aberto: false, texto: 'Fechado' };
        }
      }
    }

    if (diaSemana >= 1 && diaSemana <= 5) {
      if (horaAtualDecimal >= 8 && horaAtualDecimal < 18) {
        return { aberto: true, texto: 'Aberto' };
      } else {
        return { aberto: false, texto: 'Fechado' };
      }
    } else {
      return { aberto: false, texto: 'Fechado' };
    }
  };

  const renderClinica = ({ item, index }) => {
    const statusClinica = verificarStatusClinica(item);
    
    return (
      <Animated.View
        style={[
          styles.clinicaCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.clinicaCardContent}
          onPress={() => handleClinicaSelecionada(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardGradientBg} />

          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <MaterialCommunityIcons name="hospital-building" size={24} color={COLORS.white} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.clinicaNome}>{item.nome}</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: statusClinica.aberto ? COLORS.success : COLORS.error }]} />
                  <Text style={[styles.statusText, { color: statusClinica.aberto ? COLORS.success : COLORS.error }]}>
                    {statusClinica.texto}
                  </Text>
                </View>
              </View>
              <View style={styles.chevronIcon}>
                <Feather name="arrow-right" size={20} color={COLORS.primary} />
              </View>
            </View>
            
            <View style={styles.cardDivider} />
            
            <View style={styles.cardStats}>
              <View style={styles.statBadgeAddress}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color={COLORS.primary} />
                <Text style={styles.statText} numberOfLines={1}>
                  {item.endereco}
                </Text>
              </View>
              <View style={styles.statBadge}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.primary} />
                <Text style={styles.statText} numberOfLines={1}>
                  {item.horario || 'Seg-Sex: 8h-18h'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLoadingCard = () => (
    <View style={styles.loadingCard}>
      <Animated.View
        style={[
          styles.loadingIconContainer,
          {
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <MaterialCommunityIcons name="hospital-building" size={40} color={COLORS.primary} />
      </Animated.View>
      <Text style={styles.loadingText}>Carregando clínicas...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyStateCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="magnify-close" size={48} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.emptyStateText}>Nenhuma clínica encontrada</Text>
      <Text style={styles.emptyStateSubtext}>
        Não encontramos clínicas em {cidade}.{'\n'}
        Tente buscar em outra cidade.
      </Text>
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
          <Text style={styles.headerTitle}>Clínicas em {cidade}</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.cityBanner, // Novo estilo para o banner
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.cityBannerDecorative1} />
          <View style={styles.cityBannerDecorative2} />

          <View style={styles.cityBannerContent}>
            <View style={styles.cityBannerIcon}>
              <MaterialCommunityIcons name="city" size={48} color={COLORS.white} />
            </View>
            <View style={styles.cityBannerText}>
              <Text style={styles.cityBannerTitle}>{cidade}</Text>
              <Text style={styles.cityBannerSubtitle}>
                {clinicas.length} clínica{clinicas.length !== 1 ? 's' : ''} disponível{clinicas.length !== 1 ? 'is' : ''}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.clinicasContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.resultCounter}>
              <Text style={styles.resultCountText}>{clinicas.length}</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>
                Resultado{clinicas.length !== 1 ? "s" : ""} encontrado
                {clinicas.length !== 1 ? "s" : ""}
              </Text>
              <Text style={styles.sectionSubtitle}>Toque em uma clínica para ver detalhes</Text>
            </View>
          </View>

          {loading ? (
            renderLoadingCard()
          ) : clinicas.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={clinicas}
              renderItem={renderClinica}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.clinicasList}
            />
          )}
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
  scrollContent: {
    paddingHorizontal: SPACING.paddingHorizontal,
    paddingBottom: SPACING.xl,
  },
  // Novo estilo para o banner da cidade
  cityBanner: {
    backgroundColor: COLORS.primaryDark, // Cor mais escura para diferenciar
    borderRadius: 24,
    padding: SPACING.xl * 1.5, // Mais padding para destaque
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    overflow: "hidden",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cityBannerDecorative1: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.15,
  },
  cityBannerDecorative2: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.15,
  },
  cityBannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityBannerIcon: {
    width: 80, // Ícone maior
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.lg,
  },
  cityBannerText: {
    flex: 1,
  },
  cityBannerTitle: {
    fontSize: 24, // Título maior
    fontWeight: "900",
    color: COLORS.white,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  cityBannerSubtitle: {
    fontSize: 16, // Subtítulo maior
    color: COLORS.white,
    opacity: 0.9,
    fontWeight: "600",
  },
  // Fim dos novos estilos do banner
  clinicasContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  resultCounter: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  resultCountText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  clinicasList: {
    paddingBottom: 20,
  },
  clinicaCard: {
    marginBottom: SPACING.xl + 4,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    overflow: "hidden",
  },
  clinicaCardContent: {
    flex: 1,
  },
  cardGradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: COLORS.primary,
  },
  cardBody: {
    padding: SPACING.xl + 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeaderText: {
    flex: 1,
  },
  clinicaNome: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chevronIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  cardStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBadgeAddress: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: SPACING.md,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "700",
    marginLeft: SPACING.sm,
    letterSpacing: 0.1,
  },

  loadingCard: {
    backgroundColor: COLORS.white,
    padding: 48,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  loadingIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  emptyStateCard: {
    backgroundColor: COLORS.white,
    padding: 48,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
    textAlign: 'center',
  },
});

export default ClinicasPorCidadeScreen;
