import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/auth';
import API_CONFIG from '../../config/api';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

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
                current={new Date().toISOString().split('T')[0]}
                minDate={new Date().toISOString().split('T')[0]}
                onDayPress={day => {
                    onSelectDate(day.dateString);
                }}
                markedDates={
                    selectedDate ? {
                        [selectedDate]: { 
                            selected: true, 
                            selectedColor: colors.primary,
                            selectedTextColor: '#ffffff'
                        }
                    } : {}
                }
                theme={{
                    selectedDayBackgroundColor: colors.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: colors.primary,
                    arrowColor: colors.primary,
                    dotColor: colors.primary,
                    textDayFontWeight: '500',
                    textMonthFontWeight: '800',
                    textDayHeaderFontWeight: '600',
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14,
                    textDayFontSize: 16,
                }}
                style={styles.calendarStyle}
            />
        </View>
    );
};

const HorariosComponent = ({ onSelectTime, selectedTime }) => {
    const availableTimes = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

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

const SelecionarHorarioScreen = ({ route, navigation }) => {
    const { user, token } = useAuth();
    const { clinicaId, nomeDaClinica } = route.params || {};

    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [horarioSelecionado, setHorarioSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingDados, setLoadingDados] = useState(true);
    const [dentistas, setDentistas] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [dentistaSelecionado, setDentistaSelecionado] = useState(null);
    const [servicoSelecionado, setServicoSelecionado] = useState(null);

    useEffect(() => {
        carregarDadosClinica();
    }, [clinicaId]);

    const carregarDadosClinica = async () => {
        if (!clinicaId || !token) return;

        setLoadingDados(true);
        try {
            const dentistasUrl = `${API_CONFIG.BASE_URL}/dentists/local/${clinicaId}`;
            const dentistasResponse = await fetch(dentistasUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (dentistasResponse.ok) {
                const dentistasData = await dentistasResponse.json();
                setDentistas(dentistasData || []);
            }

            const servicosUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}`;
            const servicosResponse = await fetch(servicosUrl, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (servicosResponse.ok) {
                const servicosData = await servicosResponse.json();
                setServicos(servicosData || []);
            }
        } catch (error) {
            console.error('Erro ao carregar dados da clínica:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
        } finally {
            setLoadingDados(false);
        }
    };

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
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            
            {/* Header com gradiente */}
            <LinearGradient
                colors={[colors.primary, '#0d9488']}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.white} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Agendar Consulta</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* Card da Clínica */}
                <View style={styles.clinicInfoCard}>
                    <LinearGradient
                        colors={[colors.primary, '#0d9488']}
                        style={styles.clinicInfoGradient}
                    >
                        <Ionicons name="medical" size={24} color={colors.white} />
                        <Text style={styles.clinicInfoLabel}>Clínica selecionada:</Text>
                        <Text style={styles.clinicNameText}>{nomeDaClinica || 'Carregando...'}</Text>
                    </LinearGradient>
                </View>

                <View style={styles.content}>
                    {/* Seção 1: Data */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>1. Escolha a Data</Text>
                        <View style={styles.sectionDivider} />
                    </View>
                    
                    <CalendarioComponent 
                        onSelectDate={setDataSelecionada} 
                        selectedDate={dataSelecionada} 
                    />
                    
                    {dataSelecionada && (
                        <View style={styles.selectionBadge}>
                            <Ionicons name="calendar" size={16} color={colors.primary} />
                            <Text style={styles.selectionText}>
                                Data: {dataSelecionada.split('-').reverse().join('/')}
                            </Text>
                        </View>
                    )}

                    {/* Seção 2: Horário */}
                    <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                        <Text style={styles.sectionTitle}>2. Escolha o Horário</Text>
                        <View style={styles.sectionDivider} />
                    </View>
                    
                    <HorariosComponent 
                        onSelectTime={setHorarioSelecionado} 
                        selectedTime={horarioSelecionado} 
                    />
                    
                    {horarioSelecionado && (
                        <View style={styles.selectionBadge}>
                            <Ionicons name="time" size={16} color={colors.primary} />
                            <Text style={styles.selectionText}>
                                Horário: {horarioSelecionado}
                            </Text>
                        </View>
                    )}

                    {/* Seção 3: Profissional */}
                    {loadingDados ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.loadingText}>Carregando opções...</Text>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                                <Text style={styles.sectionTitle}>3. Escolha o Profissional</Text>
                                <View style={styles.sectionDivider} />
                            </View>
                            
                            {dentistas.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>Nenhum profissional disponível nesta clínica.</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={dentistas}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({ item }) => {
                                        const isSelected = String(item.id) === dentistaSelecionado;
                                        const nomeDentista = item.usuario?.nome || item.nome || `Profissional ${item.id}`;
                                        return (
                                            <TouchableOpacity
                                                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                                onPress={() => setDentistaSelecionado(String(item.id))}
                                            >
                                                <Ionicons 
                                                    name={isSelected ? "checkmark-circle" : "person-circle-outline"} 
                                                    size={24} 
                                                    color={isSelected ? colors.white : colors.primary} 
                                                />
                                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                                    {nomeDentista}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    }}
                                    contentContainerStyle={styles.optionsList}
                                />
                            )}

                            {/* Seção 4: Procedimento */}
                            <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                                <Text style={styles.sectionTitle}>4. Escolha o Procedimento</Text>
                                <View style={styles.sectionDivider} />
                            </View>
                            
                            {servicos.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>Nenhum procedimento disponível.</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={servicos}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({ item }) => {
                                        const isSelected = String(item.id) === servicoSelecionado;
                                        return (
                                            <TouchableOpacity
                                                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                                onPress={() => setServicoSelecionado(String(item.id))}
                                            >
                                                <Ionicons 
                                                    name={isSelected ? "checkmark-circle" : "medical-outline"} 
                                                    size={24} 
                                                    color={isSelected ? colors.white : colors.primary} 
                                                />
                                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                                    {item.nome || `Procedimento ${item.id}`}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    }}
                                    contentContainerStyle={styles.optionsList}
                                />
                            )}
                        </>
                    )}
                </View>
                
                {/* Botão de Confirmação */}
                <View style={styles.footerButtonContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.button, 
                            (!dataSelecionada || !horarioSelecionado || !dentistaSelecionado || !servicoSelecionado || loading) && styles.buttonDisabled
                        ]} 
                        onPress={handleAgendarConsulta}
                        disabled={loading || !dataSelecionada || !horarioSelecionado || !dentistaSelecionado || !servicoSelecionado}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={(!dataSelecionada || !horarioSelecionado || !dentistaSelecionado || !servicoSelecionado || loading) 
                                ? ['#a3d9d3', '#a3d9d3'] 
                                : [colors.primary, '#0d9488']
                            }
                            style={styles.buttonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                                    <Text style={styles.buttonText}>Confirmar Agendamento</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: colors.background || '#F9FAFB'
    },
    headerGradient: {
        paddingTop: StatusBar.currentHeight || 0,
    },
    header: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    scrollContent: { 
        flexGrow: 1,
        paddingBottom: spacing.xl
    },
    clinicInfoCard: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        overflow: 'hidden',
    },
    clinicInfoGradient: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    clinicInfoLabel: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
    },
    clinicNameText: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#FFFFFF',
        textAlign: 'center',
    },
    content: { 
        paddingHorizontal: spacing.lg,
    },
    sectionHeader: { 
        marginBottom: spacing.md,
        marginTop: spacing.lg,
    },
    sectionTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    sectionDivider: { 
        height: 3, 
        backgroundColor: colors.primary, 
        borderRadius: 2, 
        width: 40,
    },
    calendarContainer: {
        marginBottom: spacing.md,
        borderRadius: 16,
        overflow: 'hidden',
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
        marginBottom: spacing.md,
    },
    timeSlotsList: {
        paddingVertical: 4,
    },
    timeSlot: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        marginRight: spacing.sm,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    timeSlotSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
        backgroundColor: '#E6F6F6',
    },
    timeSlotText: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 16,
    },
    timeSlotTextSelected: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    selectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: '#E6F6F6',
        borderRadius: 12,
        alignSelf: 'center',
    },
    selectionText: {
        marginLeft: spacing.xs,
        fontSize: 16,
        color: colors.primary,
        fontWeight: '600',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
    },
    loadingText: {
        marginLeft: spacing.sm,
        color: colors.textSecondary,
        fontSize: 14,
    },
    emptyContainer: {
        padding: spacing.lg,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginBottom: spacing.md,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
    },
    optionsList: {
        paddingVertical: 4,
    },
    optionCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        marginRight: spacing.sm,
        minWidth: 140,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    optionCardSelected: {
        borderColor: colors.primary,
        borderWidth: 2,
        backgroundColor: colors.primary,
    },
    optionText: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 14,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    optionTextSelected: {
        color: colors.white,
        fontWeight: 'bold',
    },
    footerButtonContainer: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
    button: {
        borderRadius: 25,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: spacing.sm,
    },
});

export default SelecionarHorarioScreen;

