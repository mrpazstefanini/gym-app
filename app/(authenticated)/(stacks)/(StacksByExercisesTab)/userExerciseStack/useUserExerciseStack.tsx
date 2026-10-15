import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootReduxState } from "@/redux";
import { IExerciseHistory } from "@/shared/models/IExerciseHistory";
import useCustomStyle from "@/hooks/useCustomStyle";
import { ITrainingByUser } from "@/shared/models/ITrainingByUser";
import { IExercise } from "@/shared/models/IExercise";

export function useUserExerciseStack() {
  const { colors } = useCustomStyle();
  const { exercise: exerciseJson, trainingByUser: trainingByUserJson } =
    useLocalSearchParams();

  // ✅ Get fresh data from Redux instead of relying solely on stale params
  const { list: exerciseList } = useSelector(
    (state: RootReduxState) => state.exercise,
  );
  const { listExerciseHistory } = useSelector(
    (state: RootReduxState) => state.exerciseHistory,
  );

  const [exercise, filteredHistory] = useMemo(() => {
    // Parse params to get the exercise ID
    const exerciseFromParams = exerciseJson
      ? (JSON.parse(exerciseJson as string) as IExercise)
      : undefined;

    // ✅ Look up fresh data from Redux using the ID
    const freshExercise =
      exerciseList?.find((ex) => ex.id === exerciseFromParams?.id) ??
      exerciseFromParams; // fallback to params if not found

    const filteredHistory = listExerciseHistory?.filter(
      (history: IExerciseHistory) => history.exerciseId === freshExercise?.id,
    ) as IExerciseHistory[];

    return [freshExercise, filteredHistory];
  }, [exerciseJson, exerciseList, listExerciseHistory]); // ✅ Proper dependencies

  const trainingByUser = useMemo(
    () =>
      trainingByUserJson
        ? (JSON.parse(trainingByUserJson as string) as ITrainingByUser)
        : undefined,
    [trainingByUserJson],
  );

  return {
    exercise,
    trainingByUser,
    listExerciseHistory: filteredHistory,
    colors,
  };
}

export type UserExerciseStackReturnType = ReturnType<
  typeof useUserExerciseStack
>;
