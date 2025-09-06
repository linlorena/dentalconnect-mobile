import { View, Image, StyleSheet } from "react-native";

const SplashScreen = () => (
  <View style={styles.container}>
    <Image
      source={require("../../assets/logo.png")}
      style={styles.logo}
      resizeMode="contain"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
});

export default SplashScreen;