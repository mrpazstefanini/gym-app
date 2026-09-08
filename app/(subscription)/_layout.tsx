// app/(subscription)/_layout.tsx

import { Stack } from "expo-router";
import { useCallback, useEffect } from "react";
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import useCustomStyle from "@/hooks/useCustomStyle";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import { useTranslation } from "@/hooks/useTranslation";
import { StripeProvider } from "@stripe/stripe-react-native";
import { PUBLISH_KEY } from "@/shared/constants/envConstants";

export default function SubscriptionLayout() {
  const { colors } = useCustomStyle();
  const { t } = useTranslation();

  const requestCameraPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Desculpe, precisamos de permissão para usar a câmera!");
    }
  }, []);

  const requestMediaLibraryPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permissão de Acesso Negada",
        text2: "Você precisa permitir o acesso à galeria para continuar.",
      });
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    requestMediaLibraryPermission();
    requestCameraPermission();
  }, [requestCameraPermission, requestMediaLibraryPermission]);

  return (
    // <StripeProvider publishableKey={PUBLISH_KEY}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Stack
          screenOptions={{
            headerShown: true,
            presentation: "modal",
            headerStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="newSubscription"
            options={{
              headerTitle: t(AppMessagesEnum.DRAWER_SUBSCRIPTION),
              title: t(AppMessagesEnum.DRAWER_SUBSCRIPTION),
            }}
          />
          <Stack.Screen
            name="subscriptionByUserDrawer"
            options={{
              headerTitle: t(AppMessagesEnum.MY_SUBSCRIPTION),
              title: t(AppMessagesEnum.MY_SUBSCRIPTION),
            }}
          />
        </Stack>
      </SafeAreaView>
    // </StripeProvider>
  );
}