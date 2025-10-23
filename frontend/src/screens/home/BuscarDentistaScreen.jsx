import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import API_CONFIG from '../../config/api';
import { useAuth } from '../../context/auth';

const BuscarDentistaScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dentistas, setDentistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setLoading(false);
      setDentistas([]);
      setErro('');
      setSearchPerformed(false);
      return;
    }

    const buscar = async () => {
      setErro('');
      setLoading(true);
      setSearchPerformed(false);
      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DENTISTS}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Acesso não autorizado. Faça login novamente.');
          }
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();

        const filtrados = data.filter(
          (dentista) =>
            dentista.usuario &&
            dentista.usuario.nome &&
            dentista.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const croSet = new Set();
        const unicos = filtrados.filter((dentista) => {
          if (croSet.has(dentista.numero_cro)) {
            return false;
          }
          croSet.add(dentista.numero_cro);
          return true;
        });

        setDentistas(unicos);
      } catch (err) {
        setErro(err.message || 'Erro ao buscar dentistas.');
        setDentistas([]);
      } finally {
        setLoading(false);
        setSearchPerformed(true);
      }
    };

    const timeout = setTimeout(buscar, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm, token]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Buscar Dentista</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do dentista"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCapitalize="words"
            returnKeyType="search"
          />
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Buscando dentistas...</Text>
          </View>
        )}

        {erro ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        ) : null}

        {!loading && !erro && (
          <>
            {!searchPerformed && searchTerm.trim().length === 0 && (
              <Text style={styles.resultInfo}>
                Digite o nome de um dentista para iniciar a pesquisa.
              </Text>
            )}

            {searchPerformed && dentistas.length === 0 && (
              <Text style={styles.resultInfo}>
                Nenhum dentista encontrado.
              </Text>
            )}
          </>
        )}

        <View style={styles.resultsContainer}>
          {dentistas.map((dentista, idx) => (
            <View key={`${dentista.numero_cro}_${idx}`} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image
                  source={
                    dentista.usuario?.avatar
                      ? { uri: dentista.usuario.avatar }
                      : require('../../../assets/avatar.png')
                  }
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dentistName}>
                    {dentista.usuario?.nome ? `Dr. ${dentista.usuario.nome}` : 'Nome não informado'}
                  </Text>
                  <Text style={styles.dentistEmail}>{dentista.usuario?.email || 'E-mail não informado'}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Feather name="hash" size={16} color={colors.primary} />
                <Text style={styles.infoText}>CRO: {dentista.numero_cro || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Feather name="calendar" size={16} color={colors.primary} />
                <Text style={styles.infoText}>
                  Nascimento: {dentista.usuario?.data_nascimento
                    ? new Date(dentista.usuario.data_nascimento).toLocaleDateString()
                    : '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={16} color={colors.primary} />
                <Text style={styles.infoText}>
                  {dentista.usuario?.cidade || '-'} / {dentista.usuario?.estado || '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Feather name="key" size={16} color={colors.primary} />
                <Text style={styles.infoText}>CRO Usuário: {dentista.usuario?.cro || '-'}</Text>
              </View>
            </View>
          ))}
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
  form: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: spacing.md,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: spacing.borderRadius,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 16,
  },
  resultInfo: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: spacing.md,
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
    color: '#444',
    fontSize: 15,
  },
});

export default BuscarDentistaScreen;
