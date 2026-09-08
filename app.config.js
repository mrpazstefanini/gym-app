// app.config.js
module.exports = ({ config }) => {
  // ✅ Debug: confirm env vars are loaded
  console.log("[app.config] PUBLISH_KEY:", process.env.PUBLISH_KEY?.substring(0, 12));
  console.log("[app.config] PRICE_ID:", process.env.PRICE_ID);

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
      // ✅ Pass the REAL key to the native plugin
      [
        "./plugins/withStripeInit",
        {
          publishableKey: process.env.PUBLISH_KEY, // ← use env var, not placeholder
        },
      ],
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "merchant.com.seuapp.academia",
          enableGooglePay: true,
        },
      ],
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
      router: {
        origin: false,
      },
      eas: {
        projectId: "8936a338-308b-4704-96ed-0fc65405e242",
      },
      NODE_ENV: process.env.NODE_ENV || "development",

      EXPO_PUBLIC_IOS_ID: process.env.EXPO_PUBLIC_IOS_ID,
      EXPO_PUBLIC_ANDROID_ID: process.env.EXPO_PUBLIC_ANDROID_ID_PROD,
      EXPO_PUBLIC_WEB_ID: process.env.EXPO_PUBLIC_WEB_ID,
      EXPO_PUBLIC_SECRET_KEY: process.env.EXPO_PUBLIC_SECRET_KEY,
      EXPO_PUBLIC_LOG: process.env.EXPO_PUBLIC_LOG || "true",
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,

      // ✅ Stripe keys
      PRICE_ID: process.env.PRICE_ID,
      PRICE_ID_TEST: process.env.PRICE_ID_TEST,
      PUBLISH_KEY: process.env.PUBLISH_KEY,
      PUBLISH_KEY_TEST: process.env.PUBLISH_KEY_TEST,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_SECRET_KEY_TEST: process.env.STRIPE_SECRET_KEY_TEST,

      EXPO_PUBLIC_BASE_URL_DEV: process.env.EXPO_PUBLIC_BASE_URL_DEV,
      EXPO_PUBLIC_BASE_URL_PROD: process.env.EXPO_PUBLIC_BASE_URL_PROD,
    },
  };
};