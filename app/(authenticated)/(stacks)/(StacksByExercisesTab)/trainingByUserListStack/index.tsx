import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import Card from "@/components/custom/Card";

import Container from "@/components/custom/Container";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import { useTranslation } from "@/hooks/useTranslation";

import { IExercise } from "@/shared/models/IExercise";
import useAddSkeletonListHOC from "@/hooks/useAddSkeletonListHOC";
import { useDispatch, useSelector } from "react-redux";
import { RootReduxState } from "@/redux";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/custom/Button";
import { useApi } from "@/hooks/useApi";
import { IconType } from "@/shared/types/IconType";

import Input from "@/components/custom/Input";
import {
  clearAllTrainingsByUser,
  fetchTrainingByUser,
  updateManyTrainingByUser,
} from "@/redux/actions/trainingByUsersActions";
import { ITrainingByUser } from "@/shared/models/ITrainingByUser";
import { ITraining } from "@/shared/models/ITraining";
import {
  clearAllExercises,
  fetchExercise,
} from "@/redux/actions/exerciseActions";
import { fetchExerciseHistory } from "@/redux/actions/exerciseHistoryActions";
import { useCheckInternetConnection } from "@/hooks/useCheckInternetConnection";

export default function TrainingByUserListStack() {
  const { unifiedGroup } = useSelector((state: RootReduxState) => state.group);
  const { call } = useApi();
  const dispatch = useDispatch();
  const { checkInternetConnection } = useCheckInternetConnection();
  const {
    trainingId,
    trainingList: trainingListJson,
    trainingByUser: trainingByUserJson,
  } = useLocalSearchParams();

  const { list: exerciseList, loading: loadingExercise } = useSelector(
    (state: RootReduxState) => state.exercise,
  );

  const [exercises, setExercise] = useState<IExercise[]>([]);
  const [originalExercises, setOriginalExercises] = useState<IExercise[]>([]);
  const { trainingByUserList, loading: loadingTrainingByUser } = useSelector(
    (state: RootReduxState) => state.trainingByUser,
  );

  const { t } = useTranslation();

  const router = useRouter();

  const trainingByUser = useMemo(() => {
    return trainingByUserJson
      ? (JSON.parse(trainingByUserJson as string) as ITrainingByUser)
      : [];
  }, [trainingByUserJson]);

  const trainingList = useMemo(() => {
    return trainingListJson
      ? (JSON.parse(trainingListJson as string) as ITraining[])
      : [];
  }, [trainingListJson]);

  const isLoading = useMemo(
    () => loadingTrainingByUser,
    [loadingTrainingByUser],
  );

  const handleSearch = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
    const text = e.nativeEvent.text;

    if (text.trim() === "") {
      setExercise(originalExercises);
      return;
    }

    const filteredExercises = originalExercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(text.toLowerCase()),
    );

    if (filteredExercises.length === 0) {
      setExercise([]);
      return;
    }

    setExercise(filteredExercises);
  };

  const onConfirmFinalizeExercises = () => {
    Alert.alert(
      t(AppMessagesEnum.EXERCISE_SCREEN_FINALIZE_EXERCISES_BUTTON),
      t(AppMessagesEnum.EXERCISE_SCREEN_FINALIZE_EXERCISES_CONFIRMATION),
      [
        {
          text: t(AppMessagesEnum.CANCEL),
          style: "cancel",
        },
        {
          text: t(AppMessagesEnum.FINALIZE),
          onPress: onFinalizeExercises,
        },
      ],
    );
  };

  const onFinalizeExercises = () => {
    call({
      loading: true,
      try: async (toast) => {
        const training = trainingList.find(
          (training: ITraining) => training.id === trainingId,
        );

        if (!training) {
          throw new Error(t(AppMessagesEnum.TRAINING_ID_NOT_FOUND));
        }

        await checkInternetConnection();

        const allTrainingsMade = trainingByUserList?.every(
          (trainingByUser: ITrainingByUser) => {
            if (
              trainingByUser.completed ||
              trainingByUser.trainingId === training.id
            ) {
              return true;
            }
          },
        );

        if (allTrainingsMade) {
          // await dispatch(clearTrainingsMade());
          await dispatch(clearAllTrainingsByUser());
          await dispatch(clearAllExercises());
          await dispatch(fetchTrainingByUser());
          await dispatch(fetchExercise());
          await dispatch(fetchExerciseHistory());

          toast.show({
            type: "success",
            text1: t(AppMessagesEnum.USER_EXERCISE_ALL_TRAININGS_COMPLETED),
          });

          router.back();
          return;
        }

        if (!trainingByUser) {
          throw new Error(t(AppMessagesEnum.TRAINING_BY_USER_NOT_FOUND));
        }

        const updatedTrainingByUser = { ...trainingByUser, completed: true };

        await dispatch(updateManyTrainingByUser([updatedTrainingByUser]));
        await dispatch(clearAllExercises());
        await dispatch(fetchExercise());
        await dispatch(fetchTrainingByUser());
        await dispatch(fetchExerciseHistory());

        toast.show({
          type: "success",
          text1: t(AppMessagesEnum.USER_EXERCISE_TRAINING_COMPLETED),
        });

        router.back();
      },
    });
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchExercise({ ignoreCheckState: true }));
    }, [dispatch]),
  );

  useFocusEffect(
    useCallback(() => {
      const filteredExercises = exerciseList?.filter((exercise: any) =>
        exercise.trainingIds.includes(trainingId),
      );

      if (!filteredExercises) {
        setExercise([]);
        setOriginalExercises([]);
        return;
      }

      setExercise(filteredExercises);
      setOriginalExercises(filteredExercises);
    }, []),
  );

  const ListWithSkeleton = useAddSkeletonListHOC({
    isLoading,
    emptyListMessage: t(AppMessagesEnum.TRAINING_ID_NOT_FOUND),
    list: exercises,
    component: (
      <>
        {exercises && exercises.length > 0 && (
          <FlatList
            showsVerticalScrollIndicator
            data={exercises}
            keyExtractor={(item) => item.id}
            renderItem={(exercise) => {
              const sourceImage = exercise?.item?.imagePath
                ? { uri: exercise?.item?.imagePath }
                : require("@/assets/images/default-exercise.jpg");

              const isExerciseCompleted = exercise?.item?.completed || false;

              const centerIcon: { centerIcon: IconType } | {} =
                isExerciseCompleted
                  ? { centerIcon: "check-circle" as const }
                  : {};

              return (
                <View style={styles.cardWrapper} key={exercise.item.id}>
                  <Card
                    leftLabel={exercise.item.name}
                    source={sourceImage}
                    {...centerIcon}
                    onPress={() => {
                      router.push({
                        pathname:
                          "/(authenticated)/(stacks)/(StacksByExercisesTab)/userExerciseStack/",
                        params: {
                          exercise: JSON.stringify(exercise.item),
                          trainingByUser: JSON.stringify(trainingByUser),
                        },
                      });
                    }}
                  />
                </View>
              );
            }}
          />
        )}
      </>
    ),
  });

  return (
    <Container style={styles.container}>
      <Input
        leftIcon="search"
        label={t(AppMessagesEnum.SEARCH)}
        style={styles.inputSearch}
        onChange={handleSearch}
        editable={!isLoading}
      />
      <ListWithSkeleton />
      <Button
        title={t(AppMessagesEnum.USER_EXERCISE_FINISH_TRAIN)}
        onPress={onConfirmFinalizeExercises}
        disabled={
          isLoading ||
          !unifiedGroup.drawerMenu.home.tabs.exercises.finalizeTrainingButton
            .permitted
        }
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  view: { flex: 1, width: "100%" },
  cardWrapper: {
    marginBottom: 10,
  },
  inputSearch: {
    marginBottom: 10,
  },
});
