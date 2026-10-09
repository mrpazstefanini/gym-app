// plugins/withStripeInit.js
const { withMainApplication } = require("@expo/config-plugins");

/**
 * Plugin Stripe para Expo.
 *
 * NÃO injeta PaymentConfiguration no MainApplication.kt.
 * A inicialização do Stripe é feita 100% no JS:
 *   - initStripe()     → _layout.tsx
 *   - StripeProvider   → _layout.tsx
 *   - initStripe()     → CheckoutScreen (troca dinâmica teste/real)
 *
 * Este plugin apenas LIMPA qualquer resíduo de inicialização nativa
 * que possa ter sido injetado por versões anteriores.
 */
module.exports = function withStripeInit(config, { publishableKey } = {}) {
  const mode = publishableKey?.startsWith("pk_live")
    ? "🔴 PRODUÇÃO"
    : "🧪 TESTE";

  console.log(
    publishableKey
      ? `[withStripeInit] ✅ Stripe (${mode}): ${publishableKey.substring(0, 20)}... — inicialização via JS`
      : `[withStripeInit] ⚠️  publishableKey não fornecida — verifique o .env`
  );

  return withMainApplication(config, (mod) => {
    let contents = mod.modResults.contents;

    // ── Remove import do Stripe (se existir de versão anterior) ──────────
    contents = contents.replace(
      /^import com\.stripe\.android\.PaymentConfiguration\n?/gm,
      ""
    );

    // ── Remove bloco comentado do plugin anterior ─────────────────────────
    contents = contents.replace(
      /\n\s*\/\/ \[Stripe\] Inicializado pelo withStripeInit plugin\n/g,
      "\n"
    );

    // ── Remove qualquer PaymentConfiguration.init() residual ──────────────
    contents = contents.replace(
      /\n?\s*PaymentConfiguration\.init\([^)]+\)\n?/g,
      "\n"
    );

    // ── Remove linhas em branco duplas geradas pela limpeza ───────────────
    contents = contents.replace(/\n{3,}/g, "\n\n");

    mod.modResults.contents = contents;
    return mod;
  });
};