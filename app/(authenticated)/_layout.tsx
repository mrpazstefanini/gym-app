import { AuthContext } from "@/contexts/authContext";
import { Redirect, Stack } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { setLoginMessage } from "@/redux/slices/authSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import useCustomStyle from "@/hooks/useCustomStyle";
import { fetchSubscription } from "@/redux/actions/subscriptionActions";
import { RootReduxState } from "@/redux";
import { SubscriptionsStatusEnum } from "@/shared/enum/SubscriptionsStatusEnum";
import { log } from "@/shared/utils/log";

export default function StacksLayout() {
  const { colors } = useCustomStyle();
  const authState = useContext(AuthContext);
  const dispatch = useDispatch();
  const { subscriptionList, loading: isSubscriptionLoading } = useSelector(
    (state: RootReduxState) => state.subscription,
  );

  const [isLoading, setIsLoading] = useState<boolean>(
    subscriptionList === null, // null = nunca buscou, [] = buscou e está vazio
  );
  const [subscriptionFetched, setSubscriptionFetched] = useState<boolean>(
    subscriptionList !== null, // já foi buscado se não for null
  );

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

  useEffect(() => {
    if (!authState.isReady) return;

    if (!authState.isLoggedIn) {
      setIsLoading(false);
      setSubscriptionFetched(false);
      return;
    }

    if (subscriptionFetched) return;

    const load = async () => {
      try {
        await dispatch(fetchSubscription());
        setSubscriptionFetched(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [dispatch, authState.isReady, authState.isLoggedIn, subscriptionFetched]);

  useEffect(() => {
    if (!authState.isLoggedIn && authState.loginMessage) {
      Toast.show({
        type: "info",
        text1: "atenção",
        text2: authState.loginMessage,
      });
      dispatch(setLoginMessage(undefined));
    }
  }, [authState.isLoggedIn, authState.loginMessage, dispatch]);

  log("1 subscriptionList", subscriptionList);

  // 1. Aguarda authContext inicializar
  if (!authState.isReady) {
    return null;
  }

  // 2. Se não está logado, redireciona para login
  if (!authState.isLoggedIn) {
    return <Redirect href="/login" />;
  }

  // 3. Aguarda subscription carregar
  if (isLoading || isSubscriptionLoading) {
    return null;
  }

  // 4. Sem subscription → nova subscription
  if (!subscriptionList || subscriptionList.length === 0) {
    return <Redirect href="/(subscription)/newSubscription" />;
  }

  log("2 subscriptionList", subscriptionList);

  // 5. Sem subscription ativa → gerenciar subscription
  if (
    !subscriptionList ||
    !subscriptionList.some((subscription) =>
      [
        SubscriptionsStatusEnum.ACTIVE,
        SubscriptionsStatusEnum.TRIALING,
      ].includes(subscription.status as SubscriptionsStatusEnum),
    )
  ) {
    return <Redirect href="/(subscription)/subscriptionByUserDrawer" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Stack
        screenOptions={{
          headerShown: true,
          presentation: "modal",
          headerStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(drawers)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(stacks)/(academyStacks)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stacks)/(exercisesStacks)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stacks)/(userStacks)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stacks)/(trainingStacks)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stacks)/(trainingByUserStacks)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stacks)/(StacksByExercisesTab)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stacks)/GpsStack"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stacks)/userSettingsStack"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stacks)/(chartsStacks)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stacks)/(groupsStacks)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stacks)/(subscriptionStacks)"
          options={{ headerShown: false }}
        />
      </Stack>
    </SafeAreaView>
  );
}
