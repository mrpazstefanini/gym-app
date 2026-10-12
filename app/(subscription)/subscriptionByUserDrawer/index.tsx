import { View, StyleSheet } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { PUBLISH_KEY } from "@/shared/constants/envConstants";
import MySubscriptionsScreen from "@/components/pages/MySubscriptionsScreen";


export default function SubscriptionByUserDrawer() {

  return (
    <StripeProvider publishableKey={PUBLISH_KEY}>
      <View style={[styles.container]}>
        <MySubscriptionsScreen reloadPageAfterPayment />
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  nameInput: {},
  buttonContainer: {
    gap: 10,
  },
});
