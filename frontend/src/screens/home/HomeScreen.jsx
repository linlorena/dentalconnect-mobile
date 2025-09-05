"use client"

import { useState, useRef, useEffect } from "react"
import { Image } from "react-native";
import { MaterialIcons, Feather } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
} from "react-native"
import { Animated } from "react-native";
import { useAuth } from '../../context/auth';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const { width } = Dimensions.get("window")

const HomeScreen = ({ navigation }) => {
  const { user, signOut } = useAuth()
  const [menuVisible, setMenuVisible] = useState(false)
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const [searchText, setSearchText] = useState("")
  

  const handleLogout = async () => {
    try {
      await signOut()
      console.log("Logout realizado com sucesso")
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }

    const menuItems = [
      { title: "Agendamentos", icon: <Feather name="calendar" size={22} color={colors.textPrimary} />, onPress: () => {} },
      { title: "Consultas", icon: <MaterialIcons name="medical-services" size={22} color={colors.textPrimary} />, onPress: () => {} },
      { title: "Serviços", icon: <Feather name="plus" size={22} color={colors.textPrimary} />, onPress: () => {} },
      { title: "Busca Avançada", icon: <Feather name="search" size={22} color={colors.textPrimary} />, onPress: () => {} },
      { title: "Configurações", icon: <Feather name="settings" size={22} color={colors.textPrimary} />, onPress: () => {} },
    ];
useEffect(() => {
  if (menuVisible) {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  } else {
    Animated.timing(slideAnim, {
      toValue: -width * 0.8,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      slideAnim.setValue(-width * 0.8);
    });
  }
}, [menuVisible, slideAnim]);


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>DentalConnect</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Encontre um profissional"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>👤</Text>
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>Olá, Laís</Text>
              <Text style={styles.question}>Como podemos cuidar da sua saúde hoje?</Text>
            </View>
          </View>

          {/* Dental Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
            <Text style={styles.illustrationText}>A Plataforma que cuida do seu sorriso</Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.cardsContainer}>
            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardIcon}>➕</Text>
              <Text style={styles.cardTitle}>Tratamentos</Text>
              <Text style={styles.cardDescription}>
                Conheça alguns dos procedimentos que oferecemos para cuidar do seu sorriso.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardIcon}>🎧</Text>
              <Text style={styles.cardTitle}>Fale Conosco</Text>
              <Text style={styles.cardDescription}>
                A DentalConnect quer te escutar. Envie suas sugestões, reclamações ou elogios.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Side Menu Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="none"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackground} onPress={() => setMenuVisible(false)} />
          <Animated.View style={[styles.sideMenu, { left: slideAnim }]}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setMenuVisible(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuContent}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    item.onPress();
                    setMenuVisible(false);
                  }}
                >
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
              {/* Botão Sair */}
              <TouchableOpacity
                style={styles.menuLogoutItem}
                onPress={() => {
                  handleLogout();
                  setMenuVisible(false);
                }}
              >
                <Feather name="log-out" size={22} color="#FF6B35" style={{ marginRight: 12, width: 30 }} />
                <Text style={styles.menuLogoutText}>Sair</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuButton: {
    padding: spacing.sm,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  logoutHeaderButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
  },
  logoutHeaderText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: spacing.borderRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
  },
  searchButton: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
  searchIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: spacing.paddingHorizontal,
    paddingVertical: spacing.paddingVertical,
  },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F4FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    position: "relative",
  },
  avatarText: {
    fontSize: 24,
    color: colors.primary,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  question: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  illustration: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  illustrationText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  cardsContainer: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: spacing.borderRadius,
    padding: spacing.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sideMenu: {
    position: "absolute", 
    left: 0,             
    top: 0,               
    bottom: 0,            
    width: width * 0.8,
    backgroundColor: "#fff",
    paddingTop: 50,
    zIndex: 10,           
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  menuContent: {
    flex: 1,
    paddingTop: spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 30,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  menuLogoutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: "#FFF5F5",
    marginTop: spacing.md,
    borderRadius: spacing.borderRadius,
  },
  menuLogoutIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 30,
    color: "#FF6B35",
  },
  menuLogoutText: {
    fontSize: 16,
    color: "#FF6B35",
    fontWeight: "bold",
  },
  illustrationImage: {
  width: 150,
  height: 150,
  alignSelf: "center",
  marginBottom: spacing.sm,
},
  
})

export default HomeScreen
