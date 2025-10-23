import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import { useAuth } from '../../context/auth';
import API_CONFIG from '../../config/api';

const DetalhesAgendamento = ({ route }) => {
  const navigation = useNavigation();
  const { id } = route.params; // ID do agendamento que queremos
  const { token, avatar: userAvatar, id: userId } = useAuth();

  const [agendamento, setAgendamento] = useState(null);
  const [local, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const formatarData = (dataString) => {
    const [year, month, day] = dataString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl || avatarUrl === 'null' || avatarUrl === 'undefined' || avatarUrl.trim() === '') {
      return null;
    }
    return avatarUrl;
  };

  useEffect(() => {
    const fetchAgendamentoCompleto = async () => {
      if (!token) {
        setErro('Token não encontrado. Faça login novamente.');
        setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        // 1️⃣ Buscar todos os agendamentos do paciente
        const agendamentosRes = await axios.get(`${API_CONFIG.BASE_URL}/api/consultation/paciente/${userId}`, { headers });
        const agendamentoData = agendamentosRes.data.find(a => a.id === id);

        if (!agendamentoData) {
          setErro('Agendamento não encontrado.');
          setLoading(false);
          return;
        }

        // 2️⃣ Buscar dentista
        let dentistaNome = 'Dentista não encontrado';
        let dentistaCRO = '-';
        if (agendamentoData.dentista) {
          try {
            const dentistaRes = await axios.get(`${API_CONFIG.BASE_URL}/api/dentists/${agendamentoData.dentista}`, { headers });
            dentistaNome = dentistaRes.data.usuario?.nome || dentistaNome;
            dentistaCRO = dentistaRes.data.numero_cro || dentistaCRO;
          } catch {
            console.warn('Dentista não encontrado');
          }
        }

        // 3️⃣ Buscar todos os locais
        let localData = null;
        try {
          const locaisRes = await axios.get(`${API_CONFIG.BASE_URL}/api/locals`, { headers });
          localData = locaisRes.data.find(l => l.id === agendamentoData.local);
        } catch {
          console.warn('Não foi possível buscar locais');
        }

        // 4️⃣ Procedimento
        const procedimentoNome = (agendamentoData.servico && agendamentoData.servico.nome) 
          ? agendamentoData.servico.nome 
          : 'Consulta de Rotina';

        setAgendamento({
          ...agendamentoData,
          dentista_nome: dentistaNome,
          dentista_cro: dentistaCRO,
          procedimento_nome: procedimentoNome,
          user_avatar: agendamentoData.paciente?.avatar || userAvatar,
        });

        setLocal(localData);
      } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        setErro('Não foi possível carregar os detalhes do agendamento.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamentoCompleto();
  }, [id, token, userId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{erro}</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>Agendamento</Text>
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
            <Text style={styles.infoText}>Serviço: {agendamento.procedimento_nome}</Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.cardTitle}>Informações do Dentista</Text>

          <View style={styles.cardHeader}>
            <Image
              source={getAvatarUrl(agendamento.user_avatar) ? { uri: agendamento.user_avatar } : require('../../../assets/avatar.png')}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.dentistName}>Dr(a). {agendamento.dentista_nome}</Text>
              <Text style={styles.dentistEmail}>{agendamento.dentista_cro}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={styles.infoText}>
              Local: {local ? `${local.nome} - ${local.endereco}, ${local.numero}, ${local.cidade}/${local.estado}` : '-'}
            </Text>
          </View>

          {local && (
            <TouchableOpacity
              style={[styles.verMapaButton]}
              onPress={() => {
                const enderecoEncoded = encodeURIComponent(`${local.endereco}, ${local.numero}, ${local.cidade}, ${local.estado}`);
                Linking.openURL(`https://www.google.com/maps?q=${enderecoEncoded}`);
              }}
            >
              <Text style={styles.verMapaText}>Ver no mapa</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: spacing.paddingHorizontal, paddingTop: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  backButton: { marginRight: spacing.md, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.primary, fontSize: 28, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.md },
  divider: { borderBottomColor: colors.borderLight, borderBottomWidth: StyleSheet.hairlineWidth, marginVertical: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 14, backgroundColor: '#e6e6e6' },
  dentistName: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  dentistEmail: { fontSize: 15, color: colors.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  infoText: { marginLeft: 6, color: colors.textPrimary, fontSize: 15 },
  errorText: { color: colors.error, textAlign: 'center', fontSize: 16, marginTop: 20 },
  verMapaButton: { marginTop: 12, backgroundColor: colors.primary, padding: 10, borderRadius: 10, alignItems: 'center' },
  verMapaText: { color: '#fff', fontWeight: 'bold' },
});

export default DetalhesAgendamento;
