import { StyleSheet, ImageBackground, View } from "react-native";

const backgroundImg = require("@/assets/images/home-background.png");

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImg}
        resizeMode="cover"
        style={styles.backgroundBlurred}
        blurRadius={10}
      />
      <ImageBackground
        source={backgroundImg}
        resizeMode="contain"
        style={styles.backgroundSharp}
      >
        {/* Seu conteúdo aqui */}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundBlurred: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  backgroundSharp: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
