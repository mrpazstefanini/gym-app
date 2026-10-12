import { Realm } from "@realm/react";
import { schemas } from "./schemas";
import { log } from "@/shared/utils/log";

/**
 * Migração para a versão 1: Adiciona userLimit ao schema Academy
 */
const migrateToVersion1 = (oldRealm: Realm, newRealm: Realm) => {
  const oldAcademies = oldRealm.objects("Academy");
  const newAcademies = newRealm.objects("Academy");

  for (let i = 0; i < oldAcademies.length; i++) {
    newAcademies[i].userLimit = oldAcademies[i].userLimit || 100; // valor padrão
  }

  log("Migração para versão 1 concluída");
};

/**
 * Migração para a versão 2: Adiciona campos ao Exercise e ExerciseByUser
 */
const migrateToVersion2 = (oldRealm: Realm, newRealm: Realm) => {
  // Tratar Exercise - adicionar hasStopwatch e hasGps
  const oldExercises = oldRealm.objects("Exercise");
  const newExercises = newRealm.objects("Exercise");

  for (let i = 0; i < oldExercises.length; i++) {
    // Definir valores padrão para os novos campos
    newExercises[i].hasStopwatch = false;
    newExercises[i].hasGps = false;
  }

  // Tratar ExerciseByUser - converter repetitions para array e adicionar novos campos
  const oldExerciseByUsers = oldRealm.objects("ExerciseByUser");
  const newExerciseByUsers = newRealm.objects("ExerciseByUser");

  for (let i = 0; i < oldExerciseByUsers.length; i++) {
    // Converter repetitions para array se existir
    if (oldExerciseByUsers[i].hasOwnProperty("repetitions")) {
      const oldReps = oldExerciseByUsers[i].repetitions;
      // Se o valor antigo for um número, converta para um array com esse número
      if (typeof oldReps === "number") {
        newExerciseByUsers[i].repetitions = [oldReps];
      } else {
        // Se já for um array ou null, mantenha como está
        newExerciseByUsers[i].repetitions = oldReps || [];
      }
    } else {
      // Se não existir, inicialize como array vazio
      newExerciseByUsers[i].repetitions = [];
    }

    // Definir valores padrão para os novos campos
    newExerciseByUsers[i].sets = 0;
    newExerciseByUsers[i].exerciseOrientations = "";
  }

  log("Migração para versão 2 concluída");
};

/**
 * Migração para a versão 3: Adiciona restTimeBetweenSets ao ExerciseByUser
 */
const migrateToVersion3 = (oldRealm: Realm, newRealm: Realm) => {
  const oldExerciseByUsers = oldRealm.objects("ExerciseByUser");
  const newExerciseByUsers = newRealm.objects("ExerciseByUser");

  for (let i = 0; i < oldExerciseByUsers.length; i++) {
    // Adicionar o novo campo restTimeBetweenSets com um valor padrão
    newExerciseByUsers[i].restTimeBetweenSets = 60; // Valor padrão de 60 segundos
  }

  log("Migração para versão 3 concluída");
};

const migrateToVersion4 = (oldRealm: Realm, newRealm: Realm) => {
  const oldExerciseByUsers = oldRealm.objects("ExerciseByUser");
  const newExerciseByUsers = newRealm.objects("ExerciseByUser");

  for (let i = 0; i < oldExerciseByUsers.length; i++) {
    // Adicionar o novo campo restTimeBetweenSets com um valor padrão
    newExerciseByUsers[i].userNotes = ""; // Valor padrão vazio
    newExerciseByUsers[i].hasUserNotes = false; // Valor padrão falso
    newExerciseByUsers[i].completed = false; // Valor padrão falso
  }

  log("Migração para versão 4 concluída");
};

const migrateToVersion5 = (oldRealm: Realm, newRealm: Realm) => {
  const oldExercises = oldRealm.objects("Exercise");
  const newExercises = newRealm.objects("Exercise");

  for (let i = 0; i < oldExercises.length; i++) {
    // Adicionar o novo campo groupId como array de strings
    if (oldExercises[i].groupIds) {
      newExercises[i].groupId = [...(oldExercises[i].groupIds as string[])]; // Converter para array
    } else {
      newExercises[i].groupId = []; // Valor padrão como array vazio
    }
  }

  log("Migração para versão 5 concluída");
};

