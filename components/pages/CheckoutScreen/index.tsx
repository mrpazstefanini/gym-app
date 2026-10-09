import Text from "@/components/custom/Text";
import { PRICE_ID, PRICE_ID_TEST } from "@/shared/constants/envConstants";
import { RootReduxState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import { PaymentSubscriptionService } from "@/services/PaymentSubscriptionServices";
import { setSubscriptionListState } from "@/redux/slices/subscriptionSlice";
import { useTranslation } from "@/hooks/useTranslation";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import useCustomStyle from "@/hooks/useCustomStyle";
import { Button } from "@/components/custom/Button";
import { SeverityEnum } from "@/shared/enum/SeverityEnum";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "expo-router";
import BillingDayPicker from "@/components/custom/BillingDayPicker";
import { log } from "@/shared/utils/log";

// components/pages/CheckoutScreen/index.tsx
import React, { useMemo, useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { CardField, useStripe, initStripe } from "@stripe/stripe-react-native";
import { PUBLISH_KEY, PUBLISH_KEY_TEST } from "@/shared/constants/envConstants";

type CheckoutScreenProps = {
  reloadPageAfterPayment?: boolean;
};

export default function CheckoutScreen({
  reloadPageAfterPayment,
}: CheckoutScreenProps) {
  const router = useRouter();
  const { call } = useApi();
  const { t } = useTranslation();
  const { colors } = useCustomStyle();
  const { user } = useSelector((state: RootReduxState) => state.user);
  const dispatch = useDispatch();
  const { confirmSetupIntent } = useStripe();

  const [isTestCard, setIsTestCard] = useState(false);
  const [billingDay, setBillingDay] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  // ✅ Novo: controla se o Stripe foi reinicializado com a chave correta
  const [stripeInitialized, setStripeInitialized] = useState(true);
  const [currentStripeMode, setCurrentStripeMode] = useState<boolean>(false);

  // ✅ Reinicializa o Stripe quando o modo muda
  useEffect(() => {
    const reinitStripe = async () => {
      setStripeInitialized(false);

      const key = isTestCard ? (PUBLISH_KEY_TEST ?? "") : (PUBLISH_KEY ?? "");

      try {
        await initStripe({ publishableKey: key });
        setCurrentStripeMode(isTestCard);
        setStripeInitialized(true);
      } catch (e) {
        console.error("[Stripe] Falha ao reinicializar:", e);
        setStripeInitialized(true); // evita tela travada
      }
    };

    // Só reinicializa se o modo realmente mudou
    if (isTestCard !== currentStripeMode) {
      reinitStripe();
    }
  }, [isTestCard]);

  const currentPriceId = isTestCard ? PRICE_ID_TEST : PRICE_ID;

  const handleSubscribe = () => {
    if (!user?.email || !billingDay) return;

    call({
      loading: true,
      try: async (toast) => {
        setLoading(true);

        // ✅ Agora isTestCard está correto E o Stripe foi reinicializado
        const setupResponse = await PaymentSubscriptionService.setupIntent({
          email: user.email,
          isTest: isTestCard,
        });

        log("[Checkout] setupIntent criado:", {
          isTest: isTestCard,
          customerId: setupResponse.customerId,
        });

        log("[Checkout] Estado antes de confirmar:", {
          isTestCard,
          currentStripeMode,
          stripeInitialized,
          clientSecret: setupResponse.clientSecret.substring(0, 20) + "...",
          // setupIntent de teste começa com seti_ e tem _test_ no clientSecret
          clientSecretIsTest: setupResponse.clientSecret.includes("_test_"),
        });

        const { setupIntent, error } = await confirmSetupIntent(
          setupResponse.clientSecret,
          { paymentMethodType: "Card" },
        );

        if (error) {
          toast.show({
            type: "error",
            text1: t(AppMessagesEnum.ERROR),
            text2: error.message,
          });
          return;
        }

        if (!setupIntent?.paymentMethodId) {
          toast.show({
            type: "error",
            text1: t(AppMessagesEnum.ERROR),
            text2: t(AppMessagesEnum.SUBSCRIPTION_PAYMENT_METHOD_NOT_FOUND),
          });
          return;
        }

        const subscription =
          await PaymentSubscriptionService.createFromSetupIntent({
            customerId: setupResponse.customerId,
            paymentMethodId: setupIntent.paymentMethodId,
            priceId: currentPriceId,
            billingDay,
            isTest: isTestCard,
          });

        dispatch(setSubscriptionListState([subscription as any]));

        toast.show({
          type: "success",
          text1: t(AppMessagesEnum.SUCCESS),
          text2: t(AppMessagesEnum.SUBSCRIPTION_CREATED_SUCCESS),
        });

        if (reloadPageAfterPayment) {
          router.replace("/(authenticated)");
        }
      },
      catch: async (toast, error) => {
        log("error subscription", error);
        toast.show({
          type: "error",
          text1: t(AppMessagesEnum.ERROR),
          text2: error.message,
        });
      },
      finally: () => setLoading(false),
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {t(AppMessagesEnum.SUBSCRIPTION_PREMIUM_PLAIN)}
        </Text>
        <Text style={[styles.subtitle, { color: colors.gray600 }]}>
          R$ 1,00 / {t(AppMessagesEnum.MONTH)}
        </Text>
      </View>

      <BillingDayPicker
        email={user?.email || ""}
        priceId={currentPriceId}
        selectedDay={billingDay}
        onChange={(day) => setBillingDay(day)}
      />

      <View style={styles.cardContainer}>
        <Text style={styles.label}>
          {t(AppMessagesEnum.SUBSCRIPTION_CARD_DATA)}
        </Text>
        <CardField
          postalCodeEnabled={false}
          cardStyle={{
            backgroundColor: colors.background,
            textColor: colors.text,
            borderColor: colors.border,
            placeholderColor: colors.gray300,
            borderWidth: 1,
            borderRadius: 8,
            fontSize: 16,
          }}
          style={styles.cardField}
          onCardChange={(cardDetails) => {
            setCardComplete(cardDetails.complete);
            const testLast4 = ["4242", "4343", "0002", "1111"];
            setIsTestCard(testLast4.includes(cardDetails.last4 ?? ""));
          }}
        />

        {!stripeInitialized && (
          <View style={styles.reinitContainer}>
            <ActivityIndicator size="small" />
            <Text style={{ marginLeft: 8, color: colors.gray400 }}>
              Configurando modo de pagamento...
            </Text>
          </View>
        )}

        {isTestCard && stripeInitialized && (
          <Text style={[styles.hint, { color: colors.gray400 }]}>
            🧪 Modo teste detectado
          </Text>
        )}
      </View>

      <Button
        title={`${t(AppMessagesEnum.SUBSCRIPTION_CONFIRM_SUBSCRIPTION)} - R$ 1,00/mês`}
        onPress={handleSubscribe}
        severity={SeverityEnum.PRIMARY}
        disabled={loading || !cardComplete || !billingDay || !stripeInitialized}
        style={{ marginBottom: 10 }}
      />

      <View style={[styles.infoContainer, { backgroundColor: colors.gray200 }]}>
        <Text style={styles.infoTitle}>ℹ️ {t(AppMessagesEnum.INFO)}</Text>
        <Text style={[styles.infoText, { color: colors.notification.info }]}>
          • {t(AppMessagesEnum.SUBSCRIPTION_AUTO_RENEW)}
          {"\n"}• {t(AppMessagesEnum.SUBSCRIPTION_CANCEL_ANYTIME)}
          {"\n"}• {t(AppMessagesEnum.SUBSCRIPTION_FIRST_MONTH)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 30 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 18 },
  cardContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  cardField: { height: 50, marginVertical: 10 },
  hint: { textAlign: "center", fontSize: 14, marginTop: 10, marginBottom: 10 },
  reinitContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  infoContainer: { marginTop: 30, padding: 15, borderRadius: 8 },
  infoTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  infoText: { fontSize: 14, lineHeight: 22 },
});
