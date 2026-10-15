// src/contexts/AppInitContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, setDatabaseService, waitForDatabase } from "@/redux";
import { initializeLanguage } from "@/redux/slices/languageSlice";
import { useAuthContext } from "@/contexts/authContext";
import { log } from "@/shared/utils/log";
import { useApi } from "@/hooks/useApi";
import { fetchExercise } from "@/redux/actions/exerciseActions";
import { fetchTraining } from "@/redux/actions/trainingActions";
import { fetchUser } from "@/redux/actions/userActions";
import * as SplashScreen from "expo-splash-screen";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import useCustomStyle from "@/hooks/useCustomStyle";
import { StatusBar } from "expo-status-bar";
import { fetchExerciseHistory } from "@/redux/actions/exerciseHistoryActions";
import { fetchTrainingByUser } from "@/redux/actions/trainingByUsersActions";
import { fetchGroups } from "@/redux/actions/groupActions";
import { fetchGpsMetricsTemp } from "@/redux/actions/gpsMetricsTempLocalActions";
import { useRealm } from "@realm/react";
import { AcademyLocalService } from "@/database/services/AcademyLocalService";
import { ExerciseHistoryLocalService } from "@/database/services/ExerciseHistoryLocalService";
import { ExerciseLocalService } from "@/database/services/ExerciseLocalService";
import { GpsMetricsTempLocalService } from "@/database/services/GpsMetricsTempLocalService";
import { GroupLocalService } from "@/database/services/GroupLocalService";
import { TrainingByUserLocalService } from "@/database/services/TrainingByUserService";
import { TrainingLocalService } from "@/database/services/TrainingLocalService";
import { UserLocalService } from "@/database/services/UserLocalService";
import { fetchSubscription } from "@/redux/actions/subscriptionActions";
import { setInitialLoadingFinished, setReady } from "@/redux/slices/authSlice";

type InitializeUserProps = {
  willFetchUser?: boolean;
  willFetchExercises?: boolean;
  willFetchTrainingByUser?: boolean;
  willFetchTrainings?: boolean;
  willFetchExerciseHistory?: boolean;
  willFetchGroups?: boolean;
  willFetchGpsValues?: boolean;
  // willFetchSubscription?: boolean;
};

interface AppInitContextType {
  isInitialized: boolean;
  initStatus: string;
  initProgress: number;
  error: Error | null;
  initializeUserData: (props: InitializeUserProps) => Promise<void>;
}

export const AppInitContext = createContext<AppInitContextType>({
  isInitialized: false,
  initStatus: "Preparando aplicação...",
  initProgress: 0,
  error: null,
  initializeUserData: async (props: InitializeUserProps) => Promise.resolve(),
});

export const useAppInit = () => useContext(AppInitContext);

interface AppInitProviderProps {
  children: ReactNode;
}

