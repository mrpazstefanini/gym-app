import { FlatList, StyleSheet, View } from "react-native";
import Calendar from "@/components/custom/Calendar";
import Container from "@/components/custom/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootReduxState } from "@/redux";
import { useFocusEffect, useRouter } from "expo-router";
import Card from "@/components/custom/Card";
import { WeekDayDescription } from "@/shared/utils/weedaysUtils";
import { ITraining } from "@/shared/models/ITraining";
import { ITrainingByUser } from "@/shared/models/ITrainingByUser";
import useAddSkeletonListHOC from "@/hooks/useAddSkeletonListHOC";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import { IconType } from "@/shared/types/IconType";

export default function SchedulesTab() {
  const { t } = useTranslation();
  const router = useRouter();
  const { list: exerciseList, loading: loadingExercise } = useSelector(
    (state: RootReduxState) => state.exercise
  );
  const { trainingByUserList, loading: loadingTrainingByUser } = useSelector(
    (state: RootReduxState) => state.trainingByUser
  );

  const { list: trainingList, loading: loadingTrainingList } = useSelector(
    (state: RootReduxState) => state.training
  );

  const [isListLoading, setIsListLoading] = useState<boolean>(true);
  const [weekdayActive, setWeekdayActive] = useState<WeekDayDescription | null>(
    null
  );
  const [trainingsByActiveDay, setTrainingsByActiveDay] = useState<ITraining[]>(
    []
  );

  const isLoading = useMemo(
    () =>
      loadingTrainingList ||
      loadingTrainingByUser ||
      loadingExercise ||
      isListLoading,
    [loadingTrainingList, loadingTrainingByUser, loadingExercise, isListLoading]
  );

  useFocusEffect(
    useCallback(() => {
      setIsListLoading(true);
      const trainingByActiveDay = trainingByUserList?.reduce(
        (acc: ITraining[], trainingByUser: ITrainingByUser) => {
          if (
            weekdayActive?.day &&
            trainingByUser.weekDays?.some(
              (weekday) => weekdayActive.day === Number(weekday)
            )
          ) {
            const training = trainingList?.find(
              (tr) => tr.id === trainingByUser.trainingId
            );

            if (training) {
              acc.push(training);
            }
          }

          return acc;
        },
        []
      );

      setTrainingsByActiveDay(trainingByActiveDay || []);
      setIsListLoading(false);
    }, [trainingByUserList, trainingList, weekdayActive])
  );

  const ListWithSkeleton = useAddSkeletonListHOC({
    isLoading,
    emptyListMessage: t(AppMessagesEnum.TRAINING_ID_NOT_FOUND),
    list: trainingList ?? [],
    component: (
      <FlatList
        showsVerticalScrollIndicator
        data={trainingsByActiveDay}
        keyExtractor={(item) => item.id}
        renderItem={(training) => {
          const trainingByUser = trainingByUserList?.find(
            (tbu) => tbu.trainingId === training.item.id
          );

          const sourceImage = training?.item?.imagePath
            ? { uri: training?.item?.imagePath }
            : require("@/assets/images/default-exercise.jpg");

          const centerIcon: { centerIcon: IconType } | {} =
            trainingByUser?.completed
              ? { centerIcon: "check-circle" as const }
              : {};

          return (
            <View style={styles.cardWrapper} key={training.item.id}>
              <Card
                onPress={() => {
                  router.push({
                    pathname:
                      "/(authenticated)/(stacks)/(StacksByExercisesTab)/trainingByUserListStack/",
                    params: {
                      trainingName: training.item.name,
                      trainingId: training.item.id,
                      trainingList: JSON.stringify(trainingList),
                      trainingByUser: JSON.stringify(trainingByUser),
                    },
                  });
                }}
                {...centerIcon}
                leftLabel={training.item.name}
                source={sourceImage}
                isLoading={isLoading}
              />
            </View>
          );
        }}
      />
    ),
  });

  return (
    <Container style={styles.container}>
      <Calendar
        weekdayActive={weekdayActive}
        setWeekdayActive={setWeekdayActive}
      />

      <View style={styles.listView}>
        <ListWithSkeleton />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
  },
  listView: { flex: 1, width: "100%" },
  cardWrapper: {
    marginBottom: 10,
  },
});
