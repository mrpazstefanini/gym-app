// plugins/withMainApplicationClean.js
const { withMainApplication } = require("@expo/config-plugins");

/** * Garante que o MainApplication.kt base esteja limpo * (sem PaymentConfiguration hardcoded) */
module.exports = function withMainApplicationClean(config) {
  return withMainApplication(config, (mod) => {
    let contents = mod.modResults.contents;

    // Remove inicialização hardcoded antiga se existir
    contents = contents.replace(
      /\s*PaymentConfiguration\.init\(applicationContext,\s*"pk_test_SUA_CHAVE_AQUI"\)\n?/g,
      "\n"
    );

    mod.modResults.contents = contents;
    return mod;
  });
};