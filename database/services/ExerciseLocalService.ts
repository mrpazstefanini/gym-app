import { IExercise } from "@/shared/models/IExercise";
import { Realm } from "@realm/react";
import { BaseLocalService } from "./BaseLocalService";
import { processLocalData } from "@/shared/utils/processLocalData";

export class ExerciseLocalService extends BaseLocalService<IExercise> {
  constructor(getRealm: () => Realm) {
    super(getRealm, "Exercise");
  }

  getByAcademy(academyId: string): IExercise[] {
    return Array.from(
      this.getRealm()
        .objects<IExercise>("Exercise")
        .filtered("academyId == $0 AND isDeleted == false", academyId)
        .sorted("name"),
    );
  }

  getByTraining(trainingId: string): IExercise[] {
    return Array.from(
      this.getRealm()
        .objects<IExercise>("Exercise")
        .filtered(
          "trainingIds != null AND ANY trainingIds == $0 AND isDeleted == false",
          trainingId,
        )
        .sorted("name"),
    );
  }

  saveList(exercises: IExercise[]): void {
    this.getRealm().write(() => {
      exercises.forEach((exerciseByUser) => {
        const processedData = processLocalData(exerciseByUser);
        this.getRealm().create("Exercise", processedData, Realm.UpdateMode.Modified);
      });
    });
  }

  createOrUpdate(
    exerciseId: string,
    updateData: Partial<IExercise>,
  ): IExercise | null {
    const exercise = this.getRealm().objectForPrimaryKey<IExercise>(
      "Exercise",
      exerciseId,
    );

    if (exercise) {
      const { id, trainingIds, repetitions, ...primitiveData } = updateData;

      this.getRealm().write(() => {
        // Handle primitive fields
        Object.assign(exercise, primitiveData);

        // Handle trainingIds (string[])
        if (trainingIds !== undefined) {
          (exercise as any).trainingIds = [];
          trainingIds.forEach((tid: string) => {
            (exercise as any).trainingIds.push(tid);
          });
        }

        // Handle repetitions (int[])
        if (repetitions !== undefined) {
          (exercise as any).repetitions = [];
          repetitions.forEach((rep: number) => {
            (exercise as any).repetitions.push(rep);
          });
        }
      });

      return exercise;
    }

    return null;
  }

  resetAll(): void {
    this.getRealm().write(() => {
      const allExercises = this.getRealm().objects<IExercise>("Exercise");
      this.getRealm().delete(allExercises);
    });
  }

  resetAllExercisesMade(): void {
    this.getRealm().write(() => {
      const allExercises = this.getRealm().objects<IExercise>("Exercise");
      allExercises.forEach((exercise) => {
        exercise.completed = false;
      });
    });
  }
}
