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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const { width, height } = Dimensions.get('window');

const DetalhesLocalScreen = ({ route, navigation }) => {
  const { local } = route.params;
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  const handleAgendarConsulta = async () => {
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

    // Por enquanto, não faz nada - apenas animação visual
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
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={styles.infoGradient}
        >
          <View style={styles.infoHeader}>
            <View style={styles.infoIcon}>
              <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {value || 'Não informado'}
              </Text>
            </View>
            {onPress && (
              <View style={styles.infoAction}>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </View>
            )}
          </View>
        </LinearGradient>
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
      <LinearGradient
        colors={[colors.primary, '#0d9488']}
        style={styles.serviceTagGradient}
      >
        <Ionicons name="medical" size={16} color={colors.white} />
        <Text style={styles.serviceTagText}>{servico}</Text>
      </LinearGradient>
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
              <Ionicons name="medical" size={32} color={colors.white} />
            </Animated.View>
            <Text style={styles.headerTitle}>{local.nome}</Text>
            <Text style={styles.headerSubtitle}>{local.cidade}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
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
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.mainGradient}
            >
              <View style={styles.mainHeader}>
                <View style={styles.statusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Aberto agora</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>
              
              <Text style={styles.mainDescription}>
                Clínica odontológica moderna com equipamentos de última geração e profissionais especializados.
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Informações de contato */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações de Contato</Text>
            {renderInfoCard('location', 'Endereço', local.endereco, handleDirections)}
            {renderInfoCard('call', 'Telefone', local.telefone, handleCall)}
            {renderInfoCard('time', 'Horário', local.horario || 'Seg-Sex: 8h-18h')}
            {renderInfoCard('mail', 'Email', local.email)}
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
                <LinearGradient
                  colors={['#ffffff', '#f8f9fa']}
                  style={styles.servicesGradient}
                >
                  <View style={styles.servicesGrid}>
                    {local.servicos.map((servico, index) => renderServiceTag(servico, index))}
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          )}

          {/* Sobre a clínica */}
          {local.descricao && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre a Clínica</Text>
              <Animated.View
                style={[
                  styles.descriptionCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#ffffff', '#f8f9fa']}
                  style={styles.descriptionGradient}
                >
                  <Text style={styles.descriptionText}>{local.descricao}</Text>
                </LinearGradient>
              </Animated.View>
            </View>
          )}

          {/* Botões de ação */}
          <Animated.View
            style={[
              styles.actionsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={navigation.navigate('SelecionarHorarioScreen', { 
                clinicaId: local.id,
                nomeDaClinica: local.nome, 
            })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, '#0d9488']}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="calendar" size={20} color={colors.white} />
                <Text style={styles.primaryButtonText}>Agendar Avaliação</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.secondaryButtonGradient}
              >
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Voltar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
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
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  mainCard: {
    marginBottom: spacing.lg,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  mainGradient: {
    borderRadius: 20,
    padding: spacing.lg,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: spacing.xs,
  },
  mainDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoCard: {
    marginBottom: spacing.md,
    borderRadius: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  infoCardContent: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  infoGradient: {
    padding: spacing.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  infoAction: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicesCard: {
    borderRadius: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  servicesGradient: {
    borderRadius: 15,
    padding: spacing.md,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  serviceTag: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  serviceTagGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.xs,
  },
  descriptionCard: {
    borderRadius: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  descriptionGradient: {
    borderRadius: 15,
    padding: spacing.md,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  actionsContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    borderRadius: 25,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  secondaryButton: {
    borderRadius: 25,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});

export default DetalhesLocalScreen;