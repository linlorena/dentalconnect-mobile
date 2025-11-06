import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import { useAuth } from '../../context/auth';
import API_CONFIG from '../../config/api';

const DetalhesAgendamentoItem = ({ route }) => {
    const navigation = useNavigation();
    const { user, token } = useAuth();
    const { agendamentoId, agendamento: agendamentoParam } = route.params || {};

    const [agendamento, setAgendamento] = useState(agendamentoParam || null);
    const [dentista, setDentista] = useState(null);
    const [local, setLocal] = useState(null);
    const [servico, setServico] = useState(null);
    const [loading, setLoading] = useState(!agendamentoParam);
    const [loadingData, setLoadingData] = useState(!!agendamentoParam);
    const [error, setError] = useState(null);
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        if (!agendamentoParam && agendamentoId) {
            fetchAgendamento();
        } else if (agendamentoParam) {
            setAgendamento(agendamentoParam);
            fetchRelatedData();
        }
    }, []);

    // Reset avatar error when dentist changes
    useEffect(() => {
        setAvatarError(false);
    }, [dentista?.id, agendamento?.dentista]);

    const fetchAgendamento = async () => {
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

            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONSULTATION}/paciente/${user.id}`,
                { headers }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Sessão expirada. Por favor, faça login novamente.');
                    return;
                }
                throw new Error('Erro ao buscar agendamento');
            }

            const agendamentos = await response.json();
            const agendamentoEncontrado = agendamentos.find(
                a => a.id === agendamentoId || a.id === parseInt(agendamentoId)
            );

            if (!agendamentoEncontrado) {
                setError('Agendamento não encontrado.');
                setLoading(false);
                return;
            }

            setAgendamento(agendamentoEncontrado);
            setLoadingData(true);
            await fetchRelatedDataForAgendamento(agendamentoEncontrado);
            setLoadingData(false);
        } catch (err) {
            console.error('Erro ao buscar agendamento:', err);
            setError('Erro ao carregar dados do agendamento. Tente novamente.');
            setLoadingData(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedData = async () => {
        if (!agendamento) return;
        setLoadingData(true);
        await fetchRelatedDataForAgendamento(agendamento);
        setLoadingData(false);
    };

    const fetchRelatedDataForAgendamento = async (agendamentoData) => {
        const promises = [];

        if (agendamentoData.dentista) {
            promises.push(fetchDentista(agendamentoData.dentista));
        }

        if (agendamentoData.local) {
            promises.push(fetchLocal(agendamentoData.local));
        }

        if (agendamentoData.servico && agendamentoData.servico !== 1) {
            const servicoId = typeof agendamentoData.servico === 'object'
                ? agendamentoData.servico.id || agendamentoData.servico
                : agendamentoData.servico;
            promises.push(fetchServico(servicoId));
        }

        await Promise.all(promises);
    };

    const fetchDentista = async (dentistaId) => {
        if (!dentistaId || !token) return;

        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}/dentists/${dentistaId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setDentista(data);
            }
        } catch (err) {
            console.error('Erro ao buscar dentista:', err);
        }
    };

    const fetchLocal = async (localId) => {
        if (!localId || !token) return;

        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOCALS}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const locais = await response.json();
                const localEncontrado = locais.find(l => l.id === localId || l.id === parseInt(localId));
                if (localEncontrado) {
                    setLocal(localEncontrado);
                }
            }
        } catch (err) {
            console.error('Erro ao buscar local:', err);
        }
    };

    const fetchServico = async (servicoId) => {
        if (!servicoId || !token) return;

        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}/${servicoId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setServico(data);
            }
        } catch (err) {
            console.error('Erro ao buscar serviço:', err);
        }
    };

    const formatarDataCompleta = (dataString) => {
        if (!dataString) return '-';
        const meses = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        const [year, month, day] = dataString.split('-').map(Number);
        return `${day} de ${meses[month - 1]} de ${year}`;
    };

    const getDiaSemana = (dataString) => {
        if (!dataString) return '';
        const diasSemana = [
            'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
            'Quinta-feira', 'Sexta-feira', 'Sábado'
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

    const getServicoNome = () => {
        if (servico?.nome) {
            return servico.nome;
        }
        if (agendamento?.servico && typeof agendamento.servico === 'object' && agendamento.servico.nome) {
            return agendamento.servico.nome;
        }
        return 'Consulta de Rotina';
    };

    const handleVerNoMapa = () => {
        if (!local || !local.endereco) return;
        const enderecoCompleto = `${local.endereco}${local.numero ? `, ${local.numero}` : ''}${local.cidade ? `, ${local.cidade}` : ''}${local.estado ? `, ${local.estado}` : ''}`;
        const enderecoEncoded = encodeURIComponent(enderecoCompleto);
        Linking.openURL(`https://maps.google.com/?q=${enderecoEncoded}`);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Carregando agendamento...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !agendamento) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Feather name="arrow-left" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Detalhes</Text>
                    </View>
                    <View style={styles.errorContainer}>
                        <Feather name="alert-circle" size={48} color={colors.error || '#EF4444'} />
                        <Text style={styles.errorText}>{error || 'Agendamento não encontrado.'}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={fetchAgendamento}
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Feather name="arrow-left" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
                        Detalhes do Agendamento
                    </Text>
                </View>

                {/* Card Principal */}
                <View style={styles.mainCard}>
                    {loadingData ? (
                        <View style={styles.loadingDataContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingDataText}>Carregando informações...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Seção do Local */}
                            {local && (
                                <View style={styles.localSection}>
                                    <View style={styles.localHeader}>
                                        <View style={styles.iconCircle}>
                                            <Feather name="map-pin" size={20} color={colors.primary} />
                                        </View>
                                        <Text style={styles.localTitle}>{local.nome || '-'}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Card de Informações com Fundo Cinza */}
                            <View style={styles.infoCard}>
                                {/* Dentista */}
                                {(dentista || agendamento.dentista) && (() => {
                                    const avatarUrl = dentista?.usuario?.avatar || agendamento.dentista?.usuario?.avatar;
                                    const nomeDentista = dentista?.usuario?.nome || agendamento.dentista?.usuario?.nome || agendamento.dentista_nome || '-';
                                    const hasAvatar = avatarUrl && avatarUrl !== 'null' && avatarUrl !== 'undefined' && !avatarError;

                                    return (
                                        <View style={styles.infoItem}>
                                            <View style={[
                                                styles.iconCircleSmall,
                                                hasAvatar && styles.iconCircleSmallWithImage
                                            ]}>
                                                {hasAvatar ? (
                                                    <Image
                                                        source={{ uri: avatarUrl }}
                                                        style={styles.dentistAvatar}
                                                        onError={() => setAvatarError(true)}
                                                    />
                                                ) : (
                                                    <Feather name="user" size={18} color={colors.primary} />
                                                )}
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>DENTISTA</Text>
                                                <Text style={styles.infoValue}>
                                                    Dr(a). {nomeDentista}
                                                </Text>
                                                {(() => {
                                                    const cro = dentista?.numero_cro || agendamento.dentista?.numero_cro;
                                                    return cro ? (
                                                        <Text style={styles.infoSubtext}>CRO: {cro}</Text>
                                                    ) : null;
                                                })()}
                                            </View>
                                        </View>
                                    );
                                })()}

                                {/* Procedimento */}
                                <View style={styles.infoItem}>
                                    <View style={styles.iconCircleSmall}>
                                        <Feather name="activity" size={18} color={colors.primary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>PROCEDIMENTO</Text>
                                        <Text style={styles.infoValue}>{getServicoNome()}</Text>
                                    </View>
                                </View>

                                {/* Data e Horário */}
                                <View style={styles.infoItem}>
                                    <View style={styles.iconCircleSmall}>
                                        <Feather name="calendar" size={18} color={colors.primary} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>DATA</Text>
                                        <Text style={styles.infoValue}>{formatarDataCompleta(agendamento.data)}</Text>
                                        <Text style={styles.infoSubtext}>
                                            {getDiaSemana(agendamento.data)} às {formatarHorario(agendamento.horario)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Endereço */}
                                {local && local.endereco && (
                                    <View style={[styles.infoItem, { marginBottom: 0 }]}>
                                        <View style={styles.iconCircleSmall}>
                                            <Feather name="map-pin" size={18} color={colors.primary} />
                                        </View>
                                        <View style={styles.infoContent}>
                                            <Text style={styles.infoLabel}>ENDEREÇO</Text>
                                            <Text style={styles.infoValue}>
                                                {local.endereco}
                                                {local.numero && `, ${local.numero}`}
                                            </Text>
                                            {(local.cidade || local.estado) && (
                                                <Text style={styles.infoSubtext}>
                                                    {local.cidade && `${local.cidade}`}
                                                    {local.cidade && local.estado && ', '}
                                                    {local.estado && local.estado}
                                                </Text>
                                            )}
                                            <TouchableOpacity style={styles.mapButton} onPress={handleVerNoMapa}>
                                                <Feather name="map-pin" size={16} color="#FFFFFF" />
                                                <Text style={styles.mapButtonText}>Ver no mapa</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
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
        flex: 1,
        color: colors.primary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    mainCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 0,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    localSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    localHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E0F2FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    localTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#0F766E',
        letterSpacing: -0.3,
    },
    infoCard: {
        backgroundColor: '#F9FAFB',
        padding: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconCircleSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0F2FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
        overflow: 'hidden',
    },
    iconCircleSmallWithImage: {
        backgroundColor: 'transparent',
    },
    dentistAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    infoSubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    mapButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
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
    loadingDataContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    loadingDataText: {
        marginTop: spacing.md,
        color: colors.textSecondary,
        fontSize: 14,
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
});

export default DetalhesAgendamentoItem;