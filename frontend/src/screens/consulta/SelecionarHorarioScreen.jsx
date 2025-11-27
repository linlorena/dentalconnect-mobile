"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  FlatList,
  Animated,
} from "react-native"
import { Calendar, LocaleConfig } from "react-native-calendars"
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useAuth } from "../../context/auth"
import API_CONFIG from "../../config/api"

LocaleConfig.locales['br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Março','Abril','Maio','Jun.','Jul.','Ago.','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom.','Seg.','Ter.','Qua.','Qui.','Sex.','Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'br';

const CalendarioComponent = ({ onSelectDate, selectedDate }) => {
  return (
    <View style={styles.calendarContainer}>
      <Calendar
        current={new Date().toISOString().split("T")[0]}
        minDate={new Date().toISOString().split("T")[0]}
        onDayPress={(day) => {
          onSelectDate(day.dateString)
        }}
        markedDates={
          selectedDate
            ? {
                [selectedDate]: {
                  selected: true,
                  selectedColor: "#0F76AE",
                  selectedTextColor: "#ffffff",
                },
              }
            : {}
        }
        theme={{
          selectedDayBackgroundColor: "#0F76AE",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#0F76AE",
          arrowColor: "#0F76AE",
          dotColor: "#0F76AE",
          textDayFontWeight: "600",
          textMonthFontWeight: "800",
          textDayHeaderFontWeight: "600",
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
          textDayFontSize: 16,
          calendarBackground: "#FFFFFF",
          textSectionTitleColor: "#64748B",
          dayTextColor: "#475569",
          monthTextColor: "#0F76AE",
        }}
        style={styles.calendarStyle}
      />
    </View>
  )
}

const HorariosComponent = ({ onSelectTime, selectedTime }) => {
  const availableTimes = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => onSelectTime(item)}
      style={[styles.timeSlot, item === selectedTime && styles.timeSlotSelected]}
      activeOpacity={0.7}
    >
      <Ionicons name="time-outline" size={22} color={item === selectedTime ? "#FFFFFF" : "#0F76AE"} />
      <Text style={[styles.timeSlotText, item === selectedTime && styles.timeSlotTextSelected]}>{item}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.timeSlotsContainer}>
      <FlatList
        data={availableTimes}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeSlotsList}
      />
    </View>
  )
}

