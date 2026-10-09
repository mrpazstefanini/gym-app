// app.config.js
module.exports = ({ config }) => {
  const isDev = process.env.NODE_ENV !== "production";

  const stripeInitialKey = isDev
    ? process.env.PUBLISH_KEY_TEST   // pk_test_...
    : process.env.PUBLISH_KEY;       // pk_live_...

  const stripePriceId = isDev
    ? process.env.PRICE_ID_TEST
    : process.env.PRICE_ID;


  console.log(`\n[app.config] ──────────────────────────────────`);
  console.log(`[app.config] Ambiente  : ${isDev ? "🧪 DESENVOLVIMENTO" : "🔴 PRODUÇÃO"}`);
  console.log(`[app.config] Stripe Key: ${stripeInitialKey?.substring(0, 20)}...`);
  console.log(`[app.config] Price ID  : ${stripePriceId}`);
  console.log(`[app.config] ──────────────────────────────────\n`);


  return {
    ...config,
    name: "gym-app",
    slug: "gym-app",
    version: "1.0.0",
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
      buildNumber: "1",
      infoPlist: {
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
      versionCode: 1,
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
      // ─── Stripe ────────────────────────────────────────────────────────────
      [
        "./plugins/withStripeInit",       // ← injeta no MainApplication.kt
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

      // ─── BuildConfig fields ────────────────────────────────────────────────
      "./plugins/withBuildConfigFields",  // ← injeta no build.gradle

      // ─── Outros plugins ───────────────────────────────────────────────────
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
          iosUrlScheme:
            "com.googleusercontent.apps.860916687866-lrfne2vgv2s32ujts70um1c3dahfhh66",
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

      // ─── Ambiente ──────────────────────────────────────────────────────────
      NODE_ENV: process.env.NODE_ENV || "development",

      // ─── Google ────────────────────────────────────────────────────────────
      EXPO_PUBLIC_IOS_ID: process.env.EXPO_PUBLIC_IOS_ID,
      EXPO_PUBLIC_ANDROID_ID: isDev
        ? process.env.EXPO_PUBLIC_ANDROID_ID_DEV
        : process.env.EXPO_PUBLIC_ANDROID_ID_PROD,
      EXPO_PUBLIC_WEB_ID: process.env.EXPO_PUBLIC_WEB_ID,
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      EXPO_PUBLIC_LOG: process.env.EXPO_PUBLIC_LOG || "true",

      // ─── Stripe ────────────────────────────────────────────────────────────
      PRICE_ID: stripePriceId,
      PUBLISH_KEY: process.env.PUBLISH_KEY,
      PUBLISH_KEY_TEST: process.env.PUBLISH_KEY_TEST,
      // ⚠️ NUNCA exponha secret keys no frontend/extra
      // STRIPE_SECRET_KEY deve ficar apenas no backend

      // ─── URLs ──────────────────────────────────────────────────────────────
      BASE_URL: isDev
        ? process.env.EXPO_PUBLIC_BASE_URL_DEV
        : process.env.EXPO_PUBLIC_BASE_URL_PROD,
    },
  };
};