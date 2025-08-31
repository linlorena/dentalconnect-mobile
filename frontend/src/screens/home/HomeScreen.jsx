import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/auth';
import Button from '../../components/common/Button';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const HomeScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Bem-vindo ao{'\n'}
              <Text style={styles.titleHighlight}>DentalConnect</Text>
            </Text>
            <Text style={styles.subtitle}>
              Sua plataforma de saúde dental
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userInfoTitle}>Informações da conta:</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>E-mail:</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValue}>{user?.id || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Funcionalidades disponíveis:</Text>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>📅 Agendamentos</Text>
              <Text style={styles.featureDescription}>
                Agende suas consultas dentárias de forma rápida e fácil
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>👨‍⚕️ Dentistas</Text>
              <Text style={styles.featureDescription}>
                Encontre profissionais qualificados próximos a você
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>📋 Histórico</Text>
              <Text style={styles.featureDescription}>
                Acompanhe seu histórico de tratamentos e consultas
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Ver perfil"
              onPress={() => console.log('Perfil - a ser implementado')}
              variant="secondary"
              style={styles.actionButton}
            />
            
            <Button
              title="Sair da conta"
              onPress={handleLogout}
              variant="outline"
              style={styles.logoutButton}
            />
          </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: spacing.paddingVertical,
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 44,
    textAlign: 'center',
  },
  titleHighlight: {
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 18,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: colors.secondary,
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  features: {
    marginBottom: spacing.xl,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  featureCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  featureDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  actions: {
    marginTop: spacing.lg,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  logoutButton: {
    marginBottom: spacing.md,
  },
});

export default HomeScreen;