const SelecionarHorarioScreen = ({ route, navigation }) => {
  const { user, token } = useAuth()
  const { clinicaId, nomeDaClinica } = route.params || {}

  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [horarioSelecionado, setHorarioSelecionado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingDados, setLoadingDados] = useState(true)
  const [dentistas, setDentistas] = useState([])
  const [servicos, setServicos] = useState([])
  const [dentistaSelecionado, setDentistaSelecionado] = useState(null)
  const [servicoSelecionado, setServicoSelecionado] = useState(null)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    carregarDadosClinica()
    iniciarAnimacoes()
  }, [clinicaId])

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
    ]).start()
  }

  const carregarDadosClinica = async () => {
    if (!clinicaId || !token) {
      console.warn('clinicaId ou token ausente');
      setLoadingDados(false);
      return;
    }

    setLoadingDados(true);
    try {
      // Buscar dentistas da clínica
      const dentistasUrl = `${API_CONFIG.BASE_URL}/dentists/local/${clinicaId}`;
      console.log('Buscando dentistas em:', dentistasUrl);
      
      const dentistasResponse = await fetch(dentistasUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (dentistasResponse.ok) {
        const dentistasData = await dentistasResponse.json();
        console.log('Dentistas carregados:', dentistasData);
        setDentistas(dentistasData || []);
      } else {
        console.error('Erro ao buscar dentistas:', dentistasResponse.status);
      }

      // Buscar serviços/procedimentos
      const servicosUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}`;
      console.log('Buscando serviços em:', servicosUrl);
      
      const servicosResponse = await fetch(servicosUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (servicosResponse.ok) {
        const servicosData = await servicosResponse.json();
        console.log('Serviços carregados:', servicosData);
        setServicos(servicosData || []);
      } else {
        console.error('Erro ao buscar serviços:', servicosResponse.status);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da clínica:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoadingDados(false);
    }
  }

  const handleAgendarConsulta = async () => {
    if (!dataSelecionada || !horarioSelecionado) {
      Alert.alert('Atenção', 'Por favor, selecione uma data e um horário.');
      return;
    }

    if (!dentistaSelecionado) {
      Alert.alert('Atenção', 'Por favor, selecione um profissional.');
      return;
    }

    if (!servicoSelecionado) {
      Alert.alert('Atenção', 'Por favor, selecione um procedimento.');
      return;
    }

    if (!clinicaId || !user?.id) {
      Alert.alert('Erro', 'Dados da clínica ou do usuário estão ausentes. Volte e tente novamente.');
      return;
    }

    setLoading(true);

    const dadosAgendamento = {
      data: dataSelecionada,
      horario: horarioSelecionado,
      dentista: String(dentistaSelecionado),
      local: String(clinicaId),
      status: 'pendente',
      servico: String(servicoSelecionado),
    };

    const API_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONSULTA}`;
    console.log('Enviando agendamento para:', API_URL);
    console.log('Dados do agendamento:', dadosAgendamento);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dadosAgendamento),
      });

      const responseData = await response.json();
      console.log('Resposta do servidor:', responseData);

      if (response.ok || response.status === 201) {
        Alert.alert(
          'Agendamento Confirmado!', 
          'Sua consulta foi agendada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      } else {
        console.error("Erro do Servidor:", responseData);
        Alert.alert(
          'Erro ao Agendar', 
          responseData.error || responseData.message || 'Não foi possível completar o agendamento. Tente mais tarde.'
        );
      }
    } catch (error) {
      console.error('Erro de rede ao agendar:', error);
      Alert.alert(
        'Erro de Conexão', 
        'Não foi possível se comunicar com o servidor. Verifique sua internet.'
      );
    } finally {
      setLoading(false);
    }
  }

  const formatarData = (dateString) => {
    if (!dateString) return ""
    const [ano, mes, dia] = dateString.split("-")
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    return `${dia} de ${meses[Number.parseInt(mes) - 1]}, ${ano}`
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backButtonContainer}>
            <Feather name="arrow-left" size={24} color="#0F76AE" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Agendar Consulta</Text>
          <Text style={styles.headerSubtitle}>Complete os passos abaixo</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.welcomeBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.bannerGradientTop} />
          <View style={styles.bannerGradientBottom} />

          <View style={styles.bannerContent}>
            <View style={styles.bannerIconWrapper}>
              <MaterialCommunityIcons name="hospital-building" size={32} color="#0F76AE" />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerLabel}>Clínica selecionada</Text>
              <Text style={styles.bannerTitle}>{nomeDaClinica || "Carregando..."}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.content}>
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Escolha a Data</Text>
                <Text style={styles.sectionDescription}>Selecione o dia ideal para sua consulta</Text>
              </View>
            </View>

            <CalendarioComponent onSelectDate={setDataSelecionada} selectedDate={dataSelecionada} />

            {dataSelecionada && (
              <View style={styles.selectedDateBadge}>
                <Ionicons name="calendar-outline" size={20} color="#0F76AE" />
                <Text style={styles.selectedDateText}>{formatarData(dataSelecionada)}</Text>
              </View>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={[styles.stepBadge, { backgroundColor: "#10B981" }]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Escolha o Horário</Text>
                <Text style={styles.sectionDescription}>Selecione um horário disponível</Text>
              </View>
            </View>

            <HorariosComponent onSelectTime={setHorarioSelecionado} selectedTime={horarioSelecionado} />
          </View>

          {loadingDados ? (
            <View style={styles.loadingCard}>
              <View style={styles.loadingIcon}>
                <MaterialCommunityIcons name="doctor" size={40} color="#0F76AE" />
              </View>
              <ActivityIndicator size="large" color="#0F76AE" style={{ marginVertical: 16 }} />
              <Text style={styles.loadingText}>Buscando profissionais e serviços...</Text>
            </View>
          ) : (
            <>
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.stepBadge, { backgroundColor: "#8B5CF6" }]}>
                    <Text style={styles.stepNumber}>3</Text>
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Escolha o Profissional</Text>
                    <Text style={styles.sectionDescription}>Selecione seu dentista preferido</Text>
                  </View>
                </View>

                {dentistas.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIcon}>
                      <MaterialCommunityIcons name="account-alert-outline" size={48} color="#94A3B8" />
                    </View>
                    <Text style={styles.emptyTitle}>Nenhum profissional disponível</Text>
                    <Text style={styles.emptySubtitle}>Tente selecionar outra data</Text>
                  </View>
                ) : (
                  <FlatList
                    data={dentistas}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => {
                      const isSelected = String(item.id) === dentistaSelecionado
                      const nomeDentista = item.usuario?.nome || item.nome || `Profissional ${item.id}`
                      return (
                        <TouchableOpacity
                          style={[styles.professionalCard, isSelected && styles.professionalCardSelected]}
                          onPress={() => setDentistaSelecionado(String(item.id))}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.professionalAvatar, isSelected && styles.professionalAvatarSelected]}>
                            <MaterialCommunityIcons
                              name="doctor"
                              size={28}
                              color={isSelected ? "#FFFFFF" : "#8B5CF6"}
                            />
                          </View>
                          <Text style={[styles.professionalName, isSelected && styles.professionalNameSelected]}>
                            {nomeDentista}
                          </Text>
                          {isSelected && (
                            <View style={styles.checkBadge}>
                              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            </View>
                          )}
                        </TouchableOpacity>
                      )
                    }}
                    contentContainerStyle={styles.horizontalList}
                  />
                )}
              </View>

              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.stepBadge, { backgroundColor: "#F59E0B" }]}>
                    <Text style={styles.stepNumber}>4</Text>
                  </View>
                  <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>Escolha o Procedimento</Text>
                    <Text style={styles.sectionDescription}>Selecione o tipo de consulta</Text>
                  </View>
                </View>

                {servicos.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIcon}>
                      <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#94A3B8" />
                    </View>
                    <Text style={styles.emptyTitle}>Nenhum procedimento disponível</Text>
                    <Text style={styles.emptySubtitle}>Entre em contato com a clínica</Text>
                  </View>
                ) : (
                  <FlatList
                    data={servicos}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => {
                      const isSelected = String(item.id) === servicoSelecionado
                      return (
                        <TouchableOpacity
                          style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                          onPress={() => setServicoSelecionado(String(item.id))}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.serviceIcon, isSelected && styles.serviceIconSelected]}>
                            <MaterialCommunityIcons
                              name="tooth-outline"
                              size={28}
                              color={isSelected ? "#FFFFFF" : "#F59E0B"}
                            />
                          </View>
                          <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>
                            {item.nome || `Procedimento ${item.id}`}
                          </Text>
                          {isSelected && (
                            <View style={styles.checkBadge}>
                              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                            </View>
                          )}
                        </TouchableOpacity>
                      )
                    }}
                    contentContainerStyle={styles.horizontalList}
                  />
                )}
              </View>
            </>
          )}
        </View>

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!dataSelecionada || !horarioSelecionado || !dentistaSelecionado || !servicoSelecionado || loading) &&
                styles.confirmButtonDisabled,
            ]}
            onPress={handleAgendarConsulta}
            disabled={loading || !dataSelecionada || !horarioSelecionado || !dentistaSelecionado || !servicoSelecionado}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.confirmButtonContent}>
                <MaterialCommunityIcons name="calendar-check" size={24} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F76AE",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  welcomeBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E0F2FE",
    shadowColor: "#0F76AE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  bannerGradientTop: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#BAE6FD",
    opacity: 0.3,
  },
  bannerGradientBottom: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#7DD3FC",
    opacity: 0.2,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  bannerText: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F76AE",
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stepBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0F76AE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#0F76AE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F76AE",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  calendarContainer: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F76AE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  calendarStyle: {
    borderRadius: 20,
  },
  selectedDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#E0F2FE",
    borderRadius: 16,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  selectedDateText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#0F76AE",
    fontWeight: "700",
  },
  timeSlotsContainer: {
    marginBottom: 8,
  },
  timeSlotsList: {
    paddingVertical: 4,
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    marginRight: 12,
    minWidth: 110,
    shadowColor: "#0F76AE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeSlotSelected: {
    borderColor: "#0F76AE",
    backgroundColor: "#0F76AE",
    shadowOpacity: 0.2,
    elevation: 4,
  },
  timeSlotText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 16,
  },
  timeSlotTextSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F76AE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "center",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F76AE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
    textAlign: "center",
  },
  horizontalList: {
    paddingVertical: 4,
  },
  professionalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginRight: 12,
    alignItems: "center",
    minWidth: 140,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  professionalCardSelected: {
    borderColor: "#8B5CF6",
    backgroundColor: "#FAF5FF",
    shadowOpacity: 0.15,
    elevation: 4,
  },
  professionalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  professionalAvatarSelected: {
    backgroundColor: "#8B5CF6",
  },
  professionalName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
  },
  professionalNameSelected: {
    color: "#8B5CF6",
    fontWeight: "800",
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginRight: 12,
    alignItems: "center",
    minWidth: 140,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardSelected: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
    shadowOpacity: 0.15,
    elevation: 4,
  },
  serviceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceIconSelected: {
    backgroundColor: "#F59E0B",
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
  },
  serviceNameSelected: {
    color: "#F59E0B",
    fontWeight: "800",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  confirmButton: {
    backgroundColor: "#0F76AE",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 32,
    shadowColor: "#0F76AE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  confirmButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
})

export default SelecionarHorarioScreen
