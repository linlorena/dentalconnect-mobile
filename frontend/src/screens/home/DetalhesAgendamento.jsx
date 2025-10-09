import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/pt-br';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const DetalhesAgendamento = ({ route }) => {
  const navigation = useNavigation();
  const { agendamento } = route.params;

  
  const formatarData = (dataString) => {
    const [year, month, day] = dataString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (!agendamento) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Agendamento não encontrado.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Detalhes do Agendamento</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações do Agendamento</Text>

          <View style={styles.infoRow}>
            <Feather name="calendar" size={16} color={colors.primary} />
            <Text style={styles.infoText}>Data: {agendamento.data ? formatarData(agendamento.data) : '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="clock" size={16} color={colors.primary} />
            <Text style={styles.infoText}>Horário: {agendamento.horario || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="tag" size={16} color={colors.primary} />
            <Text style={styles.infoText}>Serviço: {agendamento.servico || '-'}</Text>
          </View>

          {agendamento.dentista && (
            <>
              <View style={styles.divider} />
              <Text style={styles.cardTitle}>Informações do Dentista</Text>

              <View style={styles.cardHeader}>
                <Image
                  source={agendamento.dentista.usuario?.avatar
                    ? { uri: agendamento.dentista.usuario.avatar }
                    : require('../../../assets/avatar.png')
                  }
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dentistName}>Dr. {agendamento.dentista.usuario?.nome || '-'}</Text>
                  <Text style={styles.dentistEmail}>{agendamento.dentista.usuario?.email || '-'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Feather name="hash" size={16} color={colors.primary} />
                <Text style={styles.infoText}>CRO: {agendamento.dentista.numero_cro || '-'}</Text>
              </View>
            </>
          )}
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
    padding: spacing.paddingHorizontal,
    paddingTop: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    marginRight: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  divider: {
    borderBottomColor: colors.borderLight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: '#e6e6e6',
  },
  dentistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  dentistEmail: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoText: {
    marginLeft: 6,
    color: colors.textPrimary,
    fontSize: 15,
  },
});

export default DetalhesAgendamento;