"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput,
} from "react-native"
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import API_CONFIG from '../../config/api'
import { useAuth } from '../../context/auth'

const { width, height } = Dimensions.get("window")

const COLORS = {
  primary: "#0F76AE",
  primaryLight: "#3598C9",
  primaryDark: "#0B5B87",
  accent: "#0F76AE",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  background: "#F8FAFC",
  backgroundAlt: "#F0F4F8",
  white: "#FFFFFF",
  border: "#DDE1E6",
  success: "#10B981",
  lightBlue: "#E6F3F9",
  lightBlueAccent: "#B3DCEF",
  teal: "#E0F2F1",
  purple: "#F3E5F5",
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  paddingHorizontal: 16,
}

const MOCK_CITIES = [] // Removendo o mock de cidades

const AgendarConsultaScreen = ({ navigation }) => {
  const [locais, setLocais] = useState([]) // Novo estado para locais
  const [cidades, setCidades] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filteredCidades, setFilteredCidades] = useState([])
  const { user } = useAuth() // Importando useAuth

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    carregarDados()
    iniciarAnimacoes()
  }, [])

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredCidades(cidades)
    } else {
      const filtered = cidades.filter((cidade) => cidade.toLowerCase().includes(searchText.toLowerCase()))
      setFilteredCidades(filtered)
    }
  }, [searchText, cidades])

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

  const carregarDados = async () => {
    setLoading(true)
    try {
      const responseLocais = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOCALS}`)
      if (responseLocais.ok) {
        const locaisData = await responseLocais.json()
        setLocais(locaisData)
        
        const cidadesUnicas = [...new Set(locaisData.map(local => local.cidade))]
        setCidades(cidadesUnicas)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      Alert.alert("Erro", "Não foi possível carregar os dados. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleCidadeSelecionada = (cidade) => {
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
    ]).start()

    setTimeout(() => {
      if (navigation?.navigate) {
        navigation.navigate("ClinicasPorCidade", { cidade })
      }
    }, 200)
  }

  const handleClearSearch = () => {
    setSearchText("")
  }

  const renderCidade = ({ item, index }) => {
    const clinicasCount = locais.filter(local => local.cidade === item).length

    return (
      <Animated.View
        style={[
          styles.cidadeCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cidadeCardContent}
          onPress={() => handleCidadeSelecionada(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardGradientBg} />

          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <MaterialCommunityIcons name="map-marker-outline" size={24} color={COLORS.white} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cidadeNome}>{item}</Text>
                <Text style={styles.cidadeClinicas}>
                  {clinicasCount} clínica{clinicasCount !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.chevronIcon}>
                <Feather name="arrow-right" size={20} color={COLORS.primary} />
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.cardStats}>
              <View style={styles.statBadge}>
                <MaterialCommunityIcons name="hospital-building" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>Clínicas disponíveis</Text>
              </View>
              <View style={styles.statCounter}><Text style={styles.statCounterText}>{clinicasCount}</Text></View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderLoadingCard = () => (
    <View style={styles.loadingCard}>
      <View style={styles.loadingIconContainer}>
        <MaterialCommunityIcons name="hospital-building" size={40} color={COLORS.primary} />
      </View>
      <Text style={styles.loadingText}>Buscando cidades...</Text>
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyStateCard}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="magnify-close" size={48} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.emptyStateText}>Nenhuma cidade encontrada</Text>
      <Text style={styles.emptyStateSubtext}>Tente ajustar sua busca</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack && navigation.goBack()}>
          <View style={styles.backButtonContainer}>
            <Feather name="arrow-left" size={24} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        <View style={styles.headerContent}>
        
          <Text style={styles.headerTitle}>Agendar Consulta</Text>
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
          <View style={styles.bannerDecorative1} />
          <View style={styles.bannerDecorative2} />

          <View style={styles.bannerContent}>
            <View style={styles.bannerIcon}>
              <MaterialCommunityIcons name="hospital-box" size={36} color={COLORS.white} />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Encontre Clínicas</Text>
              <Text style={styles.bannerSubtitle}>Escolha sua cidade e agende sua consulta agora</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.searchSection}>
          <View style={styles.searchLabel}>
            <Text style={styles.searchLabelText}>Buscar cidade</Text>
          </View>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color={COLORS.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome da cidade..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText !== "" && (
              <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                <Feather name="x-circle" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.citiesSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.resultCounter}>
              <Text style={styles.resultCountText}>{filteredCidades.length}</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>
                Resultado{filteredCidades.length !== 1 ? "s" : ""} encontrado
                {filteredCidades.length !== 1 ? "s" : ""}
              </Text>
              <Text style={styles.sectionSubtitle}>Toque em uma cidade para ver clínicas</Text>
            </View>
          </View>

          {loading ? (
            renderLoadingCard()
          ) : filteredCidades.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredCidades}
              renderItem={renderCidade}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.cidadesList}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.paddingHorizontal,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: SPACING.paddingHorizontal,
    paddingBottom: SPACING.xl,
  },
  welcomeBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: SPACING.xl,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  bannerDecorative1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.1,
  },
  bannerDecorative2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.1,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.lg,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  searchSection: {
    marginBottom: SPACING.xl,
  },
  searchLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  searchLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: SPACING.sm,
  },
  citiesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  resultCounter: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  resultCountText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  cidadesList: {
    paddingBottom: 20,
  },
  cidadeCard: {
    marginBottom: SPACING.xl + 4,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    overflow: "hidden",
  },
  cidadeCardContent: {
    flex: 1,
  },
  cardGradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: COLORS.primary,
  },
  cardBody: {
    padding: SPACING.xl + 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeaderText: {
    flex: 1,
  },
  cidadeNome: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.2,
  },
  cidadeClinicas: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  chevronIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  cardStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "700",
    marginLeft: SPACING.sm,
    letterSpacing: 0.1,
  },
  statCounter: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.lightBlue,
  },
  statCounterText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    padding: 48,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  loadingIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  emptyStateCard: {
    backgroundColor: COLORS.white,
    padding: 48,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.2,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
})

export default AgendarConsultaScreen
