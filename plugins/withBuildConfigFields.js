// plugins/withBuildConfigFields.js
const { withAppBuildGradle } = require("@expo/config-plugins");

/** * Injeta variáveis de ambiente como BuildConfig fields * Acessíveis via BuildConfig.NOME_DA_VAR no código nativo */
module.exports = function withBuildConfigFields(config) {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;

    const fields = [
      {
        type: "String",
        name: "STRIPE_PUBLISHABLE_KEY",
        value: process.env.PUBLISH_KEY || process.env.PUBLISH_KEY_TEST || "",
      },
      {
        type: "String",
        name: "STRIPE_PRICE_ID",
        value: process.env.PRICE_ID || process.env.PRICE_ID_TEST || "",
      },
      {
        type: "String",
        name: "GOOGLE_MAPS_API_KEY",
        value: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      },
      {
        type: "String",
        name: "BASE_URL",
        value:
          process.env.NODE_ENV === "production"
            ? process.env.EXPO_PUBLIC_BASE_URL_PROD || ""
            : process.env.EXPO_PUBLIC_BASE_URL_DEV || "",
      },
    ];

    // Monta o bloco de buildConfigFields
    const buildConfigBlock = fields
      .map(
        ({ type, name, value }) =>
          ` buildConfigField "${type}", "${name}", "\\"${value}\\""`
      )
      .join("\n");

    const marker = "// [withBuildConfigFields] AUTO-GENERATED - DO NOT EDIT";

    if (contents.includes(marker)) {
      // Substitui bloco existente
      contents = contents.replace(
        /\/\/ \[withBuildConfigFields\] AUTO-GENERATED - DO NOT EDIT[\s\S]*?\/\/ \[withBuildConfigFields\] END/,
        `${marker}\n${buildConfigBlock}\n // [withBuildConfigFields] END`
      );
    } else {
      // Insere dentro do defaultConfig
      contents = contents.replace(
        /(defaultConfig \{[^\}]*versionName[^\n]*\n)/,
        `$1\n ${marker}\n${buildConfigBlock}\n // [withBuildConfigFields] END\n`
      );
    }

    mod.modResults.contents = contents;
    return mod;
  });
};