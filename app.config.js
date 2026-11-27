const packageJson = require("./package.json");
const path = require("path");
const fs = require("fs");

// ─── Environment ──────────────────────────────────────────────────────────────
const ENV = process.env.NODE_ENV || "development";
const isDev = ENV !== "production";
const skipDotenv =
  process.env.EXPO_NO_DOTENV === "1" ||
  process.env.EXPO_NO_DOTENV === "true";

// Defina USE_LOCAL_ENV_FILE=1 para permitir o fallback local mesmo que
// EXPO_NO_DOTENV esteja ativo. Útil no prebuild local; no EAS, deixe desativado.
const useLocalEnvFile =
  !skipDotenv || process.env.USE_LOCAL_ENV_FILE === "1";

console.log(`\n[app.config] ENV: ${ENV}`);
console.log(`[app.config] isDev: ${isDev}`);
console.log(`[app.config] skipDotenv: ${skipDotenv}`);
console.log(`[app.config] useLocalEnvFile: ${useLocalEnvFile}`);

if (useLocalEnvFile) {
  const dotenv = require("dotenv");
  const envFile = isDev ? ".env.development" : ".env.production";
  const envPath = path.resolve(__dirname, envFile);

  if (!fs.existsSync(envPath)) {
    if (!isDev) {
      throw new Error(`[app.config] Arquivo obrigatório não encontrado: ${envFile}`);
    }

    console.warn(`[app.config] Arquivo não encontrado: ${envFile}`);
  } else {
    const fileVars = dotenv.parse(fs.readFileSync(envPath));
    const loadedVars = [];

    // Só usa o arquivo para variáveis ausentes ou vazias.
    // Valores já fornecidos pelo ambiente do EAS/processo são preservados.
    for (const [key, value] of Object.entries(fileVars)) {
      if (!process.env[key]?.trim()) {
        process.env[key] = value;
        loadedVars.push(key);
      }
    }

    console.log(`[app.config] Loaded fallback: ${envFile}`);
    console.log(`[app.config] Variables filled from file: ${loadedVars.length}`);
  }
} else {
  console.log("[app.config] Usando variáveis fornecidas pelo ambiente do EAS.");
}

// Validação das variáveis essenciais para o build Android de produção.
if (!isDev) {
  const requiredVars = [
    "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY",
    "EXPO_PUBLIC_FIREBASE_API_KEY",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    "EXPO_PUBLIC_WEB_ID",
    "EXPO_PUBLIC_ANDROID_ID",
    "EXPO_PUBLIC_BASE_URL_PROD",
    "PUBLISH_KEY",
  ];

  const missingVars = requiredVars.filter(
    (key) => !process.env[key]?.trim(),
  );

  if (missingVars.length > 0) {
    throw new Error(
      `[app.config] Variáveis de produção ausentes ou vazias: ${missingVars.join(", ")}`,
    );
  }

  console.log("[app.config] Variáveis obrigatórias de produção presentes.");
  console.log(
    `[app.config] Google Maps API key: ${ process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ? "presente" : "ausente" }`,
  );
  console.log(
    `[app.config] PUBLISH_KEY: ${ process.env.PUBLISH_KEY ? "presente" : "ausente" }`,
  );
}

console.log(
  `[app.config] BASE_URL: ${ isDev ? process.env.EXPO_PUBLIC_BASE_URL_DEV || "ausente" : process.env.EXPO_PUBLIC_BASE_URL_PROD || "ausente" }`,
);

module.exports = ({ config }) => {
  const stripeInitialKey = process.env.PUBLISH_KEY;

  return {
    ...config,
    name: isDev ? "gym-app (dev)" : "gym-app",
    slug: "gym-app",
    version: packageJson.version,
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
      ["./plugins/withStripeInit", { publishableKey: stripeInitialKey }],
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
      EXPO_PUBLIC_FIREBASE_API_KEY:
        process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID:
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FIREBASE_APP_ID:
        process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID:
        process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      EXPO_PUBLIC_IOS_ID: process.env.EXPO_PUBLIC_IOS_ID,
      EXPO_PUBLIC_ANDROID_ID: process.env.EXPO_PUBLIC_ANDROID_ID,
      EXPO_PUBLIC_WEB_ID: process.env.EXPO_PUBLIC_WEB_ID,
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
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