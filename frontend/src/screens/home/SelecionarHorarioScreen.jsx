// Arquivo: screens/SelecionarHorarioScreen.jsx

import React, { useState } from 'react';
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
    FlatList, // Adicionado para exibir a lista de horários
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons'; 
import { useAuth } from '../../context/auth'; 
import API_CONFIG from '../../config/api'; 
import colors from '../../styles/colors'; 
import spacing from '../../styles/spacing'; 
import { Calendar, LocaleConfig } from 'react-native-calendars'; // 👈 NOVO: Importa o componente de calendário

// Configuração de localização do calendário para Português (Opcional, mas bom para UX)
LocaleConfig.locales['br'] = {
    monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    monthNamesShort: ['Jan.','Fev.','Março','Abril','Maio','Jun.','Jul.','Ago.','Set.','Out.','Nov.','Dez.'],
    dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
    dayNamesShort: ['Dom.','Seg.','Ter.','Qua.','Qui.','Sex.','Sáb.'],
    today: 'Hoje'
};
LocaleConfig.defaultLocale = 'br';

// --- COMPONENTES ATUALIZADOS ---

// 1. Calendário Funcional
const CalendarioComponent = ({ onSelectDate, selectedDate }) => {
    // Função para formatar a data de 'YYYY-MM-DD' para 'DD/MM/YYYY' (apenas para exibição)
    const formatSelectedDate = (date) => {
        if (!date) return 'Selecione a Data';
        const parts = date.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    return (
        <View style={styles.calendarContainer}>
            <Calendar
                // Configurações básicas
                current={new Date().toISOString().split('T')[0]} // Começa no mês atual
                minDate={new Date().toISOString().split('T')[0]} // Não permite selecionar datas passadas
                onDayPress={day => {
                    // Seleciona o dia no formato 'YYYY-MM-DD'
                    onSelectDate(day.dateString);
                }}
                markedDates={
                    selectedDate ? {
                        [selectedDate]: { selected: true, selectedColor: colors.primary || '#0F766E' }
                    } : {}
                }
                
                // Estilização para se adequar ao design
                theme={{
                    selectedDayBackgroundColor: colors.primary || '#0F766E',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: colors.primary || '#0F766E',
                    arrowColor: colors.primary || '#0F766E',
                    dotColor: colors.primary || '#0F766E',
                    textDayFontWeight: '500',
                    textMonthFontWeight: '800',
                    textDayHeaderFontWeight: '600',
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14,
                    textDayFontSize: 16,
                    'stylesheet.calendar.header': {
                        header: {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingLeft: 10,
                            paddingRight: 10,
                            marginTop: 6,
                            alignItems: 'center',
                            backgroundColor: '#FFFFFF', // Cor de fundo do cabeçalho
                            paddingBottom: 10,
                        },
                        dayHeader: {
                            marginTop: 2,
                            marginBottom: 7,
                            width: 32,
                            textAlign: 'center',
                            fontSize: 13,
                            color: colors.textPrimary || '#111827',
                            fontWeight: '700',
                        }
                    },
                }}
                style={styles.calendarStyle}
            />
        </View>
    );
};

// 2. Componente de Horários Funcional (Simplesmente uma lista de botões)
const HorariosComponent = ({ onSelectTime, selectedTime }) => {
    // Horários de exemplo (pode ser carregado da API baseado na data selecionada)
    const availableTimes = ['08:00', '09:30', '11:00', '14:30', '16:00', '17:30'];

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            onPress={() => onSelectTime(item)} 
            style={[
                styles.timeSlot, 
                item === selectedTime && styles.timeSlotSelected
            ]}
        >
            <Text style={[
                styles.timeSlotText, 
                item === selectedTime && styles.timeSlotTextSelected
            ]}>
                {item}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.timeSlotsContainer}>
            <FlatList
                data={availableTimes}
                renderItem={renderItem}
                keyExtractor={item => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timeSlotsList}
            />
        </View>
    );
};
// --- FIM DOS COMPONENTES ATUALIZADOS ---


