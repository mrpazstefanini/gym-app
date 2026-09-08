import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { CardField, useStripe } from "@stripe/stripe-react-native";
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

  const customStyle = useMemo(
    () => ({
      container: { backgroundColor: colors.background },
      subtitle: { color: colors.gray600 },
      hint: { color: colors.gray400 },
      infoContainer: { backgroundColor: colors.gray200 },
      infoText: { color: colors.notification.info },
      cardField: {
        backgroundColor: colors.background,
        textColor: colors.text,
        borderColor: colors.border,
        placeholderColor: colors.gray300,
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 16,
      },
    }),
    [colors],
  );

  const currentPriceId = isTestCard ? PRICE_ID_TEST : PRICE_ID;

  // ─────────────────────────────────────────────
  // ÚNICO PASSO: setupIntent + subscription juntos
  // ─────────────────────────────────────────────
  const handleSubscribe = () => {
    if (!user?.email || !billingDay) return;

    call({
      loading: true,
      try: async (toast) => {
        setLoading(true);

        // 1. Criar setupIntent com a chave correta (já sabe se é teste)
        const setupResponse = await PaymentSubscriptionService.setupIntent({
          email: user.email,
          isTest: isTestCard, // ✅ já sabe aqui
        });

        // 2. Confirmar cartão no Stripe
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

        // 3. Criar assinatura com priceId correto
        const subscription =
          await PaymentSubscriptionService.createFromSetupIntent({
            customerId: setupResponse.customerId,
            paymentMethodId: setupIntent.paymentMethodId,
            priceId: currentPriceId, // ✅ price correto
            billingDay,
            isTest: isTestCard, // ✅ flag correta
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
      style={[styles.container, customStyle.container]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {t(AppMessagesEnum.SUBSCRIPTION_PREMIUM_PLAIN)}
        </Text>
        <Text style={[styles.subtitle, customStyle.subtitle]}>
          R$ 1,00 / {t(AppMessagesEnum.MONTH)}
        </Text>
      </View>

      {/* Passo 1: Dia de cobrança */}
      <BillingDayPicker
        email={user?.email || ""}
        priceId={currentPriceId}
        selectedDay={billingDay}
        onChange={(day) => setBillingDay(day)}
      />

      {/* Passo 2: Cartão - sempre visível */}
      <View style={styles.cardContainer}>
        <Text style={styles.label}>
          {t(AppMessagesEnum.SUBSCRIPTION_CARD_DATA)}
        </Text>
        <CardField
          postalCodeEnabled={false}
          cardStyle={customStyle.cardField}
          style={styles.cardField}
          onCardChange={(cardDetails) => {
            setCardComplete(cardDetails.complete);
            // ✅ Detecta cartão de teste pelo last4
            const testLast4 = ["4242", "4343", "0002", "1111"];
            setIsTestCard(testLast4.includes(cardDetails.last4 ?? ""));
          }}
        />
        {isTestCard && (
          <Text style={[styles.hint, customStyle.hint]}>
            🧪 Modo teste detectado
          </Text>
        )}
      </View>

      {/* Botão confirmar */}
      <Button
        title={`${t(AppMessagesEnum.SUBSCRIPTION_CONFIRM_SUBSCRIPTION)} - R$ 1,00/mês`}
        onPress={handleSubscribe}
        severity={SeverityEnum.PRIMARY}
        disabled={loading || !cardComplete || !billingDay}
        style={{ marginBottom: 10 }}
      />

      {/* Informações */}
      <View style={[styles.infoContainer, customStyle.infoContainer]}>
        <Text style={styles.infoTitle}>ℹ️ {t(AppMessagesEnum.INFO)}</Text>
        <Text style={[styles.infoText, customStyle.infoText]}>
          • {t(AppMessagesEnum.SUBSCRIPTION_AUTO_RENEW)}
          {"\n"}• {t(AppMessagesEnum.SUBSCRIPTION_CANCEL_ANYTIME)}
          {"\n"}• {t(AppMessagesEnum.SUBSCRIPTION_FIRST_MONTH)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
  },
  cardContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  cardField: {
    height: 50,
    marginVertical: 10,
  },
  hint: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  infoContainer: {
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
