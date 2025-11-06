import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import { useAuth } from '../../context/auth';
import API_CONFIG from '../../config/api';

const DetalhesAgendamento = () => {
  const navigation = useNavigation();
  const { user, token } = useAuth();

  const [agendamentos, setAgendamentos] = useState([]);
  const [locais, setLocais] = useState([]);
  const [dentistas, setDentistas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const fetchAgendamentos = async () => {
    if (!token || !user?.id) {
      setError('Usuário não autenticado. Por favor, faça login novamente.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Buscar agendamentos e locais em paralelo
      const [agendamentosRes, locaisRes] = await Promise.all([
        fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONSULTATION}/paciente/${user.id}`,
          { headers }
        ),
        fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOCALS}`,
          { headers }
        )
      ]);

      if (!agendamentosRes.ok || !locaisRes.ok) {
        if (agendamentosRes.status === 401 || locaisRes.status === 401) {
          setError('Sessão expirada. Por favor, faça login novamente.');
          return;
        }
        throw new Error('Erro ao buscar agendamentos');
      }

      const agendamentosData = await agendamentosRes.json();
      const locaisData = await locaisRes.json();

      setAgendamentos(agendamentosData);
      setLocais(locaisData);

      // Buscar informações dos dentistas
      const dentistasMap = {};
      const dentistaPromises = agendamentosData.map(async (agendamento) => {
        if (agendamento.dentista && !dentistasMap[agendamento.dentista]) {
          try {
            const dentistaRes = await fetch(
              `${API_CONFIG.BASE_URL}/dentists/${agendamento.dentista}`,
              { headers }
            );
            if (dentistaRes.ok) {
              const dentistaData = await dentistaRes.json();
              dentistasMap[agendamento.dentista] = dentistaData;
            }
          } catch (err) {
            console.error('Erro ao buscar dentista:', err);
          }
        }
      });

      await Promise.all(dentistaPromises);
      setDentistas(dentistasMap);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      setError('Erro ao carregar agendamentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return { dia: '-', mes: '-', ano: '-' };
    const [year, month, day] = dataString.split('-').map(Number);
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return {
      dia: day < 10 ? `0${day}` : day.toString(),
      mes: meses[month - 1],
      dataCompleta: `${day}/${month}/${year}`
    };
  };

  const getDiaSemana = (dataString) => {
    if (!dataString) return '';
    const diasSemana = [
      'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
    ];
    const [year, month, day] = dataString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return diasSemana[date.getDay()];
  };

  const formatarHorario = (horario) => {
    if (!horario) return '-';
    if (horario.length === 5 && horario.includes(':')) {
      return horario;
    }
    return horario.slice(0, 5);
  };

  const getLocalNome = (localId) => {
    const local = locais.find(l => l.id === localId || l.id === parseInt(localId));
    return local?.nome || 'Local não especificado';
  };

  const getDentistaNome = (dentistaId) => {
    const dentista = dentistas[dentistaId];
    return dentista?.usuario?.nome || 'Dentista não encontrado';
  };

  const getServicoNome = (agendamento) => {
    if (agendamento.servico && typeof agendamento.servico === 'object' && agendamento.servico.nome) {
      return agendamento.servico.nome;
    }
    if (agendamento.procedimento_nome) {
      return agendamento.procedimento_nome;
    }
    return 'Consulta de Rotina';
  };

  const handleAgendamentoPress = (agendamento) => {
    navigation.navigate('DetalhesAgendamentoItem', {
      agendamento,
      agendamentoId: agendamento.id
    });
  };

  const renderAgendamentoCard = ({ item: agendamento }) => {
    const dataFormatada = formatarData(agendamento.data);
    const diaSemana = getDiaSemana(agendamento.data);
    const hora = formatarHorario(agendamento.horario);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleAgendamentoPress(agendamento)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateBox}>
            <Text style={styles.dateDay}>{dataFormatada.dia}</Text>
            <Text style={styles.dateMonth}>{dataFormatada.mes}</Text>
            <Text style={styles.dateWeekday}>{diaSemana}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Feather name="check-circle" size={14} color="#10B981" />
            <Text style={styles.statusText}>Confirmado</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Feather name="clock" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{hora}</Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="map-pin" size={16} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={1}>
              {getLocalNome(agendamento.local)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="user" size={16} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={1}>
              Dr(a). {getDentistaNome(agendamento.dentista)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="activity" size={16} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={1}>
              {getServicoNome(agendamento)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando agendamentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Meus Agendamentos</Text>
          </View>
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color={colors.error || '#EF4444'} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchAgendamentos}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Agendamentos</Text>
      </View>

      {agendamentos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="calendar" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>Nenhum agendamento encontrado</Text>
          <Text style={styles.emptySubtext}>
            Você ainda não possui agendamentos realizados
          </Text>
        </View>
      ) : (
        <FlatList
          data={agendamentos}
          renderItem={renderAgendamentoCard}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.paddingHorizontal,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    flex: 1,
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: spacing.paddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateBox: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F766E',
    lineHeight: 28,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0891B2',
    marginTop: 2,
  },
  dateWeekday: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0891B2',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  errorText: {
    marginTop: spacing.md,
    color: colors.error || '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default DetalhesAgendamento;
