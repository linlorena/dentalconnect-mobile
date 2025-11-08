import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const procedimentos = [
  { icon: 'tooth-outline', title: 'Limpeza e Profilaxia', description: 'Procedimento para remover placas bacterianas e tártaro, prevenindo cáries e doenças periodontais.', color: '#4DB6AC' },
  { icon: 'creation', title: 'Clareamento Dental', description: 'Tratamento estético que remove manchas e devolve o branco natural dos dentes com resultados duradouros.', color: '#FFB74D' },
  { icon: 'wrench-outline', title: 'Restaurações', description: 'Recuperação de dentes danificados por cáries ou fraturas utilizando materiais de alta qualidade.', color: '#64B5F6' },
  { icon: 'medical-bag', title: 'Tratamento de Canal', description: 'Procedimento que remove a infecção da polpa dentária, preservando o dente natural e aliviando a dor.', color: '#81C784' },
  { icon: 'screw-lag', title: 'Implantes Dentários', description: 'Solução definitiva para substituição de dentes perdidos com aparência e função semelhantes aos naturais.', color: '#9575CD' },
  { icon: 'format-align-justify', title: 'Ortodontia', description: 'Correção do alinhamento dos dentes e problemas de mordida com aparelhos fixos ou removíveis.', color: '#BA68C8' },
  { icon: 'human-female-boy', title: 'Próteses Dentárias', description: 'Reposição de dentes ausentes com próteses fixas ou removíveis, devolvendo função e estética.', color: '#F06292' },
  { icon: 'baby-face-outline', title: 'Odontopediatria', description: 'Cuidados especializados para a saúde bucal das crianças, com foco na prevenção e educação.', color: '#FFD54F' },
];

const ProcedimentoCard = ({ icon, title, description, color, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.cardHeader}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <Text style={styles.cardDescription}>{description}</Text>
  </TouchableOpacity>
);

const ProcedimentosScreen = () => {
  const navigation = useNavigation();

  const handleCardPress = (procedimento) => {
    console.log(procedimento.title);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nossos Procedimentos</Text>
          <Text style={styles.headerSubtitle}>
            Aqui você encontrará uma seleção de alguns dos procedimentos disponíveis. Nossa equipe está pronta para oferecer cuidados personalizados para o seu sorriso.
          </Text>
        </View>

        <View style={styles.grid}>
          {procedimentos.map((item, index) => (
            <ProcedimentoCard
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              color={item.color}
              onPress={() => handleCardPress(item)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    marginTop: 50
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#566573',
    textAlign: 'center',
    lineHeight: 24,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
});

export default ProcedimentosScreen;

