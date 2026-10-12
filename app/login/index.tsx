import { Button } from "@/components/custom/Button";
import { ImageBackground, StyleSheet, View } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import useLogin from "./useLogin";
import { useTranslation } from "@/hooks/useTranslation";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import { StatusBar } from "expo-status-bar";
import useCustomStyle from "@/hooks/useCustomStyle";
import { IOS_ID, WEB_ID } from "@/shared/constants/envConstants";

const backgroundImg = require("@assets/images/background.jpg");
const logoImg = require("@assets/images/google-logo.png");

GoogleSignin.configure({
  iosClientId: IOS_ID,
  webClientId: WEB_ID,
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export default function Login() {
  const { theme } = useCustomStyle();
  const { handleGoogleSignIn } = useLogin();
  const { t } = useTranslation();


  return (
    <>
      <StatusBar style={theme} backgroundColor="transparent" />
      <ImageBackground
        source={backgroundImg}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.content}>
          <Button
            title={t(AppMessagesEnum.LOGIN_ACCESS_BUTTON)}
            isTransparent
            imageSource={logoImg}
            onPress={handleGoogleSignIn}
          />


        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    padding: 20,
  },
  content: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 24,
  },
});
