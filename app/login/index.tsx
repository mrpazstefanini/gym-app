import { Button } from "@/components/custom/Button";
import { ImageBackground, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import useLogin from "./useLogin";
import { useTranslation } from "@/hooks/useTranslation";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import { StatusBar } from "expo-status-bar";
import useCustomStyle from "@/hooks/useCustomStyle";
import { IOS_ID, NODE_ENV, WEB_ID } from "@/shared/constants/envConstants";
import { toggleStripeTestMode } from "@/redux/slices/stripeSlice";
import { RootReduxState } from "@reduxjs/toolkit";
import { SeverityEnum } from "@/shared/enum/SeverityEnum";

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
  const dispatch = useDispatch();
  const { isTestMode } = useSelector((state: RootReduxState) => state.stripe);

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

          {NODE_ENV && (
            <Button
              style={{ marginTop: 20 }}
              severity={SeverityEnum.SECONDARY}
              title={`Toggle Stripe Test (${isTestMode})`}
              onPress={() => dispatch(toggleStripeTestMode())}
            />
          )}
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
