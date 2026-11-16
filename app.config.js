// app.config.js
const path = require("path");
const dotenv = require("dotenv");

// ─── Load correct .env file ───────────────────────────────────────────────────
const ENV = process.env.NODE_ENV || "development";
const envFile = ENV === "production" ? ".env.production" : ".env.development";

dotenv.config({ path: path.resolve(__dirname, envFile) });

console.log(`\n[app.config] Loading: ${envFile}`);

module.exports = ({ config }) => {
  const isDev = ENV !== "production";
  const stripeInitialKey = process.env.PUBLISH_KEY;

  console.log(`\n[app.config] ──────────────────────────────────`);
  console.log(`[app.config] Ambiente : ${isDev ? "🧪 DESENVOLVIMENTO" : "🔴 PRODUÇÃO"}`);
  console.log(`[app.config] Firebase : ${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}`);
  console.log(`[app.config] Storage : ${process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET}`);
  console.log(`[app.config] Stripe Key: ${stripeInitialKey?.substring(0, 20)}...`);
  console.log(`[app.config] Price ID : ${process.env.PRICE_ID}`);
  console.log(`[app.config] ──────────────────────────────────\n`);

  return {
    ...config,
    name: isDev ? "gym-app (dev)" : "gym-app",
    slug: "gym-app",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "gymapp",
    userInterfaceStyle: "automatic",

    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gymapp.ios",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ["location", "fetch"],
        NSLocationWhenInUseUsageDescription:
          "Este aplicativo usa sua localização para rastrear suas corridas.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "Este aplicativo usa sua localização para rastrear suas corridas mesmo quando o app está em segundo plano.",
        NSLocationAlwaysUsageDescription:
          "Este aplicativo usa sua localização para rastrear suas corridas mesmo quando o app está em segundo plano.",
      },
    },

    android: {
      package: "com.gymapp.android",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_LOCATION",
        "android.permission.WAKE_LOCK",
        "android.permission.POST_NOTIFICATIONS",
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },

    plugins: [
       "./plugins/withGoogleServices",
      [
        "./plugins/withStripeInit",
        {
          publishableKey: stripeInitialKey,
        },
      ],
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "merchant.com.gymapp",
          enableGooglePay: true,
        },
      ],
      "./plugins/withBuildConfigFields",
      "expo-router",
      "expo-localization",
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification_icon.png",
          color: "#ffffff",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location.",
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true,
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_URL_SCHEME,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends.",
        },
      ],
      [
        "expo-video",
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true,
        },
      ],
    ],

    extra: {
      router: { origin: false },
      eas: { projectId: "8936a338-308b-4704-96ed-0fc65405e242" },

      // ─── Environment ─────────────────────────────────────────────────────
      NODE_ENV: ENV,

      // ─── Firebase ────────────────────────────────────────────────────────
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,

      // ─── Google ──────────────────────────────────────────────────────────
      EXPO_PUBLIC_IOS_ID: process.env.EXPO_PUBLIC_IOS_ID,
      EXPO_PUBLIC_ANDROID_ID: process.env.EXPO_PUBLIC_ANDROID_ID,
      EXPO_PUBLIC_WEB_ID: process.env.EXPO_PUBLIC_WEB_ID,
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      EXPO_PUBLIC_LOG: process.env.EXPO_PUBLIC_LOG || "true",

      // ─── Stripe ──────────────────────────────────────────────────────────
      PRICE_ID: process.env.PRICE_ID,
      PUBLISH_KEY: process.env.PUBLISH_KEY,
      IS_TEST_CARD_MODE: process.env.IS_TEST_CARD_MODE,

      // ─── URLs ────────────────────────────────────────────────────────────
      BASE_URL: isDev
        ? process.env.EXPO_PUBLIC_BASE_URL_DEV
        : process.env.EXPO_PUBLIC_BASE_URL_PROD,
    },
  };
};