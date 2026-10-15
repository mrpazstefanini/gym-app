import { ImageWrapper } from "@/components/custom/ImageWrapper";
import Text from "@/components/custom/Text";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  TouchableOpacity,
} from "react-native";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import Input from "@/components/custom/Input";
import { useCallback, useMemo, useState } from "react";
import Modal from "@/components/custom/Modal";
import { useDispatch, useSelector } from "react-redux";
import { useApi } from "@/hooks/useApi";
import Timer from "@/components/custom/Timer";
import useCustomStyle from "@/hooks/useCustomStyle";
import Card from "@/components/custom/Card";
import { Button } from "@/components/custom/Button";
import { SeverityEnum } from "@/shared/enum/SeverityEnum";
import { useRouter } from "expo-router";
import { IExerciseHistory } from "@/shared/models/IExerciseHistory";
import {
  addNewExerciseHistory,
  fetchExerciseHistory,
} from "@/redux/actions/exerciseHistoryActions";
import { RootReduxState } from "@reduxjs/toolkit";
import { TabProps } from "..";
import { generateId } from "@/shared/utils/generateId";
import RestTimeBetweenSets from "@/components/custom/RestTimeBetweenSets";
import { ButtonModeEnum } from "@/shared/enum/ButtonModeEnum";
import Collapsable from "@/components/custom/Collapsable";
import Textarea from "@/components/custom/Textarea";
import {
  DEBOUNCE_TIME_MS,
  MAX_LENGTH_DESCRIPTION,
} from "@/shared/constants/general";
import { fetchExercise, updateExercise } from "@/redux/actions/exerciseActions";
import { formatTime } from "@/shared/utils/formatTime";
import {
  clearGpsMetricsTemp,
  fetchGpsMetricsTemp,
} from "@/redux/actions/gpsMetricsTempLocalActions";
import { log } from "@/shared/utils/log";
import useOnConfirm from "@/hooks/useOnConfirm";
import { formatDistance } from "@/shared/utils/formatDistance";
import { Ionicons } from "@expo/vector-icons";
import RouteHistoryMap from "@/components/custom/RouteHistoryMap";
import { useCheckInternetConnection } from "@/hooks/useCheckInternetConnection";
import { DistanceUnitAbbreviations } from "@/shared/enum/DistanceUnitEnum";

const Repetitions = ({ hook, t }: TabProps) => {
  if (!hook.exercise?.repetitions) {
    return null;
  }

  if (!hook.exercise.repetitions.length) {
    return null;
  }

  if (
    hook.exercise.repetitions.length === 1 &&
    !!hook.exercise.repetitions[0]
  ) {
    return (
      <Card
        leftLabel={t(AppMessagesEnum.EXERCISE_SCREEN_REPETITIONS)}
        rightLabel={hook.exercise.repetitions.toString()}
      />
    );
  }

  return (
    <Card
      leftLabel={t(AppMessagesEnum.EXERCISE_SCREEN_REPETITIONS)}
      rightLabel={hook.exercise.repetitions
        .map((rep) => rep.toString())
        .join(", ")}
    />
  );
};

