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
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux";
import { OverlayProvider } from "@/contexts/overlayContext";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";
import { RealmProvider } from "@/database/RealmProvider";
import { ActivityIndicator, View } from "react-native";
import { AppInitProvider } from "@/contexts/appInitializerContext";
import useCustomStyle from "@/hooks/useCustomStyle";
import { StripeProvider, initStripe } from "@stripe/stripe-react-native";
import { PUBLISH_KEY } from "@/shared/constants/envConstants";
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
  const [loaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [stripeReady, setStripeReady] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    const init = async () => {
      // ✅ Guard against null/undefined publishable key
      if (!PUBLISH_KEY) {
        log(
          "[Stripe] PUBLISH_KEY is null/undefined! " +
            "Check your .env file has EXPO_PUBLIC_PUBLISH_KEY set.",
        );
        setStripeError("Stripe key missing");
        return;
      }

      log(
        "[Stripe] Initializing with key:",
        PUBLISH_KEY.substring(0, 12) + "...",
      );

      try {
        await initStripe({
          publishableKey: PUBLISH_KEY,
        });
        log("[Stripe] initStripe completed successfully");
        setStripeReady(true);
      } catch (e) {
        log("[Stripe] initStripe failed:", e);
        setStripeError(String(e));
      }
    };

    init();
  }, []);

  if (!loaded || (!stripeReady && !stripeError)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={PUBLISH_KEY ?? ""}>
      <RootLayoutNav />
    </StripeProvider>
  );
}

function RootLayoutNav() {
  const { colors } = useCustomStyle();
  const colorScheme = useColorScheme();

  return (
    <ReduxProvider store={store}>
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
    </ReduxProvider>
  );
}
