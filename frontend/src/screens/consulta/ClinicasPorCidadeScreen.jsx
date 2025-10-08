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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../context/auth';

const { width, height } = Dimensions.get('window');

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

    // Animação de pulso contínua
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

  const renderClinica = ({ item, index }) => {
    const isOpen = Math.random() > 0.3; // Simulação de status aberto/fechado
    
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.clinicaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.clinicaHeader}>
              <View style={styles.clinicaIconContainer}>
                <Ionicons name="medical" size={24} color={colors.primary} />
              </View>
              <View style={styles.clinicaInfo}>
                <Text style={styles.clinicaNome}>{item.nome}</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: isOpen ? colors.success : colors.error }]} />
                  <Text style={[styles.statusText, { color: isOpen ? colors.success : colors.error }]}>
                    {isOpen ? 'Aberto' : 'Fechado'}
                  </Text>
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </View>
            </View>
            
            <View style={styles.clinicaDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText} numberOfLines={2}>
                  {item.endereco}
                </Text>
              </View>
              
              {item.telefone && (
                <View style={styles.detailRow}>
                  <Ionicons name="call" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{item.telefone}</Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>
                  {item.horario || 'Seg-Sex: 8h-18h'}
                </Text>
              </View>
            </View>
            
            <View style={styles.clinicaFooter}>
              <View style={styles.clinicaBadge}>
                <Ionicons name="star" size={14} color={colors.white} />
                <Text style={styles.clinicaBadgeText}>4.8</Text>
              </View>
              <Text style={styles.clinicaAction}>Toque para ver detalhes</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLoadingCard = () => (
    <View style={styles.loadingCard}>
      <Animated.View
        style={[
          styles.loadingIcon,
          {
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <Ionicons name="medical" size={32} color={colors.primary} />
      </Animated.View>
      <Text style={styles.loadingText}>Carregando clínicas...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.emptyIcon}>
        <Ionicons name="medical-outline" size={64} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Nenhuma clínica encontrada</Text>
      <Text style={styles.emptyDescription}>
        Não encontramos clínicas em {cidade}.{'\n'}
        Tente buscar em outra cidade.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header com gradiente */}
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
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Animated.View
              style={[
                styles.headerIcon,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <Ionicons name="location" size={32} color={colors.white} />
            </Animated.View>
            <Text style={styles.headerTitle}>Clínicas em</Text>
            <Text style={styles.headerSubtitle}>{cidade}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Card de informações da cidade */}
        <Animated.View
          style={[
            styles.cidadeCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.cidadeGradient}
          >
            <View style={styles.cidadeHeader}>
              <View style={styles.cidadeIcon}>
                <Ionicons name="location" size={28} color={colors.primary} />
              </View>
              <View style={styles.cidadeInfo}>
                <Text style={styles.cidadeNome}>{cidade}</Text>
                <Text style={styles.cidadeClinicas}>
                  {clinicas.length} clínica{clinicas.length !== 1 ? 's' : ''} disponível{clinicas.length !== 1 ? 'is' : ''}
                </Text>
              </View>
              <View style={styles.cidadeBadge}>
                <Text style={styles.cidadeBadgeText}>Ativo</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Lista de clínicas */}
        <View style={styles.clinicasContainer}>
          {loading ? (
            renderLoadingCard()
          ) : clinicas.length > 0 ? (
            <FlatList
              data={clinicas}
              renderItem={renderClinica}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.clinicasList}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            renderEmptyState()
          )}
        </View>

        {/* Botão de ação flutuante */}
        <Animated.View
          style={[
            styles.floatingAction,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, '#0d9488']}
              style={styles.floatingGradient}
            >
              <Ionicons name="arrow-back" size={20} color={colors.white} />
              <Text style={styles.floatingText}>Voltar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  cidadeCard: {
    marginBottom: spacing.lg,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cidadeGradient: {
    borderRadius: 20,
    padding: spacing.lg,
  },
  cidadeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cidadeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cidadeInfo: {
    flex: 1,
  },
  cidadeNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cidadeClinicas: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cidadeBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  cidadeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  clinicasContainer: {
    flex: 1,
  },
  clinicasList: {
    paddingBottom: 100,
  },
  clinicaCard: {
    marginBottom: spacing.md,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  clinicaCardContent: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  clinicaGradient: {
    padding: spacing.lg,
  },
  clinicaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clinicaIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  clinicaInfo: {
    flex: 1,
  },
  clinicaNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicaDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  clinicaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clinicaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  clinicaBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  clinicaAction: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  separator: {
    height: spacing.sm,
  },
  loadingCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  loadingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  floatingAction: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
  },
  floatingButton: {
    borderRadius: 25,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
  },
  floatingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
});

export default ClinicasPorCidadeScreen;