export default function ExerciseTab({ hook, t }: TabProps) {
  const { call } = useApi();
  const { checkInternetConnection } = useCheckInternetConnection();
  const { onConfirm } = useOnConfirm();
  const { unifiedGroup } = useSelector((state: RootReduxState) => state.group);
  const { user } = useSelector((state: RootReduxState) => state.user);
  const gpsMetricsTemp = useSelector(
    (state: RootReduxState) => state.gpsMetricsTemp,
  );
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors } = useCustomStyle();

  const [gpsValues, historyData] = useMemo(() => {
    try {
      if (!gpsMetricsTemp.list || gpsMetricsTemp.list.length === 0) {
        return [null, null];
      }

      if (!hook.exercise?.id) {
        return [null, null];
      }

      const gpsData = gpsMetricsTemp.list.find(
        (item) => item?.exerciseId === hook.exercise?.id,
      );

      const id = generateId();

      const historyData: IExerciseHistory = {
        id,
        userId: user?.id || "",
        academyId: hook.exercise?.academyId || "",
        exerciseId: hook.exercise?.id || "",
        completedAt: new Date(),
        duration: gpsData?.elapsedTime || 0,
        completedSets,
        completedRepetitions: hook.exercise?.repetitions || [],
        weightUsed: savedWeight || 0,
        distance: gpsData?.distance || 0,
        distanceUnit: hook.exercise?.distanceUnit,
        paceAverage: gpsData?.pace || undefined,
        speedAverage: gpsData?.speedAverage || 0,
        startLocation: {
          longitude: gpsData?.startLocation?.longitude || 0,
          latitude: gpsData?.startLocation?.latitude || 0,
        },
        endLocation: {
          longitude: gpsData?.endLocation?.longitude || 0,
          latitude: gpsData?.endLocation?.latitude || 0,
        },
        routePoints: gpsData?.routePoints || [],
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      };

      return [gpsData, historyData];
    } catch (error) {
      log("Error accessing GPS values:", error);
      return [null, null];
    }
  }, [gpsMetricsTemp.list, hook.exercise?.id]);

  const [showMapModal, setShowMapModal] = useState<boolean>(false);

  const [userNotes, setUserNotes] = useState<string>(
    hook.exercise?.userNotes || "",
  );

  const [savedWeight, setSavedWeight] = useState<number | null>(
    hook.exercise?.clientWeight || null,
  );

  const [tempWeight, setTempWeight] = useState<number | null>(
    hook.exercise?.clientWeight || null,
  );

  const [completedSets, setCompletedSets] = useState<number>(0);
  const [weightModalVisibility, setWeightModalVisibility] =
    useState<boolean>(false);

  const oldWeight = useMemo(
    () => hook.exercise?.clientWeight || null,
    [hook.exercise?.clientWeight],
  );

  const customStyle = useMemo(() => {
    return {
      labelWeight: {
        backgroundColor: colors.gray300,
      },
      orientationWrapper: {
        borderColor: colors.tint,
      },
      viewContainer: {
        borderBottomColor: hook.colors.gray300,
      },
      mapButton: {
        backgroundColor: hook.colors.tint,
      },
    };
  }, [colors]);

  const handleShowMap = () => {
    setShowMapModal(true);
  };

  const handleCloseMap = () => {
    setShowMapModal(false);
  };

  const onConfirmWeightChange = async () => {
    call({
      loading: true,
      try: async () => {
        if (!tempWeight) return;
        if (tempWeight === oldWeight) return;

        if (!hook.exercise?.id) {
          throw new Error(t(AppMessagesEnum.EXERCISE_NOT_FOUND));
        }

        setSavedWeight(tempWeight);
        setWeightModalVisibility(false);

        const updatedExercise = {
          ...hook.exercise,
          clientWeight: tempWeight,
          changeOnlyLocally: true,
          userNotes,
        };

        await dispatch(updateExercise(updatedExercise));
        dispatch(fetchExercise());
      },
    });
  };

  const onConfirmFinishExercise = () => {
    Alert.alert(
      t(AppMessagesEnum.EXERCISE_SCREEN_FINALIZE_EXERCISE_BUTTON),
      t(AppMessagesEnum.EXERCISE_SCREEN_FINALIZE_EXERCISE_CONFIRMATION),
      [
        {
          text: t(AppMessagesEnum.CANCEL),
          style: "cancel",
        },
        {
          text: t(AppMessagesEnum.FINALIZE),
          onPress: onFinishExercise,
        },
      ],
    );
  };

  const onFinishExercise = async () => {
    call({
      loading: true,
      try: async (toast) => {
        if (!hook.exercise?.academyId && !hook.exercise?.id) {
          throw new Error(t(AppMessagesEnum.EXERCISE_NOT_FOUND));
        }

        await checkInternetConnection();

        const id = generateId();

        const exerciseHistory: IExerciseHistory = {
          id,
          userId: user?.id || "",
          academyId: hook.exercise?.academyId || "",
          exerciseId: hook.exercise?.id || "",
          completedAt: new Date(),
          duration: gpsValues?.elapsedTime || 0,
          completedSets,
          completedRepetitions: hook.exercise?.repetitions || [],
          weightUsed: savedWeight || 0,
          distance: gpsValues?.distance || 0,
          distanceUnit: hook.exercise?.distanceUnit,
          paceAverage: gpsValues?.pace || undefined,
          speedAverage: gpsValues?.speedAverage || 0,
          startLocation: {
            longitude: gpsValues?.startLocation?.longitude || 0,
            latitude: gpsValues?.startLocation?.latitude || 0,
          },
          endLocation: {
            longitude: gpsValues?.endLocation?.longitude || 0,
            latitude: gpsValues?.endLocation?.latitude || 0,
          },
          routePoints: gpsValues?.routePoints || [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        };

        const updatedExercise = {
          ...hook.exercise,
          completed: true,
          userNotes,
          clientWeight: savedWeight || hook.exercise?.clientWeight || 0,
          changeOnlyLocally: true,
        };

        // Executa em ordem sequencial
        await dispatch(updateExercise(updatedExercise));
        await dispatch(addNewExerciseHistory(exerciseHistory));

        // Limpa os dados GPS e aguarda a conclusão
        const result = await dispatch(clearGpsMetricsTemp(hook.exercise.id));

        // Verifica se a limpeza foi bem-sucedida
        if (clearGpsMetricsTemp.fulfilled.match(result)) {
          log("GPS metrics cleared successfully");
        }

        // Busca os dados atualizados
        await dispatch(fetchExercise());
        await dispatch(fetchExerciseHistory({ ignoreCheckState: true }));

        toast.show({
          type: "success",
          text1: t(AppMessagesEnum.EXERCISE_COMPLETED_SUCCESS_MESSAGE),
        });

        // Navega de volta após um pequeno delay
        requestAnimationFrame(() => {
          router.back();
        });
      },
    });
  };

  const handleStartGpsTracking = async () => {
    if (gpsValues) {
      onConfirm({
        onConfirmCallback: goToGpsScreen,
        title: t(AppMessagesEnum.CONFIRM_ERASE_GPS_DATA_TITLE),
        message: t(AppMessagesEnum.CONFIRM_ERASE_GPS_DATA_MESSAGE),
      });
    } else {
      goToGpsScreen();
    }
  };

  const goToGpsScreen = async () => {
    router.push({
      pathname: "/(authenticated)/(stacks)/GpsStack",
      params: {
        exercise: hook.exercise ? JSON.stringify(hook.exercise) : undefined,
      },
    });
  };

  const handleUserNotesChange = (
    e: NativeSyntheticEvent<TextInputChangeEventData>,
  ) => {
    const notes = e.nativeEvent.text;
    setUserNotes(notes);

    if (!hook.exercise) {
      throw new Error(t(AppMessagesEnum.EXERCISE_NOT_FOUND));
    }

    const updatedExercise = {
      ...hook.exercise,
      clientWeight: savedWeight || hook.exercise?.clientWeight || 0,
      userNotes: notes,
      changeOnlyLocally: true,
    };

    dispatch(updateExercise(updatedExercise));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          hook?.exercise?.hasGps && styles.scrollContentWithButton,
        ]}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {hook.exercise && "imagePath" in hook.exercise && (
          <View style={styles.imageContainer}>
            <ImageWrapper
              defaultImage={require("@/assets/images/default-exercise.jpg")}
              isLoading={false}
              object={hook.exercise}
            />
          </View>
        )}

        <View style={styles.detailsWrapper}>
          {Boolean(hook.exercise?.sets) && (
            <Card
              leftLabel={t(AppMessagesEnum.EXERCISE_SCREEN_SERIES)}
              rightLabel={hook.exercise?.sets?.toString()}
            />
          )}

          <Repetitions hook={hook} t={t} />

          {!!hook.exercise?.clientWeight && (
            <Card
              leftLabel={t(AppMessagesEnum.USER_EXERCISE_WEIGHT)}
              centerIcon="edit"
              rightLabel={`${savedWeight}kg`}
              onPress={() => {
                setWeightModalVisibility(true);
                setTempWeight(savedWeight);
              }}
            />
          )}

          {!!hook.exercise?.duration && (
            <Card
              leftLabel={t(AppMessagesEnum.EXERCISE_SCREEN_DURATION)}
              rightLabel={`${hook.exercise?.duration.toString()}min`}
            />
          )}

          {!!hook.exercise?.goal && (
            <Card
              leftLabel={t(AppMessagesEnum.EXERCISE_SCREEN_GOAL)}
              rightLabel={hook.exercise?.goal.toString()}
            />
          )}

          {!!hook.exercise?.distance && !!hook.exercise?.distanceUnit && (
            <Card
              leftLabel={t(AppMessagesEnum.EXERCISE_SCREEN_DISTANCE)}
              rightLabel={`${hook.exercise?.distance} ${DistanceUnitAbbreviations[hook.exercise?.distanceUnit]}`}
            />
          )}
        </View>

        {!!hook.exercise?.exerciseOrientations && (
          <View
            style={[styles.orientationWrapper, customStyle.orientationWrapper]}
          >
            <Text>{t(AppMessagesEnum.EXERCISE_SCREEN_DESCRIPTION_TAB)}</Text>
            <Text>{hook.exercise?.exerciseOrientations}</Text>
          </View>
        )}

        {gpsValues && gpsValues?.raceFinalized && (
          <View
            style={[styles.orientationWrapper, customStyle.orientationWrapper]}
          >
            <Text>{t(AppMessagesEnum.EXERCISE_SCREEN_GPS_METRICS)}</Text>
            <Text>{`${t(AppMessagesEnum.USER_EXERCISE_DISTANCE_LABEL)}: ${formatDistance(
              gpsValues.distance,
            )}`}</Text>
            <Text>{`${t(AppMessagesEnum.USER_EXERCISE_PACE_LABEL)}: ${
              gpsValues.pace
            } min/km`}</Text>
            <Text>{`${t(
              AppMessagesEnum.EXERCISE_SCREEN_ELAPSED_TIME_LABEL,
            )}: ${formatTime(gpsValues.elapsedTime)}`}</Text>
            <Text>{`${t(
              AppMessagesEnum.EXERCISE_SCREEN_SPEED_AVERAGE_LABEL,
            )}: ${(gpsValues.speedAverage || 0).toFixed(2)} km/h`}</Text>

            <View style={styles.routePointsContainer}>
              <TouchableOpacity
                style={[styles.mapButton, customStyle.mapButton]}
                onPress={handleShowMap}
              >
                <Ionicons name="map" size={20} color="white" />
                <Text style={styles.mapButtonText}>
                  {t(AppMessagesEnum.GPS_VIEW_ROUTE)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!!hook.exercise?.restTimeBetweenSets && !!hook.exercise?.sets && (
          <Collapsable
            title={t(AppMessagesEnum.EXERCISE_REST_TIME_BETWEEN_SETS)}
            isCollapsed={true}
            onlyHideContent
          >
            <RestTimeBetweenSets
              completedSets={completedSets}
              setCompletedSets={setCompletedSets}
              restTime={hook.exercise?.restTimeBetweenSets || 0}
              sets={hook.exercise?.sets || 0}
            />
          </Collapsable>
        )}

        {hook?.exercise?.hasStopwatch && (
          <Collapsable
            title={t(AppMessagesEnum.STOPWATCH_TITLE)}
            isCollapsed={true}
            onlyHideContent
          >
            <View style={styles.modalContent}>
              <Timer mode={ButtonModeEnum.UP} />
            </View>
          </Collapsable>
        )}

        {/* {hook.exerciseByUser?.hasUserNotes && ( */}
        <Textarea
          label={t(AppMessagesEnum.USER_EXERCISE_NOTES_LABEL)}
          multiline
          maxLength={MAX_LENGTH_DESCRIPTION}
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.description}
          value={userNotes}
          onChange={handleUserNotesChange}
          debounceTimeMs={DEBOUNCE_TIME_MS}
        />
      </ScrollView>

      <View style={{ height: 150, gap: 10 }}>
        {hook.exercise?.hasGps &&
          unifiedGroup.drawerMenu.home.tabs.exercises.userGpsButton
            .permitted && (
            <Button
              title={t(AppMessagesEnum.EXERCISE_SCREEN_INITIAL_GPS_BUTTON)}
              onPress={handleStartGpsTracking}
              severity={SeverityEnum.SECONDARY}
            />
          )}

        <Button
          title={t(AppMessagesEnum.EXERCISE_SCREEN_FINALIZE_EXERCISE_BUTTON)}
          onPress={onConfirmFinishExercise}
          severity={SeverityEnum.PRIMARY}
          disabled={
            !unifiedGroup.drawerMenu.home.tabs.exercises.finalizeExerciseButton
              .permitted
          }
        />
      </View>

      <Modal
        visible={weightModalVisibility}
        onClose={() => setWeightModalVisibility(false)}
        onConfirm={onConfirmWeightChange}
        title={t(AppMessagesEnum.EXERCISE_SCREEN_SET_WEIGHT)}
        confirmText={t(AppMessagesEnum.SAVE)}
        showCancelButton={true}
        showConfirmButton={true}
      >
        <View style={styles.modalContent}>
          <Input
            value={tempWeight?.toString()}
            keyboardType="numeric"
            style={styles.inputWeight}
            onChange={(e) => setTempWeight(Number(e.nativeEvent.text))}
            onSubmitEditing={onConfirmWeightChange}
          />
          <Text>kg</Text>
        </View>
      </Modal>
      {historyData && (
        <Modal
          visible={showMapModal}
          onClose={handleCloseMap}
          title={t(AppMessagesEnum.GPS_ROUTE_HISTORY)}
          showCancelButton={false}
          showConfirmButton={false}
          cancelText={t(AppMessagesEnum.CLOSE)}
        >
          <RouteHistoryMap historyItem={historyData} />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  scrollView: {
    // flex: 1,
  },
  routePointsContainer: {
    marginTop: 8,
    gap: 8,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  mapButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
    paddingTop: 0,
    paddingBottom: 16,
  },
  scrollContentWithButton: {
    paddingBottom: 90,
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
    gap: 5,
    marginVertical: 10,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },

  detailsWrapper: {
    padding: 10,
    gap: 10,
  },
  details: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  inputWeight: {
    width: 60,
  },
  labelWeight: {
    padding: 5,
    paddingHorizontal: 10,
  },
  modalContent: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 16,
    backgroundColor: "transparent",
    borderTopWidth: 0,
    marginBottom: 10,
  },
  orientationWrapper: {
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    justifyContent: "center",
    padding: 10,
    alignItems: "center",
  },
  description: {
    width: "100%",
    height: 120,
  },
});
