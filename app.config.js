const path = require("path");
const fs = require("fs");

// ─── Environment ──────────────────────────────────────────────────────────────
const ENV = process.env.NODE_ENV || "development";
const isDev = ENV !== "production";
const skipDotenv = process.env.EXPO_NO_DOTENV === "1"
  || process.env.EXPO_NO_DOTENV === "true";

console.log(`\n[app.config] ENV : ${ENV}`);
console.log(`[app.config] isDev : ${isDev}`);
console.log(`[app.config] skipDotenv : ${skipDotenv}`);

// ✅ Only load .env locally (not on EAS)
if (!skipDotenv) {
  const dotenv = require("dotenv");
  const envFile = isDev ? ".env.development" : ".env.production";
  const envPath = path.resolve(__dirname, envFile);

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`[app.config] Loaded: ${envFile}`);
  } else {
    console.warn(`[app.config] Warning: ${envFile} not found`);
  }
}

console.log(`[app.config] PUBLISH_KEY: ${process.env.PUBLISH_KEY?.substring(0, 20)}...`);
console.log(`[app.config] BASE_URL : ${isDev ? process.env.EXPO_PUBLIC_BASE_URL_DEV : process.env.EXPO_PUBLIC_BASE_URL_PROD}`);

module.exports = ({ config }) => {
  const stripeInitialKey = process.env.PUBLISH_KEY;

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
        { publishableKey: stripeInitialKey },
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
        { iosUrlScheme: process.env.EXPO_URL_SCHEME },
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
      NODE_ENV: ENV,
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      EXPO_PUBLIC_IOS_ID: process.env.EXPO_PUBLIC_IOS_ID,
      EXPO_PUBLIC_ANDROID_ID: process.env.EXPO_PUBLIC_ANDROID_ID,
      EXPO_PUBLIC_WEB_ID: process.env.EXPO_PUBLIC_WEB_ID,
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      EXPO_PUBLIC_LOG: process.env.EXPO_PUBLIC_LOG || "true",
      PRICE_ID: process.env.PRICE_ID,
      PUBLISH_KEY: process.env.PUBLISH_KEY,
      IS_TEST_CARD_MODE: process.env.IS_TEST_CARD_MODE,
      BASE_URL: isDev
        ? process.env.EXPO_PUBLIC_BASE_URL_DEV
        : process.env.EXPO_PUBLIC_BASE_URL_PROD,
    },
  };
};