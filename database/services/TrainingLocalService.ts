import { Realm } from "@realm/react";
import { BaseLocalService } from "./BaseLocalService";
import { processLocalData } from "@/shared/utils/processLocalData";
import { ITraining } from "@/shared/models/ITraining";

export class TrainingLocalService extends BaseLocalService<ITraining> {
  constructor(getRealm: () => Realm) {
    super(getRealm, "Training");
  }

  getByAcademy(academyId: string): ITraining[] {
    return Array.from(
      this.getRealm()
        .objects<ITraining>("Training")
        .filtered("academyId == $0 AND isDeleted == false", academyId)
        .sorted("name"),
    );
  }

  getByTraining(trainingId: string): ITraining[] {
    return Array.from(
      this.getRealm()
        .objects<ITraining>("Training")
        .filtered(
          "trainingIds != null AND ANY trainingIds == $0 AND isDeleted == false",
          trainingId,
        )
        .sorted("name"),
    );
  }

  saveList(trainings: ITraining[]): void {
    this.getRealm().write(() => {
      trainings.forEach((training) => {
        const processedData = processLocalData(training);
        this.getRealm().create("Training", processedData, Realm.UpdateMode.Modified);
      });
    });
  }

  resetAll(): void {
    this.getRealm().write(() => {
      const allTrainings = this.getRealm().objects<ITraining>("Training");
      this.getRealm().delete(allTrainings);
    });
  }
}
