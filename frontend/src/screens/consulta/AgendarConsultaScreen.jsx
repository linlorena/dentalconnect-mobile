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

const AgendarConsultaScreen = ({ navigation }) => {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('clinica');
  const [locais, setLocais] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    carregarDados();
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

  const carregarDados = async () => {
    setLoading(true);
    try {
      const responseLocais = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOCALS}`);
      if (responseLocais.ok) {
        const locaisData = await responseLocais.json();
        setLocais(locaisData);
        
        const cidadesUnicas = [...new Set(locaisData.map(local => local.cidade))];
        setCidades(cidadesUnicas);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCidadeSelecionada = (cidade) => {
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
      navigation.navigate('ClinicasPorCidade', { cidade });
    }, 200);
  };

  const renderCidade = ({ item, index }) => {
    const clinicasCount = locais.filter(local => local.cidade === item).length;
    
    return (
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
        <TouchableOpacity
          style={styles.cidadeCardContent}
          onPress={() => handleCidadeSelecionada(item)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.cidadeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cidadeHeader}>
              <View style={styles.cidadeIconContainer}>
                <Ionicons name="location" size={24} color={colors.primary} />
              </View>
              <View style={styles.cidadeInfo}>
                <Text style={styles.cidadeNome}>{item}</Text>
                <Text style={styles.cidadeClinicas}>
                  {clinicasCount} clínica{clinicasCount !== 1 ? 's' : ''} disponível{clinicasCount !== 1 ? 'is' : ''}
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </View>
            </View>
            
            <View style={styles.cidadeFooter}>
              <View style={styles.cidadeBadge}>
                <Ionicons name="medical" size={14} color={colors.white} />
                <Text style={styles.cidadeBadgeText}>Clínicas</Text>
              </View>
              <Text style={styles.cidadeAction}>Toque para ver</Text>
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
      <Text style={styles.loadingText}>Carregando cidades...</Text>
    </View>
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
              <Ionicons name="calendar" size={32} color={colors.white} />
            </Animated.View>
            <Text style={styles.headerTitle}>Agendar Consulta</Text>
            <Text style={styles.headerSubtitle}>
              Encontre clínicas próximas a você
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Card de seleção */}
        <Animated.View
          style={[
            styles.selectionCard,
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
            style={styles.selectionGradient}
          >
            <View style={styles.selectionHeader}>
              <View style={styles.selectionIcon}>
                <Ionicons name="location" size={28} color={colors.primary} />
              </View>
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionTitle}>Por Localização</Text>
                <Text style={styles.selectionDescription}>
                  Escolha sua cidade e encontre clínicas próximas
                </Text>
              </View>
              <View style={styles.selectionBadge}>
                <Text style={styles.selectionBadgeText}>Ativo</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Lista de cidades */}
        <View style={styles.cidadesContainer}>
          <Text style={styles.cidadesTitle}>
            {cidades.length} cidade{cidades.length !== 1 ? 's' : ''} disponível{cidades.length !== 1 ? 'is' : ''}
          </Text>
          
          {loading ? (
            renderLoadingCard()
          ) : (
            <FlatList
              data={cidades}
              renderItem={renderCidade}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cidadesList}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  selectionCard: {
    marginBottom: spacing.lg,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  selectionGradient: {
    borderRadius: 20,
    padding: spacing.lg,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  selectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  selectionBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  selectionBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  cidadesContainer: {
    flex: 1,
  },
  cidadesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  cidadesList: {
    paddingBottom: 100,
  },
  cidadeCard: {
    marginBottom: spacing.md,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cidadeCardContent: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cidadeGradient: {
    padding: spacing.lg,
  },
  cidadeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cidadeIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cidadeInfo: {
    flex: 1,
  },
  cidadeNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cidadeClinicas: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cidadeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cidadeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  cidadeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  cidadeAction: {
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

export default AgendarConsultaScreen;