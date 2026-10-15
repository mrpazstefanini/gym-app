import { Realm } from "@realm/react";
import { BaseLocalService } from "./BaseLocalService";
import { processLocalData } from "@/shared/utils/processLocalData";
import { ITrainingByUser } from "@/shared/models/ITrainingByUser";
import { log } from "@/shared/utils/log";

export class TrainingByUserLocalService extends BaseLocalService<ITrainingByUser> {
  constructor(getRealm: () => Realm) {
    super(getRealm, "TrainingByUser");
  }

  getByAcademy(academyId: string): ITrainingByUser[] {
    return Array.from(
      this.getRealm()
        .objects<ITrainingByUser>("TrainingByUser")
        .filtered("academyId == $0 AND isDeleted == false", academyId)
        .sorted("name"),
    );
  }

  saveList(trainings: ITrainingByUser[]): void {
    this.getRealm().write(() => {
      trainings.forEach((training) => {
        const processedData = processLocalData(training);
        processedData.weekDays = processedData.weekDays?.map((day) =>
          Number(day),
        );
        this.getRealm().create(
          "TrainingByUser",
          processedData,
          Realm.UpdateMode.Modified,
        );
      });
    });
  }

  resetAll(): void {
    this.getRealm().write(() => {
      const allTrainings =
        this.getRealm().objects<ITrainingByUser>("TrainingByUser");
      this.getRealm().delete(allTrainings);
    });
  }

  updateMany(
    trainingByUserList: Partial<ITrainingByUser>[],
  ): ITrainingByUser[] {
    let updatedTrainingByUserList: ITrainingByUser[] = [];

    this.getRealm().write(() => {
      trainingByUserList.forEach((trainingByUserData) => {
        if (!trainingByUserData.id) return;

        const existingTrainingByUser =
          this.getRealm().objectForPrimaryKey<ITrainingByUser>(
            "TrainingByUser",
            trainingByUserData.id,
          );

        if (existingTrainingByUser) {
          const processedData = processLocalData(
            trainingByUserData as ITrainingByUser,
          );

          Object.keys(processedData).forEach((key) => {
            try {
              // @ts-ignore
              existingTrainingByUser[key] = processedData[key];
            } catch (e) {
              log(`Error updating key ${key}:`, e);
            }
          });

          updatedTrainingByUserList.push(existingTrainingByUser);
        }
      });
    });
    return updatedTrainingByUserList;
  }
}
