import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import API_CONFIG from '../../config/api';

const { width } = Dimensions.get('window');

const procedureGradients = [
  ['#E8F5E9', '#F1F8E9'],
  ['#E0F2F1', '#E8F5E9'],
  ['#E3F2FD', '#E1F5FE'],
  ['#E0F7FA', '#E0F2F1'],
  ['#F3E5F5', '#F1F8E9'],
  ['#E8EAF6', '#E3F2FD'],
  ['#FCE4EC', '#FFF3E0'],
  ['#E0F7FA', '#E1F5FE'],
  ['#E8F5E9', '#F1F8E9'],
  ['#E0F2F1', '#E8F5E9'],
  ['#E3F2FD', '#E0F2F1'],
  ['#F3E5F5', '#E8EAF6'],
];

const procedureIcons = [
  'tooth-outline', 'sparkles', 'medical-bag', 'shield-checkmark',
  'screw-lag', 'format-align-justify', 'crown', 'hospital-box',
  'water', 'heart-pulse', 'star-circle', 'leaf'
];

const ProcedimentosScreen = ({ navigation }) => {
  const [procedimentos, setProcedimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardAnimations = useRef([]).current;

  useEffect(() => {
    carregarProcedimentos();
    iniciarAnimacoes();
  }, []);

  useEffect(() => {
    if (procedimentos.length > 0 && !loading) {
      procedimentos.forEach((_, index) => {
        if (!cardAnimations[index]) {
          cardAnimations[index] = {
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(30),
            scale: new Animated.Value(0.95),
          };
        }
      });

      procedimentos.forEach((_, index) => {
        if (cardAnimations[index]) {
          Animated.parallel([
            Animated.timing(cardAnimations[index].opacity, {
              toValue: 1,
              duration: 400,
              delay: index * 80,
              useNativeDriver: true,
            }),
            Animated.spring(cardAnimations[index].translateY, {
              toValue: 0,
              delay: index * 80,
              tension: 50,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(cardAnimations[index].scale, {
              toValue: 1,
              delay: index * 80,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });
    }
  }, [procedimentos, loading]);

  const iniciarAnimacoes = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const carregarProcedimentos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar procedimentos');
      }

      const data = await response.json();
      setProcedimentos(data || []);
    } catch (err) {
      console.error('Erro ao carregar procedimentos:', err);
      setError('Não foi possível carregar os procedimentos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getIconForProcedimento = (nomeProcedimento, index) => {
    if (!nomeProcedimento) return procedureIcons[index % procedureIcons.length];
    
    const nomeLower = nomeProcedimento.toLowerCase();
    
    if (nomeLower.includes('clareamento') || nomeLower.includes('clarear')) {
      return 'sparkles';
    }
    if (nomeLower.includes('ortodontia') || nomeLower.includes('aparelho')) {
      return 'format-align-justify';
    }
    if (nomeLower.includes('implante') || nomeLower.includes('implanto')) {
      return 'screw-lag';
    }
    if (nomeLower.includes('limpeza') || nomeLower.includes('profilaxia')) {
      return 'tooth-outline';
    }
    if (nomeLower.includes('restauração') || nomeLower.includes('restauracao')) {
      return 'medical-bag';
    }
    if (nomeLower.includes('canal') || nomeLower.includes('endodontia')) {
      return 'shield-checkmark';
    }
    if (nomeLower.includes('prótese') || nomeLower.includes('protese')) {
      return 'crown';
    }
    if (nomeLower.includes('cirurgia') || nomeLower.includes('extração')) {
      return 'hospital-box';
    }
    
    return procedureIcons[index % procedureIcons.length];
  };

  const getGradientForIndex = (index) => {
    return procedureGradients[index % procedureGradients.length];
  };

  const renderProcedimentoCard = (procedimento, index) => {
    const icon = getIconForProcedimento(procedimento.nome, index);
    const gradientColors = getGradientForIndex(index);
    const cardAnim = cardAnimations[index] || {
      opacity: fadeAnim,
      translateY: slideAnim,
      scale: new Animated.Value(1),
    };
    
    return (
      <Animated.View
        key={procedimento.id || index}
        style={[
          styles.card,
          {
            opacity: cardAnim.opacity,
            transform: [
              { translateY: cardAnim.translateY },
              { scale: cardAnim.scale }
            ]
          }
        ]}
      >
        <View style={styles.cardContent}>
          <LinearGradient
            colors={gradientColors}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardInner}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={icon} size={28} color={colors.primary} />
                </View>
              </View>
              
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {procedimento.nome || 'Procedimento'}
                </Text>
                <Text style={styles.cardDescription} numberOfLines={3}>
                  {procedimento.descricao || 'Descrição não disponível'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <LinearGradient
        colors={[colors.primary, '#0d9488']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Ionicons name="medical" size={28} color={colors.white} />
            <Text style={styles.headerTitle}>Nossos Procedimentos</Text>
          </View>
          
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.descriptionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.descriptionHeader}>
            <Ionicons name="information-circle" size={24} color={colors.primary} />
            <Text style={styles.descriptionTitle}>Conheça nossos procedimentos</Text>
          </View>
          <Text style={styles.descriptionText}>
            Oferecemos uma ampla gama de tratamentos odontológicos com tecnologia de ponta e profissionais especializados. 
            Nossa equipe está pronta para cuidar do seu sorriso com excelência e dedicação.
          </Text>
        </Animated.View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Carregando procedimentos...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="alert-circle-outline" size={56} color={colors.error || '#FF6B6B'} />
            </View>
            <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={carregarProcedimentos}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, '#0d9488']}
                style={styles.retryButtonGradient}
              >
                <Ionicons name="refresh" size={20} color={colors.white} />
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && procedimentos.length > 0 && (
          <View style={styles.procedimentosGrid}>
            {procedimentos.map((procedimento, index) => 
              renderProcedimentoCard(procedimento, index)
            )}
          </View>
        )}

        {!loading && !error && procedimentos.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="medical-outline" size={72} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum procedimento disponível</Text>
            <Text style={styles.emptyText}>
              Não há procedimentos cadastrados no momento.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={carregarProcedimentos}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color={colors.white} />
              <Text style={styles.emptyButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  descriptionContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  procedimentosGrid: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  cardContent: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: spacing.xl,
    minHeight: 160,
  },
  cardInner: {
    flex: 1,
  },
  cardHeader: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 118, 110, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 26,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 3,
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProcedimentosScreen;
