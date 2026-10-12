import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Text from "@/components/custom/Text";
import { useDispatch, useSelector } from "react-redux";
import { RootReduxState } from "@/redux";
import { PaymentSubscriptionService } from "@/services/PaymentSubscriptionServices";
import { PRICE_ID, IS_TEST_CARD_MODE } from "@/shared/constants/envConstants";
import UpdateCardModal from "@/components/UpdateCardModal";
import {
  getStatusText,
  SubscriptionsStatusEnum,
} from "@/shared/enum/SubscriptionsStatusEnum";
import { setSubscriptionListState } from "@/redux/slices/subscriptionSlice";
import { useTranslation } from "@/hooks/useTranslation";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import useCustomStyle from "@/hooks/useCustomStyle";
import { Button } from "@/components/custom/Button";
import { SeverityEnum } from "@/shared/enum/SeverityEnum";
import Toast from "react-native-toast-message";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "expo-router";
import { ISubscriptionByUserData } from "@/services/PaymentSubscriptionServices/interfaces";

// ─────────────────────────────────────────────
// Modal de alteração do dia de cobrança
// ─────────────────────────────────────────────
interface UpdateBillingDayModalProps {
  visible: boolean;
  subscriptionId: string;
  currentDay: number | null;
  email: string;
  priceId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const AVAILABLE_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

function UpdateBillingDayModal({
  visible,
  subscriptionId,
  currentDay,
  email,
  priceId,
  onSuccess,
  onCancel,
}: UpdateBillingDayModalProps) {
  const { colors } = useCustomStyle();
  const { t } = useTranslation();
  const { call } = useApi();

  const [selectedDay, setSelectedDay] = useState<number | null>(currentDay);
  const [preview, setPreview] = useState<{
    nextBillingDate: string;
    daysUntilBilling: number;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedDay || !visible) return;

    const fetch = async () => {
      try {
        setLoadingPreview(true);
        const result = await PaymentSubscriptionService.previewBillingDay({
          billingDay: selectedDay,
          priceId,
          email,
        });
        setPreview({
          nextBillingDate: result.nextBillingDate,
          daysUntilBilling: result.daysUntilBilling,
        });
      } catch {
        setPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetch();
  }, [selectedDay, visible]);

  useEffect(() => {
    if (visible) {
      setSelectedDay(currentDay);
      setPreview(null);
    }
  }, [visible]);

  const handleSave = () => {
    if (!selectedDay) return;

    call({
      loading: true,
      try: async (toast) => {
        setSaving(true);

        await PaymentSubscriptionService.updateBillingDay({
          subscriptionId,
          billingDay: selectedDay,
        });

        toast.show({
          type: "success",
          text1: t(AppMessagesEnum.SUCCESS),
          text2: t(AppMessagesEnum.BILLING_DAY_UPDATE_SUCCESS),
        });

        onSuccess();
      },
      catch: (toast, error: any) => {
        toast.show({
          type: "error",
          text1: t(AppMessagesEnum.ERROR),
          text2: error.message,
        });
      },
      finally: () => {
        setSaving(false);
      },
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={billingModalStyles.overlay}>
        <View
          style={[
            billingModalStyles.container,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <View style={billingModalStyles.header}>
            <Text style={[billingModalStyles.title, { color: colors.text }]}>
              📅 {t(AppMessagesEnum.BILLING_DAY_UPDATE_TITLE)}
            </Text>
            <Text
              style={[billingModalStyles.subtitle, { color: colors.gray600 }]}
            >
              {t(AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_SUBLABEL)}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={billingModalStyles.daysScroll}
          >
            {AVAILABLE_DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isCurrent = currentDay === day;

              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={[
                    billingModalStyles.dayButton,
                    {
                      backgroundColor: isSelected
                        ? colors.tint
                        : colors.background,
                      borderColor: isSelected
                        ? colors.tint
                        : isCurrent
                          ? colors.gray400
                          : colors.gray300,
                      borderWidth: isCurrent && !isSelected ? 2 : 1.5,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      billingModalStyles.dayText,
                      {
                        color: isSelected ? "#fff" : colors.text,
                        fontWeight: isSelected || isCurrent ? "700" : "400",
                      },
                    ]}
                  >
                    {day}
                  </Text>
                  {isCurrent && !isSelected && (
                    <View
                      style={[
                        billingModalStyles.currentDot,
                        { backgroundColor: colors.tint },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedDay && (
            <View
              style={[
                billingModalStyles.previewBox,
                { backgroundColor: colors.background },
              ]}
            >
              {loadingPreview ? (
                <ActivityIndicator size="small" color={colors.tint} />
              ) : preview ? (
                <>
                  <View style={billingModalStyles.previewRow}>
                    <Text
                      style={[
                        billingModalStyles.previewLabel,
                        { color: colors.gray600 },
                      ]}
                    >
                      📅 {t(AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_NEXT_DATE)}
                      :
                    </Text>
                    <Text
                      style={[
                        billingModalStyles.previewValue,
                        { color: colors.text },
                      ]}
                    >
                      {preview.nextBillingDate}
                    </Text>
                  </View>

                  <View style={billingModalStyles.previewRow}>
                    <Text
                      style={[
                        billingModalStyles.previewLabel,
                        { color: colors.gray600 },
                      ]}
                    >
                      ⏳{" "}
                      {t(AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_DAYS_UNTIL)}:
                    </Text>
                    <Text
                      style={[
                        billingModalStyles.previewValue,
                        { color: colors.text },
                      ]}
                    >
                      {preview.daysUntilBilling}{" "}
                      {t(AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_DAYS)}
                    </Text>
                  </View>

                  <View
                    style={[
                      billingModalStyles.infoBox,
                      { backgroundColor: colors.notification.infoBackground },
                    ]}
                  >
                    <Text
                      style={[
                        billingModalStyles.infoText,
                        { color: colors.notification.info },
                      ]}
                    >
                      ℹ️{" "}
                      {t(AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_NO_PRORATION)}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
          )}

          <View style={billingModalStyles.actions}>
            <Button
              title={t(AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_SAVE)}
              onPress={handleSave}
              severity={SeverityEnum.PRIMARY}
              disabled={saving || !selectedDay || selectedDay === currentDay}
            />
            <Button
              title={t(AppMessagesEnum.CANCEL)}
              onPress={onCancel}
              severity={SeverityEnum.SECONDARY}
              disabled={saving}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const billingModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  header: { gap: 4 },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  daysScroll: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: { fontSize: 14 },
  currentDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    position: "absolute",
    bottom: 4,
  },
  previewBox: { padding: 14, borderRadius: 12, gap: 8 },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: { fontSize: 13, flex: 1 },
  previewValue: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  infoBox: { padding: 10, borderRadius: 8, marginTop: 4 },
  infoText: { fontSize: 12 },
  actions: { gap: 10, marginTop: 4 },
});

// ─────────────────────────────────────────────
// Tela principal
// ─────────────────────────────────────────────

type MySubscriptionsScreenProps = {
  reloadPageAfterPayment?: boolean;
};

export default function MySubscriptionsScreen({
  reloadPageAfterPayment,
}: MySubscriptionsScreenProps) {
  const router = useRouter();
  const { call } = useApi();
  const { t } = useTranslation();
  const { user } = useSelector((state: RootReduxState) => state.user);
  const dispatch = useDispatch();
  const { colors } = useCustomStyle();

  const [subscriptions, setSubscriptions] = useState<ISubscriptionByUserData[]>(
    [],
  );
  const [isTestCard, setIsTestCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [updateCardModal, setUpdateCardModal] = useState<{
    visible: boolean;
    clientSecret: string;
    subscriptionId: string;
  }>({ visible: false, clientSecret: "", subscriptionId: "" });

  const [billingDayModal, setBillingDayModal] = useState<{
    visible: boolean;
    subscriptionId: string;
    currentDay: number | null;
  }>({ visible: false, subscriptionId: "", currentDay: null });

  // ── Helpers ─────────────────────────────────

  const treatCanceledSubscription = (subs: ISubscriptionByUserData[]) => {
    const allCanceled = subs.every(
      (sub) => sub.status === SubscriptionsStatusEnum.CANCELED,
    );

    if (allCanceled && subs.length > 0) {
      const canceledSubs = subs.filter(
        (sub): sub is ISubscriptionByUserData & { canceled_at: number } =>
          sub.canceled_at !== null,
      );

      if (canceledSubs.length === 0) return subs;

      const latest = canceledSubs.reduce((a, b) =>
        b.canceled_at > a.canceled_at ? b : a,
      );

      return [latest];
    }

    return subs.filter(
      (sub) => sub.status !== SubscriptionsStatusEnum.CANCELED,
    );
  };

  const getCurrentBillingDay = (
    item: ISubscriptionByUserData,
  ): number | null => {
    const firstItem = item.items?.data?.[0];
    if (!firstItem?.current_period_end) return null;
    const date = new Date(firstItem.current_period_end * 1000);
    return date.getDate();
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatPrice = (amount: number, currency: string) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case SubscriptionsStatusEnum.ACTIVE:
        return colors.notification.success;
      case SubscriptionsStatusEnum.CANCELED:
        return colors.notification.danger;
      case SubscriptionsStatusEnum.PAST_DUE:
      case SubscriptionsStatusEnum.UNPAID:
        return colors.notification.warn;
      default:
        return colors.notification.info;
    }
  };

  // ── Carregar assinaturas ─────────────────────

  const loadSubscriptions = async (emailOverride?: string) => {
    // ✅ Usa emailOverride se user ainda não está no Redux
    const email = emailOverride ?? user?.email;
    if (!email) return;

    try {
      const response =
        await PaymentSubscriptionService.listSubscriptionsByUser(email);
      setSubscriptions(treatCanceledSubscription(response.subscriptions));
      dispatch(setSubscriptionListState(response.subscriptions));
    } catch {
      Toast.show({
        type: "error",
        text1: t(AppMessagesEnum.ERROR),
        text2: t(AppMessagesEnum.SUBSCRIPTION_LOAD_ERROR),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Reage quando user aparecer no Redux (caso de login com subscription cancelada)
  useEffect(() => {
    if (!user?.email) return;
    loadSubscriptions(user.email);
  }, [user?.email]); // ← depende do email, não apenas []

  // ── Handlers: cartão ─────────────────────────

  const handleUpdateCard = (item: ISubscriptionByUserData) => {
    call({
      loading: true,
      try: async () => {
        setLoading(true);
        const setupResponse = await PaymentSubscriptionService.setupIntent({
          email: user?.email || "",
          isTest: isTestCard,
        });
        setUpdateCardModal({
          visible: true,
          clientSecret: setupResponse.clientSecret,
          subscriptionId: item.id,
        });
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

  const handleCardConfirmed = (paymentMethodId: string) => {
    call({
      loading: true,
      try: async (toast) => {
        setLoading(true);
        setUpdateCardModal({
          visible: false,
          clientSecret: "",
          subscriptionId: "",
        });

        await PaymentSubscriptionService.updatePaymentMethod({
          subscriptionId: updateCardModal.subscriptionId,
          paymentMethodId,
        });

        toast.show({
          type: "success",
          text1: t(AppMessagesEnum.SUBSCRIPTION_UPDATE_CARD_SUCCESS),
        });

        await loadSubscriptions();

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

  const handleCancelUpdateCard = () =>
    setUpdateCardModal({
      visible: false,
      clientSecret: "",
      subscriptionId: "",
    });

  // ── Handlers: dia de cobrança ────────────────

  const handleOpenBillingDayModal = (item: ISubscriptionByUserData) => {
    setBillingDayModal({
      visible: true,
      subscriptionId: item.id,
      currentDay: getCurrentBillingDay(item),
    });
  };

  const handleBillingDaySuccess = () => {
    setBillingDayModal({
      visible: false,
      subscriptionId: "",
      currentDay: null,
    });
    loadSubscriptions();
  };

  const handleCancelBillingDay = () =>
    setBillingDayModal({
      visible: false,
      subscriptionId: "",
      currentDay: null,
    });

  // ── Handlers: pagamento ──────────────────────

  const retryPayment = (subscriptionId: string) => {
    call({
      loading: true,
      try: async (toast) => {
        setLoading(true);
        const result =
          await PaymentSubscriptionService.retryPayment(subscriptionId);

        toast.show({
          type: result.status === "paid" ? "success" : "error",
          text1:
            result.status === "paid"
              ? t(AppMessagesEnum.SUCCESS)
              : t(AppMessagesEnum.ATTENTION),
          text2:
            result.status === "paid"
              ? t(AppMessagesEnum.SUBSCRIPTION_PAYMENT_SUCCESS)
              : t(AppMessagesEnum.SUBSCRIPTION_PAYMENT_PENDING),
        });

        loadSubscriptions();
      },
      catch: async (toast, error) => {
        toast.show({
          type: "error",
          text1: t(AppMessagesEnum.ERROR),
          text2:
            error.message ||
            t(AppMessagesEnum.SUBSCRIPTION_NOT_POSSIBLE_TO_PROCESS_PAYMENT),
        });
      },
      finally: () => setLoading(false),
    });
  };

  const handleRetryPayment = (subscriptionId: string) => {
    Alert.alert(
      t(AppMessagesEnum.TRY_AGAIN),
      t(AppMessagesEnum.SUBSCRIPTION_RETRY_PAYMENT_DESCRIPTION),
      [
        { text: t(AppMessagesEnum.CANCEL), style: "cancel" },
        {
          text: t(AppMessagesEnum.TRY),
          onPress: () => retryPayment(subscriptionId),
        },
      ],
    );
  };

  const handleReactivate = (item: ISubscriptionByUserData) => {
    const priceId = PRICE_ID;

    Alert.alert(
      t(AppMessagesEnum.SUBSCRIPTION_REACTIVATE_TITLE),
      t(AppMessagesEnum.SUBSCRIPTION_REACTIVATE_DESCRIPTION),
      [
        { text: t(AppMessagesEnum.CANCEL), style: "cancel" },
        {
          text: t(AppMessagesEnum.SUBSCRIPTION_REACTIVATE_TITLE),
          onPress: () => {
            call({
              loading: true,
              try: async (toast) => {
                setLoading(true);

                await PaymentSubscriptionService.reactivateSubscription({
                  customerId: item.customer,
                  priceId,
                  paymentMethodId: item.default_payment_method?.id,
                  isTest: IS_TEST_CARD_MODE,
                });

                toast.show({
                  type: "success",
                  text1: t(AppMessagesEnum.SUCCESS),
                  text2: t(AppMessagesEnum.SUBSCRIPTION_PAYMENT_SUCCESS),
                });

                await loadSubscriptions();

                if (reloadPageAfterPayment) {
                  router.replace("/(authenticated)");
                }
              },
              catch: (toast, error) => {
                toast.show({
                  type: "error",
                  text1: t(AppMessagesEnum.ERROR),
                  text2: error.message,
                });
              },
              finally: async () => setLoading(false),
            });
          },
        },
      ],
    );
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    Alert.alert(
      t(AppMessagesEnum.SUBSCRIPTION_CANCEL),
      t(AppMessagesEnum.SUBSCRIPTION_CANCEL_WARNING),
      [
        { text: t(AppMessagesEnum.NOT), style: "cancel" },
        {
          text: t(AppMessagesEnum.YES_CANCEL),
          style: "destructive",
          onPress: () => {
            call({
              loading: true,
              try: async (toast) => {
                await PaymentSubscriptionService.cancelSubscription(
                  subscriptionId,
                );

                toast.show({
                  type: "success",
                  text1: t(AppMessagesEnum.SUCCESS),
                  text2: t(AppMessagesEnum.SUBSCRIPTION_CANCELED),
                });

                loadSubscriptions();
              },
              catch: async (toast, error) => {
                toast.show({
                  type: "error",
                  text1: t(AppMessagesEnum.ERROR),
                  text2: error.message,
                });
              },
            });
          },
        },
      ],
    );
  };

  // ── Estilos dinâmicos ────────────────────────

  const customStyle = useMemo(
    () => ({
      container: { backgroundColor: colors.background },
      loadingContainer: { backgroundColor: colors.background },
      loadingText: { color: colors.text },
      emptyContainer: { backgroundColor: colors.backgroundSecondary },
      emptyTitle: { color: colors.gray700 },
      emptyText: { color: colors.gray700 },
      card: {
        backgroundColor: colors.backgroundSecondary,
        shadowColor: colors.shadow,
      },
      cardTitle: { color: colors.text },
      statusText: { color: colors.gray300 },
      priceText: { color: colors.tint },
      intervalText: { color: colors.gray600 },
      warningBox: {
        backgroundColor: colors.notification.warnBackground,
        borderLeftColor: colors.notification.warn,
      },
    }),
    [colors],
  );

  // ── Loading state ────────────────────────────

  if (loading) {
    return (
      <View style={[styles.loadingContainer, customStyle.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, customStyle.loadingText]}>
          {t(AppMessagesEnum.LOADING)}...
        </Text>
      </View>
    );
  }

  // ── Empty state ──────────────────────────────

  if (!loading && subscriptions.length === 0) {
    return (
      <View style={[styles.emptyContainer, customStyle.emptyContainer]}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={[styles.emptyTitle, customStyle.emptyTitle]}>
          {t(AppMessagesEnum.SUBSCRIPTION_NO_SUBSCRIPTIONS)}
        </Text>
        <Text style={[styles.emptyText, customStyle.emptyText]}>
          {t(AppMessagesEnum.SUBSCRIPTION_NO_ACTIVE_SUBSCRIPTIONS)}
        </Text>
        <Button
          title={t(AppMessagesEnum.SUBSCRIPTION_SUBSCRIBE_NOW)}
          onPress={() =>
            router.push(
              "/(authenticated)/(stacks)/(subscriptionStacks)/newSubscription/",
            )
          }
        />
      </View>
    );
  }

  // ── Render item ──────────────────────────────

  const renderSubscription = ({ item }: { item: ISubscriptionByUserData }) => {
    const firstItem = item.items.data[0];
    const price = firstItem?.price;
    const plan = item.plan;
    const card = item.default_payment_method?.card;

    const isActive = item.status === SubscriptionsStatusEnum.ACTIVE;
    const willCancel = item.cancel_at_period_end;
    const isPastDue = item.status === SubscriptionsStatusEnum.PAST_DUE;
    const isCanceled = item.status === SubscriptionsStatusEnum.CANCELED;

    const priceInfo = price
      ? {
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring.interval,
        }
      : {
          amount: plan.amount,
          currency: plan.currency,
          interval: plan.interval,
        };

    const currentBillingDay = getCurrentBillingDay(item);

    return (
      <View style={[styles.card, customStyle.card]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, customStyle.cardTitle]}>
              {t(AppMessagesEnum.SUBSCRIPTION_PLAN_PREMIUM)}
            </Text>
            <Text style={styles.planId}>
              {t(AppMessagesEnum.ID)}: {item.id.substring(0, 20)}...
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={[styles.statusText, customStyle.statusText]}>
              {getStatusText(item.status, willCancel)}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.priceText, customStyle.priceText]}>
            {formatPrice(priceInfo.amount, priceInfo.currency)}
          </Text>
          <Text style={[styles.intervalText, customStyle.intervalText]}>
            /{" "}
            {priceInfo.interval === "month"
              ? t(AppMessagesEnum.MONTH)
              : t(AppMessagesEnum.YEAR)}
          </Text>
        </View>

        <View style={styles.infoSection}>
          {card && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                💳 {t(AppMessagesEnum.CARD)}:
              </Text>
              <Text style={styles.infoValue}>
                •••• {card.last4} ({card.exp_month}/{card.exp_year})
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              📅 {t(AppMessagesEnum.SUBSCRIPTION_START_DATE)}:
            </Text>
            <Text style={styles.infoValue}>{formatDate(item.start_date)}</Text>
          </View>

          {currentBillingDay && isActive && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                🗓️ {t(AppMessagesEnum.SUBSCRIPTION_BILLING_DAY_LABEL)}:
              </Text>
              <Text style={[styles.infoValue, { color: colors.tint }]}>
                {t(AppMessagesEnum.BILLING_DAY_EVERY_DAY)} {currentBillingDay}
              </Text>
            </View>
          )}

          {isActive && !willCancel && firstItem && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                🔄 {t(AppMessagesEnum.SUBSCRIPTION_NEXT_BILLING_DATE)}:
              </Text>
              <Text style={styles.infoValue}>
                {formatDate(firstItem.current_period_end)}
              </Text>
            </View>
          )}

          {willCancel && firstItem && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                ⚠️ {t(AppMessagesEnum.SUBSCRIPTION_VALID_UNTIL)}:
              </Text>
              <Text
                style={[styles.infoValue, { color: colors.notification.warn }]}
              >
                {formatDate(firstItem.current_period_end)}
              </Text>
            </View>
          )}

          {item.canceled_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                ❌ {t(AppMessagesEnum.SUBSCRIPTION_CANCELED_AT)}:
              </Text>
              <Text style={styles.infoValue}>
                {formatDate(item.canceled_at)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          {isActive && !willCancel && (
            <>
              <Button
                title={`🗓️ ${t(AppMessagesEnum.BILLING_DAY_UPDATE_TITLE)}`}
                onPress={() => handleOpenBillingDayModal(item)}
                severity={SeverityEnum.SECONDARY}
                disabled={loading}
              />
              <Button
                title={t(AppMessagesEnum.SUBSCRIPTION_UPDATE_CARD)}
                onPress={() => handleUpdateCard(item)}
                severity={SeverityEnum.SECONDARY}
                disabled={loading}
              />
              <Button
                title={t(AppMessagesEnum.SUBSCRIPTION_CANCEL)}
                onPress={() => handleCancelSubscription(item.id)}
                severity={SeverityEnum.DANGER}
              />
            </>
          )}

          {isPastDue && (
            <>
              <Button
                title={`⚡ ${t(AppMessagesEnum.SUBSCRIPTION_RETRY_PAYMENT)}`}
                onPress={() => handleRetryPayment(item.id)}
                severity={SeverityEnum.SECONDARY}
              />
              <Button
                title={`💳 ${t(AppMessagesEnum.SUBSCRIPTION_UPDATE_CARD)}`}
                onPress={() => handleUpdateCard(item)}
                severity={SeverityEnum.SECONDARY}
              />
            </>
          )}

          {isCanceled && (
            <Button
              title={`♻️ ${t(AppMessagesEnum.SUBSCRIPTION_REACTIVATE)}`}
              onPress={() => handleReactivate(item)}
            />
          )}
        </View>

        {isPastDue && (
          <View
            style={[
              styles.warningBox,
              { backgroundColor: colors.notification.dangerBackground },
            ]}
          >
            <Text
              style={[
                styles.warningText,
                { color: colors.notification.danger },
              ]}
            >
              ⚠️ {t(AppMessagesEnum.SUBSCRIPTION_PAST_DUE_WARNING)}
            </Text>
          </View>
        )}

        {willCancel && firstItem && (
          <View style={[styles.warningBox, customStyle.warningBox]}>
            <Text
              style={[styles.warningText, { color: colors.notification.warn }]}
            >
              ⚠️ {t(AppMessagesEnum.SUBSCRIPTION_WILL_CANCEL_WARNING)}{" "}
              {formatDate(firstItem.current_period_end)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ── Render ───────────────────────────────────

  return (
    <View style={[styles.container, customStyle.container]}>
      <FlatList
        data={subscriptions}
        renderItem={renderSubscription}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadSubscriptions();
            }}
            tintColor={colors.tint}
          />
        }
      />

      <UpdateCardModal
        visible={updateCardModal.visible}
        clientSecret={updateCardModal.clientSecret}
        onSuccess={handleCardConfirmed}
        onCancel={handleCancelUpdateCard}
        setIsTestCard={setIsTestCard}
      />

      <UpdateBillingDayModal
        visible={billingDayModal.visible}
        subscriptionId={billingDayModal.subscriptionId}
        currentDay={billingDayModal.currentDay}
        email={user?.email || ""}
        priceId={PRICE_ID}
        onSuccess={handleBillingDaySuccess}
        onCancel={handleCancelBillingDay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 10, fontSize: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  emptyText: { fontSize: 16, marginBottom: 30, textAlign: "center" },
  listContent: { padding: 15 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  cardTitle: { fontSize: 20, fontWeight: "bold" },
  planId: { fontSize: 12, marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: "600" },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  priceText: { fontSize: 32, fontWeight: "bold" },
  intervalText: { fontSize: 16, marginLeft: 5 },
  infoSection: { marginBottom: 20 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  infoLabel: { fontSize: 14, flex: 1 },
  infoValue: { fontSize: 14, fontWeight: "500", flex: 1, textAlign: "right" },
  actionsContainer: { gap: 10, marginTop: 15, marginBottom: 15 },
  warningBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginTop: 10,
  },
  warningText: { fontSize: 13 },
});
