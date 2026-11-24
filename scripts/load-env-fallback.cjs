const fs = require("fs");
const dotenv = require("dotenv");

module.exports = function loadEnvFallback(envPath) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`[env] Arquivo não encontrado: ${envPath}`);
  }

  const fileVars = dotenv.parse(fs.readFileSync(envPath));
  const loaded = [];

  for (const [key, value] of Object.entries(fileVars)) {
    // Mantém variáveis já fornecidas pelo processo/EAS.
    // Usa o arquivo local somente se a variável estiver ausente ou vazia.
    if (!process.env[key]?.trim()) {
      process.env[key] = value;
      loaded.push(key);
    }
  }

  console.log(`[env] Arquivo carregado como fallback: ${envPath}`);
  console.log(`[env] Variáveis preenchidas pelo arquivo: ${loaded.length}`);
};