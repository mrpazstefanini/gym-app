// shared/constants/envConstants.ts
import Constants from 'expo-constants';

export const appVersion = Constants.expoConfig?.version || '0.0.0';

// ─── Helper ───────────────────────────────────────────────────────────────────
const getExtra = (key: string): string => {
  const fromExpoConfig = (
    Constants.expoConfig?.extra as Record<string, string> | undefined
  )?.[key];

  const fromManifest = (
    Constants.manifest as { extra?: Record<string, string> } | null
  )?.extra?.[key];

  return fromExpoConfig ?? fromManifest ?? 'NOT_FOUND';
};

// ─── Environment ──────────────────────────────────────────────────────────────
export const NODE_ENV = getExtra('NODE_ENV') ?? 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';

// ─── BASE URL ─────────────────────────────────────────────────────────────────
export const BASE_URL = getExtra('BASE_URL');

// ─── Firebase ─────────────────────────────────────────────────────────────────
export const GOOGLE_APPLICATION_CREDENTIALS = getExtra('GOOGLE_APPLICATION_CREDENTIALS');
export const FIREBASE_PROJECT_ID = getExtra('FIREBASE_PROJECT_ID');


// ─── Firebase Config ─────────────────────────────────────────────────────────
export const FIREBASE_API_KEY = getExtra('EXPO_PUBLIC_FIREBASE_API_KEY');
export const FIREBASE_PROJECT_ID_CONFIG = getExtra("EXPO_PUBLIC_FIREBASE_PROJECT_ID");
export const FIREBASE_AUTH_DOMAIN = getExtra('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
export const FIREBASE_STORAGE_BUCKET = getExtra('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
export const FIREBASE_MESSAGING_SENDER_ID = getExtra('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
export const FIREBASE_APP_ID = getExtra('EXPO_PUBLIC_FIREBASE_APP_ID');
export const FIREBASE_MEASUREMENT_ID = getExtra('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID');


// ─── Google ───────────────────────────────────────────────────────────────────
export const IOS_ID = getExtra('EXPO_PUBLIC_IOS_ID');
export const ANDROID_ID = getExtra('EXPO_PUBLIC_ANDROID_ID');
export const WEB_ID = getExtra('EXPO_PUBLIC_WEB_ID');
export const GOOGLE_MAPS_API_KEY = getExtra('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY');

// ─── Logging ──────────────────────────────────────────────────────────────────
export const LOG = getExtra('EXPO_PUBLIC_LOG') === 'true';

// ─── Stripe ───────────────────────────────────────────────────────────────────
export const PUBLISH_KEY = getExtra('PUBLISH_KEY');
export const PRICE_ID = getExtra('PRICE_ID');
export const IS_TEST_CARD_MODE = getExtra('IS_TEST_CARD_MODE') === 'true';


// ─── Debug (only in __DEV__) ──────────────────────────────────────────────────
if (__DEV__) {
  console.log('🔧 [envConstants] ──────────────────────────');
  console.log(`🔧 NODE_ENV : ${NODE_ENV}`);
  console.log(`🔧 IS_PRODUCTION : ${IS_PRODUCTION}`);
  console.log(`🔧 BASE_URL : ${BASE_URL}`);
  console.log(`🔧 FIREBASE_PROJECT: ${FIREBASE_PROJECT_ID}`);
  console.log(`🔧 STORAGE_BUCKET : ${FIREBASE_STORAGE_BUCKET}`);
  console.log(`🔧 LOG : ${LOG}`);
  console.log(`🔧 PUBLISH_KEY : ${PUBLISH_KEY}`);
  console.log(`🔧 PRICE_ID : ${PRICE_ID}`);
  console.log(`🔧 IS_TEST_CARD_MODE : ${IS_TEST_CARD_MODE}`);
  console.log('🔧 ─────────────────────────────────────────');
}