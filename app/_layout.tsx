// app/_layout.tsx
import "expo-constants";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useColorScheme } from "@/components/custom/useColorScheme";
import { AuthProvider } from "@/contexts/authContext";
import { Provider as ReduxProvider, useSelector } from "react-redux";
import { RootReduxState, store } from "@/redux";
import { OverlayProvider } from "@/contexts/overlayContext";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import { RealmProvider } from "@/database/RealmProvider";
import { ActivityIndicator, View } from "react-native";
import { AppInitProvider } from "@/contexts/appInitializerContext";
import useCustomStyle from "@/hooks/useCustomStyle";
import { StripeProvider, initStripe } from "@stripe/stripe-react-native";
import { PUBLISH_KEY, PUBLISH_KEY_TEST } from "@/shared/constants/envConstants";
import FontAwesome from "@expo/vector-icons/build/FontAwesome";
import { log } from "@/shared/utils/log";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

const toastConfig = {
  error: (props: any) => (
    <ErrorToast
      {...props}
      text1NumberOfLines={3}
      text1Style={{ fontSize: 14, flexWrap: "wrap" }}
    />
  ),
  success: (props: any) => (
    <BaseToast
      {...props}
      text1NumberOfLines={3}
      text1Style={{ fontSize: 14, flexWrap: "wrap" }}
    />
  ),
};

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <StripeWrapper />
    </ReduxProvider>
  );
}

// app/_layout.tsx
function StripeWrapper() {
  const [loaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const { isTestMode } = useSelector((state: RootReduxState) => state.stripe);
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // ✅ Sempre começa com a chave de teste no layout raiz
  // A troca dinâmica acontece no CheckoutScreen via initStripe()
  const publishableKey = isTestMode
    ? (PUBLISH_KEY_TEST ?? "")
    : (PUBLISH_KEY ?? "");

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // ✅ Reinicializa quando isTestMode muda
  useEffect(() => {
    const init = async () => {
      if (!publishableKey) {
        log("[Stripe] publishableKey ausente! Verifique o .env");
        setStripeError("Stripe key missing");
        return;
      }

      const mode = publishableKey.startsWith("pk_live") ? "REAL" : "TESTE";
      log(`[Stripe] Inicializando (${mode}):`, publishableKey.substring(0, 20) + "...");

      try {
        await initStripe({ publishableKey });
        log("[Stripe] initStripe OK");
        setStripeReady(true);
      } catch (e) {
        log("[Stripe] initStripe FALHOU:", e);
        setStripeError(String(e));
      }
    };

    init();
  }, [publishableKey]); // ← depende de publishableKey, não []

  if (!loaded || (!stripeReady && !stripeError)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <RootLayoutNav />
    </StripeProvider>
  );
}

function RootLayoutNav() {
  const { colors } = useCustomStyle();
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <RealmProvider>
        <OverlayProvider>
          <AppInitProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="(authenticated)" />
                <Stack.Screen name="(subscription)" />
              </Stack>
              <StatusBar backgroundColor={colors.background} />
              <Toast config={toastConfig} />
            </ThemeProvider>
          </AppInitProvider>
        </OverlayProvider>
      </RealmProvider>
    </AuthProvider>
  );
}
