// src/redux/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { LocalDatabaseServices } from "@/database/types/LocalDatabaseServices";
import { log } from "@/shared/utils/log";
import { initializationMiddleware } from "./midleware/initializationMiddleware";

import exampleReducer, { ExampleState } from "@/redux/slices/exampleSlice";
import userReducer, { UserState } from "@/redux/slices/userSlice";
import languageReducer, { LanguageState } from "./slices/languageSlice";
import authReducer, { AuthState } from "@/redux/slices/authSlice";
import exerciseReducer, { ExerciseState } from "./slices/exerciseSlice";
import trainingReducer, { TrainingState } from "./slices/trainingSlice";
import exerciseHistoryReducer, {
  ExerciseHistoryState,
} from "./slices/exerciseHistorySlice";
import trainingByUserReducer, {
  TrainingByUserState,
} from "./slices/trainingByUserSlice";
import groupReducer, { GroupState } from "./slices/groupSlice";
import gpsMetricsTempLocalReducer, {
  GpsMetricsTempLocalState,
} from "./slices/gpsMetricsTempLocalSlice";
import subscriptionReducer, {
  SubscriptionState,
} from "./slices/subscriptionSlice";

let databaseService: LocalDatabaseServices | null = null;
let databaseInitialized = false;
let databaseInitPromise: Promise<void> | null = null;

type ReducerType = {
  language: LanguageState;
  example: ExampleState;
  exercise: ExerciseState;
  training: TrainingState;
  user: UserState;
  auth: AuthState;
  exerciseHistory: ExerciseHistoryState;
  trainingByUser: TrainingByUserState;
  group: GroupState;
  gpsMetricsTemp: GpsMetricsTempLocalState;
  subscription: SubscriptionState;
};

const rootReducer: ReducerType = {
  language: languageReducer,
  example: exampleReducer,
  exercise: exerciseReducer,
  training: trainingReducer,
  user: userReducer,
  auth: authReducer,
  exerciseHistory: exerciseHistoryReducer,
  trainingByUser: trainingByUserReducer,
  group: groupReducer,
  gpsMetricsTemp: gpsMetricsTempLocalReducer,
  subscription: subscriptionReducer,
};

export const setDatabaseService = (service: LocalDatabaseServices) => {
  if (!databaseInitPromise) {
    databaseInitPromise = new Promise<void>((resolve) => {
      log("Configurando serviço de banco de dados no Redux");
      databaseService = service;
      databaseInitialized = true;
      log("Serviço de banco de dados configurado com sucesso");
      resolve();
    });
  }
  return databaseInitPromise;
};

export const getDatabaseService = () => databaseService;

export const isDatabaseReady = () => databaseInitialized;

export const waitForDatabase = () => {
  if (databaseInitialized) return Promise.resolve(databaseService);
  return (
    databaseInitPromise?.then(() => databaseService) ||
    Promise.reject("Database initialization not started")
  );
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {
          getDatabaseService,
          databaseService: null, // Mantemos isso para compatibilidade
        },
      },
      serializableCheck: false,
    }).concat(initializationMiddleware),
});

// Infer types
export type RootReduxState = typeof rootReducer;
export type AppDispatch = typeof store.dispatch;