const SelecionarHorarioScreen = ({ route }) => {
    const navigation = useNavigation();
    const { user, token } = useAuth(); 

    const { clinicaId, nomeDaClinica } = route.params || {};

    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [horarioSelecionado, setHorarioSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);

    // =================================================================
    // FUNÇÃO DE AGENDAMENTO (POST)
    // =================================================================
    const handleAgendarConsulta = async () => {
        if (!dataSelecionada || !horarioSelecionado) {
            Alert.alert('Atenção', 'Por favor, selecione uma data e um horário.');
            return;
        }
        if (!clinicaId || !user?.id) {
            Alert.alert('Erro', 'Dados da clínica ou do usuário estão ausentes. Volte e tente novamente.');
            return;
        }

        setLoading(true);

        const dadosAgendamento = {
            usuario_id: user.id,
            clinica_id: clinicaId,
            data_consulta: dataSelecionada, // 'YYYY-MM-DD'
            hora_consulta: horarioSelecionado, // 'HH:MM'
            status: 'pendente', 
        };

        // Usando API_CONFIG com fallback seguro para a URL
        const API_URL = `${API_CONFIG?.BASE_URL}${API_CONFIG?.ENDPOINTS?.AGENDAMENTOS || '/agendamentos'}`; 

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify(dadosAgendamento),
            });

            if (response.ok || response.status === 201) {
                // 👇 ALTERADO: Mensagem de "Agendamento Confirmado!" adicionada aqui.
                Alert.alert('Agendamento Confirmado!', 'Sua avaliação foi agendada com sucesso!');
                navigation.navigate('MeusAgendamentos');
            } else {
                const erroData = await response.json();
                console.error("Erro do Servidor:", erroData);
                Alert.alert('Erro ao Agendar', erroData.message || 'Não foi possível completar o agendamento. Tente mais tarde.');
            }
        } catch (error) {
            console.error('Erro de rede ao agendar:', error);
            Alert.alert('Erro de Conexão', 'Não foi possível se comunicar com o servidor. Verifique sua internet.');
        } finally {
            setLoading(false);
        }
    };
    // =================================================================

    // Renderização
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* HEADER: Estrutura idêntica à da HomeScreen */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton} onPress={() => navigation.goBack()}>
                    <View style={styles.menuIconContainer}>
                        <Feather name="arrow-left" size={24} color={colors.primary || '#0F766E'} />
                    </View>
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>Agendar Avaliação</Text>
                </View>
                <View style={{ width: 40 }} /> 
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Caixa de Destaque para a Clínica Selecionada */}
                <View style={styles.clinicInfoCard}>
                    <Text style={styles.clinicInfoLabel}>Clínica selecionada:</Text>
                    <Text style={styles.clinicNameText}>{nomeDaClinica || 'Carregando...'}</Text>
                </View>

                <View style={styles.content}>
                    {/* Seção 1: Data */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>1. Escolha a Data</Text>
                        <View style={styles.sectionDivider} />
                    </View>
                    
                    {/* Calendário funcional */}
                    <CalendarioComponent onSelectDate={setDataSelecionada} selectedDate={dataSelecionada} />
                    {dataSelecionada && <Text style={styles.selectionText}>🗓️ Data selecionada: **{dataSelecionada}**</Text>}

                    {/* Seção 2: Horário */}
                    <View style={[styles.sectionHeader, { marginTop: spacing.xl || 20 }]}>
                        <Text style={styles.sectionTitle}>2. Escolha o Horário</Text>
                        <View style={styles.sectionDivider} />
                    </View>
                    
                    {/* Lista de horários clicáveis */}
                    <HorariosComponent onSelectTime={setHorarioSelecionado} selectedTime={horarioSelecionado} />
                    {horarioSelecionado && <Text style={styles.selectionText}>⏰ Horário selecionado: **{horarioSelecionado}**</Text>}
                </View>
                
                {/* Botão de Confirmação no final da ScrollView */}
                <View style={styles.footerButtonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, (!dataSelecionada || !horarioSelecionado) && styles.buttonDisabled, loading && styles.buttonDisabled]} 
                        onPress={handleAgendarConsulta}
                        disabled={loading || !dataSelecionada || !horarioSelecionado}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Confirmar Agendamento</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F9FAFB' 
    },
    // Estilos de Header copiados da HomeScreen
    header: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        paddingHorizontal: spacing.paddingHorizontal || 24, 
        paddingVertical: 16, 
        backgroundColor: '#FFFFFF', 
        borderBottomWidth: 1, 
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    menuButton: { 
        padding: 8 
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: { 
        flex: 1, 
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'center',
    },
    logoText: { 
        fontSize: 20, 
        fontWeight: "800", 
        color: colors.textPrimary || '#111827',
        letterSpacing: -0.5,
    },
    scrollContent: { 
        flexGrow: 1, 
        paddingBottom: spacing.lg || 20
    },
    
    // Novo card de informação da clínica
    clinicInfoCard: { 
        marginHorizontal: spacing.paddingHorizontal || 24, 
        marginTop: 20,
        marginBottom: spacing.xl || 20, 
        padding: spacing.xl || 20, 
        borderRadius: 20, 
        backgroundColor: colors.primary || '#0F766E', 
        shadowColor: colors.primary || '#0F766E', 
        shadowOffset: { width: 0, height: 8 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 16, 
        elevation: 12 
    },
    clinicInfoLabel: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: 4,
    },
    clinicNameText: { 
        fontSize: 24, 
        fontWeight: '800', 
        color: '#FFFFFF', 
        letterSpacing: -0.5,
    },
    
    content: { 
        paddingHorizontal: spacing.paddingHorizontal || 24, 
    },
    sectionHeader: { 
        marginBottom: spacing.md || 12 
    },
    sectionTitle: { 
        fontSize: 20, 
        fontWeight: '800', 
        color: colors.textPrimary || '#111827', 
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    sectionDivider: { 
        height: 3, 
        backgroundColor: colors.primary || '#0F766E', 
        borderRadius: 2, 
        width: 40 
    },
    
    // Estilos de seleção
    placeholder: { // Estilo original do mock (mantido caso precise, mas não usado diretamente no novo CalendarioComponent)
        borderWidth: 1, 
        borderColor: '#E5E7EB', 
        borderRadius: 16, 
        padding: spacing.xl || 20, 
        alignItems: 'center', 
        backgroundColor: '#FFFFFF', 
        marginBottom: spacing.lg || 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    placeholderSelected: {
        borderColor: colors.primary || '#0F766E',
        borderWidth: 2,
        backgroundColor: '#E6F6F6'
    },
    placeholderText: {
        color: colors.textPrimary || '#111827',
        fontWeight: '700',
        fontSize: 16,
    },
    selectionText: { 
        marginTop: spacing.sm || 4, 
        fontSize: 16, 
        color: colors.primary || '#0F766E', 
        textAlign: 'center', 
        fontWeight: 'bold',
        marginBottom: spacing.xl || 20 
    },
    
    // NOVOS ESTILOS PARA CALENDÁRIO E HORÁRIOS

    calendarContainer: {
        marginBottom: spacing.lg || 16,
        borderRadius: 16, 
        overflow: 'hidden', // Para respeitar o borderRadius
        borderWidth: 1, 
        borderColor: '#E5E7EB', 
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    calendarStyle: {
        borderRadius: 16,
        paddingBottom: 5,
    },

    timeSlotsContainer: {
        marginBottom: spacing.lg || 16,
    },
    timeSlotsList: {
        paddingVertical: 4, // Espaçamento para as sombras
    },
    timeSlot: {
        borderWidth: 1, 
        borderColor: '#E5E7EB', 
        borderRadius: 12, 
        paddingVertical: 12, 
        paddingHorizontal: 20,
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#FFFFFF', 
        marginRight: spacing.sm || 8,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    timeSlotSelected: {
        borderColor: colors.primary || '#0F766E',
        borderWidth: 2,
        backgroundColor: '#E6F6F6'
    },
    timeSlotText: {
        color: colors.textPrimary || '#111827',
        fontWeight: '700',
        fontSize: 16,
    },
    timeSlotTextSelected: {
        color: colors.primary || '#0F766E',
    },

    // Estilos do botão de rodapé
    footerButtonContainer: {
        paddingHorizontal: spacing.paddingHorizontal || 24,
        marginTop: spacing.xl || 20,
    },
    button: { 
        backgroundColor: colors.primary || '#0F766E', 
        padding: 18, 
        borderRadius: 16, 
        alignItems: 'center', 
        shadowColor: colors.primary || '#0F766E', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 8, 
        elevation: 10, 
    },
    buttonDisabled: { 
        backgroundColor: '#a3d9d3' 
    },
    buttonText: { 
        color: 'white', 
        fontSize: 18, 
        fontWeight: '800',
        letterSpacing: 0.5 
    },
});

export default SelecionarHorarioScreen;