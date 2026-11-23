// plugins/withGoogleServices.js
const { withAppBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withGoogleServices(config) {
  return withDangerousMod(config, [
    'android',
    (mod) => {
      const isProduction = process.env.NODE_ENV === 'production';
      
      const sourceFile = isProduction
        ? 'config/google-services.prod.json'
        : 'config/google-services.dev.json';

      const destFile = path.join(
        mod.modRequest.platformProjectRoot,
        'app',
        'google-services.json'
      );

      console.log(`[withGoogleServices] ─────────────────────────`);
      console.log(`[withGoogleServices] ENV : ${isProduction ? '🔴 PROD' : '🧪 DEV'}`);
      console.log(`[withGoogleServices] From: ${sourceFile}`);
      console.log(`[withGoogleServices] To : android/app/google-services.json`);
      console.log(`[withGoogleServices] ─────────────────────────`);

      const sourcePath = path.join(mod.modRequest.projectRoot, sourceFile);

      if (!fs.existsSync(sourcePath)) {
        throw new Error(`[withGoogleServices] File not found: ${sourcePath}`);
      }

      fs.copyFileSync(sourcePath, destFile);
      return mod;
    },
  ]);
};