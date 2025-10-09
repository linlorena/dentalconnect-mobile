import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import colors from "../../styles/colors";
import spacing from "../../styles/spacing";

const { width, height } = Dimensions.get("window");

const FaleConoscoScreen = ({ navigation }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nome || !email || !mensagem) {
      Alert.alert("Erro", "Nome, e-mail e mensagem são obrigatórios.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.0.33:3001/api/fale-conosco",
        {
          nome,
          email,
          telefone,
          mensagem,
        }
      );

      if (response.status === 201) {
        Alert.alert(
          "Sucesso",
          "Sua mensagem foi enviada com sucesso! Nossa equipe entrará em contato em breve."
        );
        setNome("");
        setEmail("");
        setTelefone("");
        setMensagem("");
      } else {
        Alert.alert(
          "Erro",
          response.data.message || "Ocorreu um erro ao enviar a mensagem."
        );
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      let erroMsg = "Ocorreu um erro ao conectar ao servidor.";
      if (error.response?.data?.error) {
        erroMsg = error.response.data.error;
        if (error.response.data.details) {
          erroMsg += `: ${error.response.data.details}`;
        }
      } else if (error.message) {
        erroMsg = error.message;
      }
      Alert.alert("Erro", erroMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header com Gradiente */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>Configurações</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{ padding: 20 }}
      >
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#0f172a",
              textAlign: "center",
            }}
          >
            Fale Conosco
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#0f172a",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Tem dúvidas ou precisa de ajuda? Entre em contato conosco.
          </Text>
          <Text
            style={{ fontSize: 16, color: "#0f172a", textAlign: "center" }}
          >
            Vamos fazer o possível para te ajudar.{" "}
            <Text style={{ color: "#00897B", fontWeight: "bold" }}>:)</Text>
          </Text>
        </View>

        {/* Informações de contato */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
          >
            <Text style={{ marginLeft: 10, color: "#555" }}>
              Avenida Santos Dumont, 3060 - Fortaleza/CE
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
          >
            <Text style={{ marginLeft: 10, color: "#555" }}>
              (85) 98765-4321
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
          >
            <Text style={{ marginLeft: 10, color: "#555" }}>
              faleconosco@dentalconnect.com
            </Text>
          </View>
        </View>

        {/* Formulário */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#0f172a",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Envie sua mensagem
          </Text>

          <TextInput
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
            style={inputStyle}
          />
          <TextInput
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={inputStyle}
          />
          <TextInput
            placeholder="Telefone (opcional)"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            style={inputStyle}
          />
          <TextInput
            placeholder="Mensagem"
            value={mensagem}
            onChangeText={setMensagem}
            multiline
            numberOfLines={4}
            style={[inputStyle, { height: 120, textAlignVertical: "top" }]}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={{
              backgroundColor: "#00897B",
              padding: 14,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 8,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
              >
                Enviar Mensagem
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const inputStyle = {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 10,
  padding: 12,
  marginBottom: 12,
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.paddingHorizontal,
    paddingTop: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
});

export default FaleConoscoScreen;
