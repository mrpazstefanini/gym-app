import { useState, useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus, Dimensions, Alert } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { LocationObjectCoords, LocationSubscription } from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { calculateDistance } from "@/shared/utils/calculateDistance";
import { formatTime } from "@/shared/utils/formatTime";
import { log } from "@/shared/utils/log";
import { useTranslation } from "@/hooks/useTranslation";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import { DEFAULT_TIME } from "@/shared/constants/general";
import useStyles from "./useStyles";
import { LOCATION_TRACKING } from "./locationTask";
import {
  fetchGpsMetricsTemp,
  updateGpsMetricsTemp,
} from "@/redux/actions/gpsMetricsTempLocalActions";
import { IExercise } from "@/shared/models/IExercise";
import { StoragesEnum } from "@/shared/enum/StoragesEnum";
import { GOOGLE_MAPS_API_KEY } from "@/shared/constants/envConstants";

export const { width, height } = Dimensions.get("window");

export const WAZE_MAP_STYLE = [
  {
    featureType: "building",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

const MOVEMENT_CONFIG = {
  // Foreground - MUITO mais permissivo
  FG_MIN_DISTANCE_M: 0.1,
  FG_MIN_TIME_S: 0.3,
  FG_FORCE_UPDATE_S: 1.0,

  // Background
  BG_MIN_DISTANCE_M: 0.3,
  BG_MIN_TIME_S: 0.5,
  BG_FORCE_UPDATE_S: 1.5,

  // Filtros
  MAX_ACCURACY_M: 50,
  MIN_SPEED_KMPH: 0.3,
};
// ─── Tipos ───────────────────────────────────────────────────────────────────

interface LocationCoordsWithTimestamp extends LocationObjectCoords {
  timestamp?: number;
}

interface RunningData {
  coordinates: LocationCoordsWithTimestamp[];
  distance: number;
  startTime: number;
  lastUpdate: number;
  isRunning: boolean;
  elapsedTime: number;
}

// ─── Hook Principal ───────────────────────────────────────────────────────────

export default function useRunning(exercise?: IExercise) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { colors, customStyle } = useStyles();

  // ── Estado ──────────────────────────────────────────────────────────────────
  const [location, setLocation] = useState<LocationObjectCoords | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<
    LocationCoordsWithTimestamp[]
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState(DEFAULT_TIME);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [heading, setHeading] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [roadWidth, setRoadWidth] = useState(6);
  const [initialLocation, setInitialLocation] =
    useState<LocationCoordsWithTimestamp | null>(null);
  const [finalLocation, setFinalLocation] =
    useState<LocationCoordsWithTimestamp | null>(null);

  // Busca / Direções
  const [searchQuery, setSearchQuery] = useState("");
  const [destination, setDestination] = useState<any>(null);
  const [directions, setDirections] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  const [progressOnRoute, setProgressOnRoute] = useState(0);
  const [completedSegments, setCompletedSegments] = useState<any[]>([]);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const mapRef = useRef<MapView | null>(null);
  const isRunningRef = useRef(false);
  const locationSubscription = useRef<LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastGoodHeading = useRef(0);
  // const speedReadings = useRef<number[]>([]);
  const paceAverageRef = useRef<string[]>([]);
  const speedAverageRef = useRef<number[]>([]);

  // Refs espelho do estado (para uso em callbacks sem re-render)
  const distanceRef = useRef(0);
  const elapsedTimeRef = useRef(0);
  const routeCoordinatesRef = useRef<LocationCoordsWithTimestamp[]>([]);
  const directionsRef = useRef<any[]>([]);

  // AppState
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastBgSyncRef = useRef<number>(0);

  // ── Sync refs com estado ────────────────────────────────────────────────────

  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  useEffect(() => {
    routeCoordinatesRef.current = routeCoordinates;
  }, [routeCoordinates]);

  useEffect(() => {
    directionsRef.current = directions;
  }, [directions]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // ── Utilitários ─────────────────────────────────────────────────────────────

  const isValidMovement = (
    distanceKm: number,
    timeDeltaS: number,
    speedKmh: number,
    isForeground: boolean = true,
  ): { shouldAddPoint: boolean; shouldCountDistance: boolean } => {
    const config = isForeground
      ? {
          minDist: MOVEMENT_CONFIG.FG_MIN_DISTANCE_M / 1000,
          minTime: MOVEMENT_CONFIG.FG_MIN_TIME_S,
          forceTime: MOVEMENT_CONFIG.FG_FORCE_UPDATE_S,
        }
      : {
          minDist: MOVEMENT_CONFIG.BG_MIN_DISTANCE_M / 1000,
          minTime: MOVEMENT_CONFIG.BG_MIN_TIME_S,
          forceTime: MOVEMENT_CONFIG.BG_FORCE_UPDATE_S,
        };

    const distMeters = distanceKm * 1000;

    // ✅ Regra 1: Movimento detectado com tempo adequado
    if (distanceKm >= config.minDist && timeDeltaS >= config.minTime) {
      console.log(
        `[Validation] ✅ Regra 1: ${distMeters.toFixed(1)}m >= ${(config.minDist * 1000).toFixed(1)}m E ${timeDeltaS.toFixed(1)}s >= ${config.minTime}s`,
      );
      return { shouldAddPoint: true, shouldCountDistance: true };
    }

    // ✅ Regra 2: Velocidade GPS indica movimento (mais permissiva)
    if (speedKmh >= MOVEMENT_CONFIG.MIN_SPEED_KMPH && distanceKm > 0) {
      console.log(
        `[Validation] ✅ Regra 2: speed ${speedKmh.toFixed(1)} km/h >= ${MOVEMENT_CONFIG.MIN_SPEED_KMPH} km/h E dist > 0`,
      );
      return { shouldAddPoint: true, shouldCountDistance: true };
    }

    // ✅ Regra 3: Força update após tempo (conta distância se >= 5cm)
    if (timeDeltaS >= config.forceTime) {
      const minDistForCount = 0.05; // 5cm em metros
      const shouldCountDist = distMeters >= minDistForCount;
      console.log(
        `[Validation] ⏰ Regra 3 (força): ${timeDeltaS.toFixed(1)}s >= ${config.forceTime}s | ` +
          `countDist=${shouldCountDist} (${distMeters.toFixed(1)}m >= ${minDistForCount}m)`,
      );
      return { shouldAddPoint: true, shouldCountDistance: shouldCountDist };
    }

    console.log(
      `[Validation] ❌ Rejeitado: dist=${distMeters.toFixed(1)}m, time=${timeDeltaS.toFixed(1)}s, speed=${speedKmh.toFixed(1)} km/h`,
    );
    return { shouldAddPoint: false, shouldCountDistance: false };
  };

  const calculateTotalDistance = (coords: LocationCoordsWithTimestamp[]) => {
    if (coords.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      total += calculateDistance([coords[i - 1], coords[i]]);
    }
    return total;
  };

  const updateRoadWidthBySpeed = (speed: number) => {
    if (speed > 80) setRoadWidth(14);
    else if (speed > 50) setRoadWidth(12);
    else if (speed > 30) setRoadWidth(10);
    else if (speed > 15) setRoadWidth(8);
    else setRoadWidth(6);
  };

  const calculateCurrentPace = (
    distanceKm: number,
    timeSeconds: number,
  ): string => {
    if (distanceKm <= 0.001 || timeSeconds <= 0) return DEFAULT_TIME;

    const paceSeconds = timeSeconds / distanceKm; // s/km

    // > 30 min/km = parado, retorna default
    if (paceSeconds > 1800) return DEFAULT_TIME;

    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.floor(paceSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  function getPaceAverage(speedKmH: number): string {
    if (speedKmH <= 0) {
      return "00:00";
    }

    const totalMinutesPerKm = 60 / speedKmH;

    const minutes = Math.floor(totalMinutesPerKm);
    const seconds = Math.round((totalMinutesPerKm - minutes) * 60);

    // Ajuste caso arredonde para 60 segundos
    const finalMinutes = seconds === 60 ? minutes + 1 : minutes;
    const finalSeconds = seconds === 60 ? 0 : seconds;

    return `${String(finalMinutes).padStart(2, "0")}:${String(finalSeconds).padStart(2, "0")}`;
  }

  const getSpeedAverage = (): number => {
    const vals = speedAverageRef.current;
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const getDistanceBetweenPoints = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ── Câmera ──────────────────────────────────────────────────────────────────

  const setupWazeCamera = useCallback(
    (lat: number, lng: number, userHeading = 0) => {
      if (!mapRef.current) return;
      const offset = 0.0001;
      const rad = (userHeading * Math.PI) / 180;
      mapRef.current.animateCamera(
        {
          center: {
            latitude: lat - Math.sin(rad) * offset,
            longitude: lng - Math.cos(rad) * offset,
          },
          pitch: isRunningRef.current ? 75 : 0,
          heading: userHeading,
          altitude: 15,
          zoom: 19,
        },
        { duration: 500 },
      );
    },
    [],
  );

  // ── Sincronização com AsyncStorage (background → foreground) ────────────────

  /** * Lê os dados salvos em background e mescla com o estado atual. * Garante que nenhum ponto seja perdido e que a distância/tempo * reflitam o que realmente aconteceu. */
  const syncFromStorage = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(StoragesEnum.RUNNING_DATA_KEY);
      if (!raw) return;

      const stored: RunningData = JSON.parse(raw);

      if (stored.isRunning !== isRunningRef.current) {
        setIsRunning(stored.isRunning);
        isRunningRef.current = stored.isRunning;
      }

      if (stored.coordinates.length > routeCoordinatesRef.current.length) {
        setRouteCoordinates(stored.coordinates);
        routeCoordinatesRef.current = stored.coordinates;
      }

      if (stored.distance > distanceRef.current) {
        setDistance(stored.distance);
        distanceRef.current = stored.distance;
      }

      if (stored.isRunning && stored.startTime > 0) {
        const elapsed = Math.floor((Date.now() - stored.startTime) / 1000);
        setElapsedTime(elapsed);
        elapsedTimeRef.current = elapsed;
        startTimeRef.current = stored.startTime;
      }

      if (stored.coordinates.length > 0) {
        const last = stored.coordinates[stored.coordinates.length - 1];
        setLocation(last);
        setupWazeCamera(
          last.latitude,
          last.longitude,
          last.heading ?? lastGoodHeading.current,
        );
      }

      lastBgSyncRef.current = Date.now();
    } catch (e) {
      console.error("[syncFromStorage] Erro:", e);
    }
  }, [setupWazeCamera]);

  // ── Atualização de localização (foreground) ─────────────────────────────────

  const handleLocationUpdate = useCallback(
    (newCoord: LocationObjectCoords) => {
      if (
        newCoord.accuracy !== null &&
        newCoord.accuracy > MOVEMENT_CONFIG.MAX_ACCURACY_M
      ) {
        console.log(`[FG] ⚠️ Precisão ruim: ${newCoord.accuracy.toFixed(1)}m`);
        return;
      }

      if (newCoord.heading != null) {
        lastGoodHeading.current = newCoord.heading;
        setHeading(newCoord.heading);
      }

      const speedKmh = Math.max(0, (newCoord.speed ?? 0) * 3.6);
      const finalSpeed = speedKmh < 0.05 ? 0 : speedKmh;

      setCurrentSpeed(finalSpeed);

      speedAverageRef.current.push(finalSpeed);
      if (speedAverageRef.current.length > 100) {
        speedAverageRef.current.shift();
      }

      updateRoadWidthBySpeed(finalSpeed);

      const coordWithTimestamp: LocationCoordsWithTimestamp = {
        ...newCoord,
        timestamp: Date.now(),
      };

      setLocation(coordWithTimestamp);
      setupWazeCamera(
        coordWithTimestamp.latitude,
        coordWithTimestamp.longitude,
        coordWithTimestamp.heading ?? lastGoodHeading.current,
      );

      if (!isRunningRef.current) {
        console.log("[FG] ⏸️ Não está correndo, ignorando update");
        return;
      }

      setRouteCoordinates((prev) => {
        const updated = [...prev, coordWithTimestamp];
        routeCoordinatesRef.current = updated;

        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          const distanceIncKm = calculateDistance([last, coordWithTimestamp]);
          const now = Date.now();
          const timeDeltaS = (now - (last.timestamp || now)) / 1000;

          // ✅ LOGS DETALHADOS DE DEBUG
          console.log(
            `[FG DEBUG] ` +
              `dist: ${(distanceIncKm * 1000).toFixed(1)}m | ` +
              `time: ${timeDeltaS.toFixed(1)}s | ` +
              `speed: ${speedKmh.toFixed(1)} km/h | ` +
              `minDist: ${MOVEMENT_CONFIG.FG_MIN_DISTANCE_M}m | ` +
              `minTime: ${MOVEMENT_CONFIG.FG_MIN_TIME_S}s | ` +
              `forceTime: ${MOVEMENT_CONFIG.FG_FORCE_UPDATE_S}s`,
          );

          const validation = isValidMovement(
            distanceIncKm,
            timeDeltaS,
            speedKmh,
            true,
          );

          console.log(
            `[FG DEBUG] Validation: addPoint=${validation.shouldAddPoint}, countDist=${validation.shouldCountDistance}`,
          );

          if (validation.shouldAddPoint) {
            if (validation.shouldCountDistance) {
              const newDist = distanceRef.current + distanceIncKm;
              distanceRef.current = newDist;
              setDistance(newDist);

              console.log(
                `[FG] ✅ +${(distanceIncKm * 1000).toFixed(1)}m | ` +
                  `Total: ${newDist.toFixed(3)}km | ` +
                  `Speed: ${finalSpeed.toFixed(1)} km/h | ` +
                  `Δt: ${timeDeltaS.toFixed(1)}s | ` +
                  `GPS_Speed: ${speedKmh.toFixed(1)} km/h`,
              );

              if (elapsedTimeRef.current > 0 && newDist > 0) {
                // const newPace = calculateCurrentPace(
                //   newDist,
                //   elapsedTimeRef.current,
                // );

                const newPace = getPaceAverage(finalSpeed);

                if (newPace !== DEFAULT_TIME) {
                  setPace(newPace);
                  paceAverageRef.current.push(newPace);
                  if (paceAverageRef.current.length > 50) {
                    paceAverageRef.current.shift();
                  }
                }
              }
            } else {
              console.log(
                `[FG] 📍 Ponto adicionado mas distância não contada: ` +
                  `${(distanceIncKm * 1000).toFixed(1)}m em ${timeDeltaS.toFixed(1)}s | ` +
                  `Speed: ${finalSpeed.toFixed(1)} km/h | ` +
                  `Motivo: dist < ${(MOVEMENT_CONFIG.FG_MIN_DISTANCE_M / 2).toFixed(1)}cm`,
              );
            }
          } else {
            console.log(
              `[FG] ⏭️ Rejeitado: ${(distanceIncKm * 1000).toFixed(1)}m em ${timeDeltaS.toFixed(1)}s | ` +
                `Speed: ${finalSpeed.toFixed(1)} km/h | ` +
                `Motivo: Não passou em nenhuma regra`,
            );
          }
        } else {
          console.log("[FG] 📍 Primeiro ponto registrado");
        }

        return updated;
      });

      // ✅ Storage com mesma lógica
      (async () => {
        try {
          const raw = await AsyncStorage.getItem(StoragesEnum.RUNNING_DATA_KEY);
          if (!raw) return;
          const stored: RunningData = JSON.parse(raw);

          const last =
            stored.coordinates.length > 0
              ? stored.coordinates[stored.coordinates.length - 1]
              : null;

          if (last) {
            const distKm = calculateDistance([last, coordWithTimestamp]);
            const timeDiff = (Date.now() - (last.timestamp || 0)) / 1000;

            const validation = isValidMovement(
              distKm,
              timeDiff,
              speedKmh,
              true,
            );

            if (validation.shouldAddPoint) {
              stored.coordinates.push(coordWithTimestamp);

              if (validation.shouldCountDistance) {
                stored.distance = distanceRef.current;
                console.log(
                  `[FG Storage] 💾 Salvo: +${(distKm * 1000).toFixed(1)}m | Total: ${stored.distance.toFixed(3)}km`,
                );
              } else {
                console.log(
                  `[FG Storage] 💾 Ponto salvo sem acumular distância`,
                );
              }

              stored.lastUpdate = Date.now();
              await AsyncStorage.setItem(
                StoragesEnum.RUNNING_DATA_KEY,
                JSON.stringify(stored),
              );
            }
          } else {
            stored.coordinates.push(coordWithTimestamp);
            stored.lastUpdate = Date.now();
            await AsyncStorage.setItem(
              StoragesEnum.RUNNING_DATA_KEY,
              JSON.stringify(stored),
            );
          }
        } catch (e) {
          console.error("[handleLocationUpdate] Erro ao persistir:", e);
        }
      })();

      if (directionsRef.current.length > 0) {
        updateProgressOnRoute(coordWithTimestamp);
      }
    },
    [setupWazeCamera],
  );
  // ── Progresso na rota planejada ─────────────────────────────────────────────

  const updateProgressOnRoute = (pos: LocationObjectCoords) => {
    const dirs = directionsRef.current;
    if (!dirs.length) return;

    let minDist = Infinity;
    let closest = 0;

    dirs.forEach((pt, i) => {
      const d = getDistanceBetweenPoints(
        pos.latitude,
        pos.longitude,
        pt.latitude,
        pt.longitude,
      );
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    });

    if (minDist < 0.05) {
      setProgressOnRoute((closest / dirs.length) * 100);
      setCompletedSegments(dirs.slice(0, closest + 1));
    }
  };

  // ── Iniciar rastreamento ────────────────────────────────────────────────────

  const startLocationTracking = async () => {
    const { status: fg } = await Location.getForegroundPermissionsAsync();
    if (fg !== "granted") {
      Alert.alert("Permissão negada", "Precisamos de acesso à localização.");
      return;
    }

    const startTime = startTimeRef.current || Date.now();
    startTimeRef.current = startTime;

    const initialData: RunningData = {
      coordinates: routeCoordinatesRef.current,
      distance: distanceRef.current,
      startTime,
      lastUpdate: startTime,
      isRunning: true,
      elapsedTime: elapsedTimeRef.current,
    };
    await AsyncStorage.setItem(
      StoragesEnum.RUNNING_DATA_KEY,
      JSON.stringify(initialData),
    );

    // ✅ Foreground: MUITO mais frequente
    const sub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 300, // ✅ 300ms (era 500ms)
        distanceInterval: 0.1, // ✅ 10cm (era 20cm)
      },
      (loc) => {
        console.log(
          `[FG GPS] Novo ponto: lat=${loc.coords.latitude.toFixed(6)}, ` +
            `lng=${loc.coords.longitude.toFixed(6)}, ` +
            `speed=${((loc.coords.speed ?? 0) * 3.6).toFixed(1)} km/h, ` +
            `accuracy=${loc.coords.accuracy?.toFixed(1)}m`,
        );
        handleLocationUpdate(loc.coords);
      },
    );
    locationSubscription.current = sub;

    // ✅ Background
    try {
      const hasStarted =
        await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }

      await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 500, // ✅ 500ms (era 1000ms)
        distanceInterval: 0.3, // ✅ 30cm (era 50cm)
        foregroundService: {
          notificationTitle: "Corrida em andamento",
          notificationBody: "Rastreando sua localização",
          notificationColor: "#FF6600",
          killServiceOnDestroy: false,
        },
        activityType: Location.ActivityType.Fitness,
        showsBackgroundLocationIndicator: true,
        pausesUpdatesAutomatically: false,
        deferredUpdatesInterval: 500,
        deferredUpdatesDistance: 0.3,
      });
    } catch (e) {
      console.error("[startLocationTracking] Bg task error:", e);
    }

    timerRef.current = setInterval(() => {
      if (startTimeRef.current > 0 && isRunningRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
        elapsedTimeRef.current = elapsed;

        // ✅ Recalcula pace a cada segundo com tempo e distância reais
        if (distanceRef.current > 0 && elapsed > 0) {
          const p = calculateCurrentPace(distanceRef.current, elapsed);
          if (p !== DEFAULT_TIME) {
            setPace(p);
          }
        }
      }
    }, 1000);

    await activateKeepAwakeAsync();
  };

  // ── Parar rastreamento ──────────────────────────────────────────────────────

  const stopLocationTracking = async () => {
    // Para subscription foreground
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    // Para background task
    try {
      const hasStarted =
        await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
      }
    } catch (e) {
      console.error("[stopLocationTracking] Bg task stop error:", e);
    }

    // Para timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const raw = await AsyncStorage.getItem(StoragesEnum.RUNNING_DATA_KEY);
    if (raw) {
      const stored: RunningData = JSON.parse(raw);
      stored.isRunning = false; // ← IMPORTANTE!
      await AsyncStorage.setItem(
        StoragesEnum.RUNNING_DATA_KEY,
        JSON.stringify(stored),
      );
    }

    // Sincroniza dados finais do storage
    await syncFromStorage();

    await deactivateKeepAwake();
  };

  // ── Toggle Run ──────────────────────────────────────────────────────────────

  const toggleRun = async ({ reset = false }: { reset?: boolean } = {}) => {
    if (isRunning) {
      // Parar
      setFinalLocation(location);

      // ✅ Pausar timer imediatamente
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const raw = await AsyncStorage.getItem(StoragesEnum.RUNNING_DATA_KEY);
      if (raw) {
        const stored: RunningData = JSON.parse(raw);
        stored.isRunning = false;
        // ✅ Salvar tempo pausado
        stored.elapsedTime = elapsedTimeRef.current;
        await AsyncStorage.setItem(
          StoragesEnum.RUNNING_DATA_KEY,
          JSON.stringify(stored),
        );
      }

      await stopLocationTracking();
      setCurrentSpeed(0);
      // speedReadings.current = []; // ✅ Limpar leituras
      // Não resetar pace ao pausar
    } else {
      // Iniciar
      if (reset) {
        setRouteCoordinates([]);
        routeCoordinatesRef.current = [];
        setDistance(0);
        distanceRef.current = 0;
        setPace(DEFAULT_TIME);
        setElapsedTime(0);
        elapsedTimeRef.current = 0;
        paceAverageRef.current = [];
        speedAverageRef.current = [];
        // speedReadings.current = []; // ✅ Limpar leituras
        setCompletedSegments([]);
        setProgressOnRoute(0);
      }

      if (!reset && location && routeCoordinatesRef.current.length === 0) {
        setInitialLocation(location);
      }

      // ✅ Continuar de onde parou
      startTimeRef.current = Date.now() - elapsedTimeRef.current * 1000;
      await startLocationTracking();
    }

    const next = !isRunning;
    setIsRunning(next);
    isRunningRef.current = next;
  };

  const getFinalPaceAverage = (paceAverageRef: string[]): string => {
    if (paceAverageRef.length === 0) return DEFAULT_TIME;
    const totalSeconds = paceAverageRef.reduce((acc, pace) => {
      const [mins, secs] = pace.split(":").map(Number);
      return acc + mins * 60 + secs;
    }, 0);
    const avgSeconds = totalSeconds / paceAverageRef.length;
    const mins = Math.floor(avgSeconds / 60);
    const secs = Math.floor(avgSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ── Finalizar exercício ─────────────────────────────────────────────────────
  const onFinalizeExercise = async () => {
    const calculatedDistance = calculateTotalDistance(
      routeCoordinatesRef.current,
    );

    const finalDistance = Math.max(distanceRef.current, calculatedDistance);
    const finalElapsed = elapsedTimeRef.current;

    // ✅ Pace final correto: tempo total / distância total
    const finalPace = calculateCurrentPace(finalDistance, finalElapsed);

    console.log("=== MÉTRICAS FINAIS ===");
    console.log(`Distância: ${finalDistance.toFixed(4)} km`);
    console.log(`Tempo: ${finalElapsed}s`);
    console.log(`Pace calculado: ${finalPace} min/km`);
    console.log(
      `Verificação: ${finalElapsed}s / ${finalDistance.toFixed(4)}km = ${(finalElapsed / finalDistance).toFixed(1)}s/km`,
    );

    const speedAverage = getSpeedAverage();

    const gpsState = {
      exerciseId: exercise ? exercise.id.toString() : "0",
      academyId:
        exercise && exercise.academyId ? exercise.academyId.toString() : "0",
      speedAverage,
      distance: finalDistance,
      pace: finalPace, // ✅ Pace correto
      elapsedTime: finalElapsed,
      startLocation: initialLocation,
      endLocation: finalLocation,
      routePoints: routeCoordinatesRef.current.map((coord) => ({
        latitude: coord.latitude,
        longitude: coord.longitude,
        altitude: coord.altitude,
        accuracy: coord.accuracy,
        heading: coord.heading,
        speed: coord.speed,
        altitudeAccuracy: coord.altitudeAccuracy,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      raceFinalized: true,
    };

    await AsyncStorage.removeItem(StoragesEnum.RUNNING_DATA_KEY);
    await dispatch(updateGpsMetricsTemp(gpsState));
    await dispatch(fetchGpsMetricsTemp({ ignoreCheckState: true }));
    router.back();
  };

  const onConfirmFinalize = () => {
    Alert.alert(
      t(AppMessagesEnum.EXERCISE_SCREEN_FINALIZE_EXERCISE_BUTTON),
      t(AppMessagesEnum.GPS_CONFIRM_FINALIZE_RACE),
      [
        { text: t(AppMessagesEnum.CANCEL), style: "cancel" },
        { text: t(AppMessagesEnum.GPS_FINALIZE), onPress: onFinalizeExercise },
      ],
    );
  };

  // ── AppState: volta do background ───────────────────────────────────────────
  useEffect(() => {
    const restoreRunningState = async () => {
      try {
        const raw = await AsyncStorage.getItem(StoragesEnum.RUNNING_DATA_KEY);
        if (!raw) return;

        const stored: RunningData = JSON.parse(raw);

        // Se estava correndo quando o app foi morto, restaura o estado
        if (stored.isRunning) {
          console.log("[RESTORE] Restaurando corrida em andamento...");

          // Restaura coordenadas
          setRouteCoordinates(stored.coordinates);
          routeCoordinatesRef.current = stored.coordinates;

          // Restaura distância
          setDistance(stored.distance);
          distanceRef.current = stored.distance;

          // Restaura tempo
          const now = Date.now();
          const elapsed = Math.floor((now - stored.startTime) / 1000);
          setElapsedTime(elapsed);
          elapsedTimeRef.current = elapsed;
          startTimeRef.current = stored.startTime;

          // Restaura última localização
          if (stored.coordinates.length > 0) {
            const last = stored.coordinates[stored.coordinates.length - 1];
            setLocation(last);
            setInitialLocation(stored.coordinates[0]);
          }

          // ✅ CORREÇÃO: Marca como running MAS NÃO chama startLocationTracking aqui
          setIsRunning(true);
          isRunningRef.current = true;

          // ✅ Agenda para reiniciar o tracking após o componente montar
          setTimeout(async () => {
            try {
              await startLocationTracking();
              Alert.alert(
                "Corrida restaurada",
                "Sua corrida foi retomada de onde parou.",
                [{ text: "OK" }],
              );
            } catch (e) {
              console.error("[RESTORE] Erro ao reiniciar tracking:", e);
            }
          }, 1000); // ← Aguarda 1s para garantir que tudo está pronto
        }
      } catch (e) {
        console.error("[RESTORE] Erro ao restaurar estado:", e);
      }
    };

    restoreRunningState();
  }, []); // ← Executa apenas uma vez ao montar

  useEffect(() => {
    const sub = AppState.addEventListener(
      "change",
      async (next: AppStateStatus) => {
        const prev = appStateRef.current;
        appStateRef.current = next;

        if (prev !== "active" && next === "active" && isRunningRef.current) {
          console.log("[AppState] Voltou ao foreground, sincronizando...");
          await syncFromStorage();
        }
      },
    );
    return () => sub.remove();
  }, [syncFromStorage]);

  // ── Permissões e localização inicial ───────────────────────────────────────

  useEffect(() => {
    (async () => {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Não é possível acessar sua localização",
        );
        return;
      }
      await Location.requestBackgroundPermissionsAsync();

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      setLocation(pos.coords);
      setInitialLocation(pos.coords);
      if (pos.coords.heading) {
        setHeading(pos.coords.heading);
        lastGoodHeading.current = pos.coords.heading;
      }

      if (mapReady) {
        setupWazeCamera(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.heading ?? 0,
        );
      }
    })();

    return () => {
      stopLocationTracking();
    };
  }, [mapReady]);

  // ── Busca / Direções ────────────────────────────────────────────────────────

  const decodePolyline = (encoded: string) => {
    const poly: { latitude: number; longitude: number }[] = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += result & 1 ? ~(result >> 1) : result >> 1;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += result & 1 ? ~(result >> 1) : result >> 1;

      poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return poly;
  };

  // const handleSearch = async () => {
  //   if (!searchQuery.trim() || !location) return;
  //   setIsSearching(true);
  //   setShowSearchResults(true);
  //   try {
  //     const res = await fetch(
  //       `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${location.latitude},${location.longitude}&radius=50000&key=${GOOGLE_MAPS_API_KEY}`,
  //     );
  //     const data = await res.json();
  //     setSearchResults(data.results ? data.results.slice(0, 5) : []);
  //   } catch (e) {
  //     Alert.alert("Erro", "Não foi possível realizar a pesquisa");
  //   } finally {
  //     setIsSearching(false);
  //   }
  // };

  const selectDestination = async (place: any) => {
    setShowSearchResults(false);
    setDestination(place);
    setSearchQuery(place.name);
    if (!location) return;
    setIsLoadingDirections(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${location.latitude},${location.longitude}&destination=${place.geometry.location.lat},${place.geometry.location.lng}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const data = await res.json();
      if (data.routes?.length) {
        const pts = decodePolyline(data.routes[0].overview_polyline.points);
        setDirections(pts);
        directionsRef.current = pts;
        mapRef.current?.fitToCoordinates(pts, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      } else {
        Alert.alert("Rota não encontrada", "Tente outro destino.");
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível obter a rota.");
    } finally {
      setIsLoadingDirections(false);
    }
  };

  const clearRoute = () => {
    setDestination(null);
    setDirections([]);
    directionsRef.current = [];
    setCompletedSegments([]);
    setProgressOnRoute(0);
    setSearchQuery("");
  };

  // useEffect(() => {
  //   const delay = setTimeout(() => {
  //     if (searchQuery.trim().length > 2) handleSearch();
  //   }, 500);
  //   return () => clearTimeout(delay);
  // }, [searchQuery]);

  // ── MapReady ────────────────────────────────────────────────────────────────

  const handleMapReady = () => {
    setMapReady(true);
    if (location)
      setupWazeCamera(location.latitude, location.longitude, heading);
  };

  // ── Return ──────────────────────────────────────────────────────────────────

  return {
    t,
    colors,
    customStyle,
    currentSpeed,
    initialLocation,
    finalLocation,
    roadWidth,
    location,
    routeCoordinates,
    isRunning,
    distance,
    pace,
    elapsedTime,
    heading,
    mapReady,
    searchQuery,
    destination,
    directions,
    searchResults,
    showSearchResults,
    isSearching,
    isLoadingDirections,
    progressOnRoute,
    completedSegments,
    mapRef,
    distanceRef,
    elapsedTimeRef,
    routeCoordinatesRef,
    directionsRef,
    wazeMapStyle: WAZE_MAP_STYLE,
    formatTime,
    toggleRun,
    onConfirmFinalize,
    onFinalizeExercise,
    clearRoute,
    handleMapReady,
    setupWazeCamera,
    updateProgressOnRoute,
    calculateCurrentPace,
    getPaceAverage,
    getSpeedAverage,
    // handleSearch,
    selectDestination,
    setSearchQuery,
    setShowSearchResults,
  };
}
