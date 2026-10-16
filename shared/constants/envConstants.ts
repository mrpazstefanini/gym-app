// shared/constants/envConstants.ts
import Constants from 'expo-constants';


export const appVersion = Constants.expoConfig?.version || '0.0.0';

// ─── Helper ───────────────────────────────────────────────────────────────────
const getExtra = (key: string): string  => {
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

// ─── BASE URL ─────────────────────────────────────────────────────────────────
// app.config.js already resolves DEV vs PROD and exposes as BASE_URL
export const BASE_URL = getExtra('BASE_URL');

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
export const SECRET_KEY = getExtra('EXPO_PUBLIC_SECRET_KEY');
export const IS_TEST_CARD_MODE = getExtra('IS_TEST_CARD_MODE') === 'true';

// ─── Debug (only in __DEV__) ──────────────────────────────────────────────────
if (__DEV__) {
  console.log('🔧 [envConstants] ──────────────────────────');
  console.log(`🔧 NODE_ENV : ${NODE_ENV}`);
  console.log(`🔧 BASE_URL : ${BASE_URL}`);
  console.log(`🔧 LOG : ${LOG}`);
  console.log('🔧 ─────────────────────────────────────────');
}