export const AppInitProvider: React.FC<AppInitProviderProps> = ({
  children,
}) => {
  const showInitStatus = true; // Alterar para false para esconder status de inicialização

  const dispatch = useDispatch<AppDispatch>();
  const { call } = useApi();
  const { colors } = useCustomStyle();
  const realm = useRealm();
  const { addCredentialIfItsLoggedIn } = useAuthContext();

  const [isInitialized, setIsInitialized] = useState(false);
  const [initStatus, setInitStatus] = useState<string>("");
  const [initProgress, setInitProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Obter serviços de banco de dados
  // const db = useLocalDatabase();

  const db = useMemo(() => {
    if (!realm) return null;

    return {
      academyLocalService: new AcademyLocalService(() => realm),
      exerciseLocalService: new ExerciseLocalService(()=>realm),
      userLocalService: new UserLocalService(()=>realm),
      trainingLocalService: new TrainingLocalService(()=>realm),
      exerciseHistoryLocalService: new ExerciseHistoryLocalService(()=>realm),
      trainingByUserLocalService: new TrainingByUserLocalService(()=>realm),
      groupLocalService: new GroupLocalService(()=>realm),
      gpsMetricsTempLocalService: new GpsMetricsTempLocalService(()=>realm),
    };
  }, [realm]);

  const initializeDb = useCallback(async () => {
    if (db) {
      // setInitStatus("Inicializando banco de dados...");
      setInitProgress(10);
      log("[INIT]-Inicializando serviço de banco de dados");

      await setDatabaseService(db);
      setInitProgress(20);

      log("[INIT]-Serviço de banco de dados inicializado com sucesso", db);
    } else {
      log("[INIT]-Erro: serviços de banco de dados não disponíveis");
      throw new Error("Serviços de banco de dados não disponíveis");
    }
  }, []);

  const initializeAppLanguage = useCallback(async () => {
    log("[INIT]-Inicializando configurações de idioma...");
    // setInitStatus("Carregando configurações de idioma...");
    setInitProgress(30);
    await dispatch(initializeLanguage());

    setInitProgress(40);
  }, []);

  const executeDispatchListWithProgressbar = useCallback(
    async (
      dispatchCalls: Array<{
        conditional: boolean;
        dispatch: () => Promise<void>;
      }>,
      progressStart: number,
      progressEnd: number,
    ) => {
      const totalCalls = dispatchCalls.length;
      for (let i = 0; i < totalCalls; i++) {
        if (dispatchCalls[i].conditional) {
          await dispatchCalls[i].dispatch();
        }
        const progress =
          progressStart +
          ((i + 1) / totalCalls) * (progressEnd - progressStart);
        setInitProgress(Math.round(progress));
      }
    },
    [],
  );

  const initializeUserData = useCallback(
    async ({
      willFetchUser = true,
      willFetchExercises = true,
      willFetchTrainingByUser = true,
      willFetchTrainings = true,
      willFetchExerciseHistory = true,
      willFetchGroups = true,
      willFetchGpsValues = true,
      // willFetchSubscription = true,
    }: InitializeUserProps) => {
      // Verificar se o banco de dados está realmente pronto
      setInitStatus("Verificando banco de dados...");
      const dataBaseFromRedux = await waitForDatabase();
      const dataBase = dataBaseFromRedux ?? db;

      setInitProgress(40);

      if (dataBase) {
        // Carregar dados do usuário
        setInitStatus("Carregando dados do usuário...");
        await call({
          try: async () => {
            const dispatchCalls = [
              {
                conditional: willFetchUser,
                dispatch: async () => {
                  setInitStatus("Carregando perfil do usuário...");
                  const res = await dispatch(fetchUser({ dataBase }));
                  // if (res?.error?.message === "Rejected") {
                  //   throw new Error("Session expired");
                  // }
                  log("[INIT]-Dados do usuário carregados:", res);
                },
              },
              {
                conditional: willFetchTrainingByUser,
                dispatch: async () => {
                  setInitStatus("Carregando treino do usuário...");
                  await dispatch(fetchTrainingByUser({ dataBase }));
                },
              },
              {
                conditional: willFetchExercises,
                dispatch: async () => {
                  setInitStatus("Carregando exercícios disponíveis...");
                  await dispatch(fetchExercise({ dataBase }));
                },
              },
              {
                conditional: willFetchTrainings,
                dispatch: async () => {
                  setInitStatus("Carregando blocos de exercícios...");
                  await dispatch(fetchTraining({ dataBase }));
                },
              },
              {
                conditional: willFetchExerciseHistory,
                dispatch: async () => {
                  setInitStatus("Carregando histórico de exercícios...");
                  await dispatch(fetchExerciseHistory({ dataBase }));
                },
              },
              {
                conditional: willFetchGroups,
                dispatch: async () => {
                  setInitStatus("Carregando último grupos feito...");
                  log("[INIT]-Carregando último grupos feito...");
                  await dispatch(fetchGroups({ dataBase }));
                },
              },
              {
                conditional: willFetchGpsValues,
                dispatch: async () => {
                  setInitStatus("Carregando valores de GPS...");
                  log("[INIT]-Carregando valores de GPS...");
                  await dispatch(fetchGpsMetricsTemp({ dataBase }));
                },
              },
              // {
              //   conditional: willFetchSubscription,
              //   dispatch: async () => {
              //     setInitStatus("Carregando assinaturas...");
              //     log("[INIT]-Carregando assinaturas...");
              //     await dispatch(fetchSubscription());
              //   },
              // },
            ];

            await executeDispatchListWithProgressbar(dispatchCalls, 40, 90);
          },
          catch: (error) => {
            log("[INIT]-Erro ao carregar dados do usuário:", error);
          },
        });
      }
    },
    [],
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        log("[INIT]-Iniciando processo de inicialização do app...");

        // Inicializar banco de dados
        await initializeDb();

        // Inicializar idioma
        await initializeAppLanguage();

        // Inicializar dados do usuário
        await initializeUserData({});

        // Carregar usuário do banco de dados e definir credenciais
        const user = db?.userLocalService.getUser();
        if (user) {
          await addCredentialIfItsLoggedIn(user);
          dispatch(setInitialLoadingFinished(true));
        } else {
          // ✅ Sem usuário → marca como pronto para redirecionar ao login
          dispatch(setReady(true));
        }

        log("[INIT]-Todas as inicializações concluídas com sucesso");
        setInitStatus("Inicialização concluída!");
        setInitProgress(100);

        // Esconder a splash screen após a inicialização
        setTimeout(async () => {
          setIsInitialized(true);
          await SplashScreen.hideAsync();
        }, 300); // Pequeno delay para garantir que tudo esteja pronto
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Erro desconhecido durante a inicialização");
        console.error("Erro durante a inicialização:", error);
        setError(error);
        setInitStatus("Erro na inicialização, continuando mesmo assim...");

        // Mesmo com erro, precisamos continuar
        setTimeout(async () => {
          setIsInitialized(true);
          await SplashScreen.hideAsync();
        }, 300);
      }
    };

    initialize();
  }, []);

  const contextValue: AppInitContextType = {
    isInitialized,
    initStatus,
    initProgress,
    error,
    initializeUserData,
  };

  const customStyles = useMemo(
    () => ({
      container: {
        backgroundColor: colors.background,
      },
      statusText: {
        color: colors.text,
      },
      progressBarContainer: {
        backgroundColor: colors.background,
      },
      progressBar: {
        backgroundColor: colors.tint,
      },
      progressText: { color: colors.gray300 },
    }),
    [],
  );

  // Mostrar tela de carregamento enquanto inicializa
  if (!isInitialized) {
    return (
      <>
        <StatusBar backgroundColor={colors.background} />
        <View style={[styles.container, customStyles.container]}>
          <ActivityIndicator size="large" color={colors.tint} />
          {showInitStatus && (
            <Text style={[styles.statusText, customStyles.statusText]}>
              {initStatus}
            </Text>
          )}
          <View
            style={[
              styles.progressBarContainer,
              customStyles.progressBarContainer,
            ]}
          >
            <View
              style={[
                styles.progressBar,
                customStyles.progressBar,
                { width: `${initProgress}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, customStyles.statusText]}>
            {initProgress}%
          </Text>
        </View>
      </>
    );
  }

  return (
    <AppInitContext.Provider value={contextValue}>
      {children}
    </AppInitContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 8,
    width: "80%",
    // borderWidth: 1,
    borderRadius: 4,
    marginTop: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
  },
});