const migrateToVersion6 = (oldRealm: Realm, newRealm: Realm) => {
  const oldGpsMetricsTemp = oldRealm.objects("GpsMetricsTemp");
  const newGpsMetricsTemp = newRealm.objects("GpsMetricsTemp");

  for (let i = 0; i < oldGpsMetricsTemp.length; i++) {
    newGpsMetricsTemp[i].timestamp =
      oldGpsMetricsTemp[i].timestamp || Date.now(); // Valor padrão como timestamp atual
  }

  log("Migração para versão 6 concluída");
};

const migrateToVersion7 = (oldRealm: Realm, newRealm: Realm) => {
  // Como LocationObjectCoords é embedded, não precisa migração explícita
  // Mas se GpsMetricsTemp já existir com dados antigos, precisamos ajustar:

  const oldGpsMetrics = oldRealm.objects("GpsMetricsTemp");
  const newGpsMetrics = newRealm.objects("GpsMetricsTemp");

  for (let i = 0; i < oldGpsMetrics.length; i++) {
    const oldMetric = oldGpsMetrics[i];
    const newMetric = newGpsMetrics[i];

    // Se os campos de localização não existiam antes, inicialize:

    if (!newMetric.startLocation && oldMetric.startLocation && typeof oldMetric.startLocation === 'object') {
      const s = oldMetric.startLocation as Record<string, any>;
      newMetric.startLocation = {
        latitude: s.latitude ?? 0,
        longitude: s.longitude ?? 0,
        altitude: s.altitude ?? null,
        accuracy: s.accuracy ?? null,
        altitudeAccuracy: s.altitudeAccuracy ?? null,
        heading: s.heading ?? null,
        speed: s.speed ?? null,
      };
    }

    if (!newMetric.endLocation && oldMetric.endLocation && typeof oldMetric.endLocation === 'object') {
      const e = oldMetric.endLocation as Record<string, any>;
      newMetric.endLocation = {
        latitude: e.latitude ?? 0,
        longitude: e.longitude ?? 0,
        altitude: e.altitude ?? null,
        accuracy: e.accuracy ?? null,
        altitudeAccuracy: e.altitudeAccuracy ?? null,
        heading: e.heading ?? null,
        speed: e.speed ?? null,
      };
    }

    // Se routePoints não existia, inicialize como vazio
    if (!Array.isArray(newMetric.routePoints) || newMetric.routePoints.length === 0) {
      // Realm já cria a lista vazia automaticamente para arrays
    }
  }

  log("Migração para versão 7 concluída");
};

const migrateToVersion8 = (oldRealm: Realm, newRealm: Realm) => {
  // Migração para adicionar o campo isFree no UserLocal
  const oldUsers = oldRealm.objects("User");
  const newUsers = newRealm.objects("User");

  for (let i = 0; i < oldUsers.length; i++) {
    const oldUser = oldUsers[i];
    const newUser = newUsers[i];

    if (newUser.isFree === undefined) {
      newUser.isFree = oldUser.isFree ?? false; 
    }
  }

  log("Migração para versão 8 concluída");
};

/**
 * Função principal de migração que executa as migrações necessárias
 * com base na versão do schema
 */
export const migrationFunction = (oldRealm: Realm, newRealm: Realm) => {
  const oldVersion = oldRealm.schemaVersion;
  log(
    `Migrando do schema versão ${oldVersion} para a versão ${newRealm.schemaVersion}`,
  );

  // Executar migrações em ordem sequencial, apenas se necessário
  if (oldVersion < 1) {
    migrateToVersion1(oldRealm, newRealm);
  }

  if (oldVersion < 2) {
    migrateToVersion2(oldRealm, newRealm);
  }

  if (oldVersion < 3) {
    migrateToVersion3(oldRealm, newRealm);
  }

  if (oldVersion < 4) {
    migrateToVersion4(oldRealm, newRealm);
  }

  if (oldVersion < 5) {
    migrateToVersion5(oldRealm, newRealm);
  }

  if (oldVersion < 6) {
    migrateToVersion6(oldRealm, newRealm);
  }

  if (oldVersion < 7) {
    migrateToVersion7(oldRealm, newRealm);
  }

  if (oldVersion < 8) {
    migrateToVersion8(oldRealm, newRealm);
  }
};

export const latestVersion = 6;

// Configuração do Realm com a versão atualizada
export const realmConfig = {
  schema: [...schemas],
  schemaVersion: latestVersion, // Versão atual do schema
  migration: migrationFunction,
};
