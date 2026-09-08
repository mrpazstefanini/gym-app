// app/(subscription)/newSubscription/index.tsx
import CheckoutScreen from "@/components/pages/CheckoutScreen";

export default function SubscriptionLayout() {
  return <CheckoutScreen reloadPageAfterPayment />;
  // StripeProvider removido daqui
}