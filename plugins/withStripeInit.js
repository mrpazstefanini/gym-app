// plugins/withStripeInit.js
const {
  withMainApplication,
  withAppDelegate,
  createRunOncePlugin,
} = require("@expo/config-plugins");

// ─── ANDROID ───────────────────────────────────────────────
const withStripeAndroid = (config, { publishableKey }) => {
  return withMainApplication(config, (mod) => {
    let contents = mod.modResults.contents;

    if (!contents.includes("import com.stripe.android.PaymentConfiguration")) {
      contents = contents.replace(
        "import android.app.Application",
        "import android.app.Application\nimport com.stripe.android.PaymentConfiguration"
      );
    }

    if (!contents.includes("PaymentConfiguration.init")) {
      contents = contents.replace(
        "super.onCreate()",
        `super.onCreate()\n    PaymentConfiguration.init(applicationContext, "${publishableKey}")`
      );
    }

    mod.modResults.contents = contents;
    return mod;
  });
};

// ─── IOS ───────────────────────────────────────────────────
const withStripeIos = (config, { publishableKey }) => {
  return withAppDelegate(config, (mod) => {
    let contents = mod.modResults.contents;

    if (!contents.includes("import Stripe")) {
      contents = contents.replace(
        "import Expo",
        "import Expo\nimport Stripe"
      );
    }

    if (!contents.includes("StripeAPI.defaultPublishableKey")) {
      contents = contents.replace(
        "return super.application(application, didFinishLaunchingWithOptions: launchOptions)",
        `StripeAPI.defaultPublishableKey = "${publishableKey}"\n    return super.application(application, didFinishLaunchingWithOptions: launchOptions)`
      );
    }

    mod.modResults.contents = contents;
    return mod;
  });
};

// ─── PLUGIN PRINCIPAL ──────────────────────────────────────
const withStripeInit = (config, props) => {
  config = withStripeAndroid(config, props);
  config = withStripeIos(config, props);
  return config;
};

module.exports = createRunOncePlugin(withStripeInit, "withStripeInit", "1.0.0");