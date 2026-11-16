// plugins/withGoogleServices.js
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withGoogleServices(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const isDev = process.env.NODE_ENV !== 'production';

      // ─── Source from config/ (SAFE from prebuild) ─────────
      const sourceFile = isDev
        ? 'google-services.dev.json'
        : 'google-services.prod.json';

      const sourcePath = path.resolve(
        __dirname,
        `../config/${sourceFile}`  // ✅ reads from config/
      );

      // ─── Destination inside android/ (recreated by prebuild)
      const destPath = path.resolve(
        __dirname,
        '../android/app/google-services.json'  // ✅ copied here
      );

      console.log(`\n[withGoogleServices] ─────────────────────────`);
      console.log(`[withGoogleServices] ENV : ${isDev ? '🧪 DEV' : '🔴 PROD'}`);
      console.log(`[withGoogleServices] From : config/${sourceFile}`);
      console.log(`[withGoogleServices] To : android/app/google-services.json`);
      console.log(`[withGoogleServices] ─────────────────────────\n`);

      // ─── Copy correct file ────────────────────────────────
      fs.copyFileSync(sourcePath, destPath);

      return config;
    },
  ]);
};