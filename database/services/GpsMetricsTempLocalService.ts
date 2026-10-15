import { Realm } from "@realm/react";
import { BaseLocalService } from "./BaseLocalService";
import { processLocalData } from "@/shared/utils/processLocalData";
import { IGpsMetricsTemp } from "@/shared/models/IGpsMetricsTemp";
import { log } from "@/shared/utils/log";
import { generateId } from "@/shared/utils/generateId";

export class GpsMetricsTempLocalService extends BaseLocalService<IGpsMetricsTemp> {
  constructor(getRealm: () => Realm) {
    super(getRealm, "GpsMetricsTemp");
  }

  getByAcademy(academyId: string): IGpsMetricsTemp[] {
    return Array.from(
      this.getRealm()
        .objects<IGpsMetricsTemp>("GpsMetricsTemp")
        .filtered("academyId == $0 AND isDeleted == false", academyId)
        .sorted("name"),
    );
  }

  saveList(exercises: IGpsMetricsTemp[]): void {
    this.getRealm().write(() => {
      exercises.forEach((exerciseByUser) => {
        const processedData = processLocalData(exerciseByUser);
        this.getRealm().create(
          "GpsMetricsTemp",
          processedData,
          Realm.UpdateMode.Modified,
        );
      });
    });
  }

  deleteByExerciseId(exerciseId: string): boolean {
    const itemsToDelete = this.getRealm()
      .objects<IGpsMetricsTemp>("GpsMetricsTemp")
      .filtered("exerciseId == $0", exerciseId);

    if (itemsToDelete.length > 0) {
      this.getRealm().write(() => {
        this.getRealm().delete(itemsToDelete);
      });
      return true;
    }
    return false;
  }

  createOrUpdate(
    exerciseId: string,
    updateData: IGpsMetricsTemp,
  ): IGpsMetricsTemp | null {
    log(
      "Updating or creating GPS metrics temp with exerciseId:",
      exerciseId,
      "and data:",
      updateData,
    );

    let gpsMetrics = this.getRealm()
      .objects<IGpsMetricsTemp>("GpsMetricsTemp")
      .filtered("exerciseId == $0", exerciseId)[0];

    let result: IGpsMetricsTemp | null = null;

    this.getRealm().write(() => {
      const existingId = gpsMetrics?.id;
      // Processa os dados SEM serialização JSON para preservar os objetos embedded
      const processedData = processLocalData(updateData, true);

      // Garante que as datas são objetos Date
      processedData.createdAt =
        processedData.createdAt instanceof Date
          ? processedData.createdAt
          : new Date(processedData.createdAt);
      processedData.updatedAt =
        processedData.updatedAt instanceof Date
          ? processedData.updatedAt
          : new Date(processedData.updatedAt ?? Date.now());

      if (gpsMetrics) {
        // Update existing - deleta e recria
        this.getRealm().delete(gpsMetrics);
      }

      // Create new
      const newData = {
        ...processedData,
        exerciseId: exerciseId,
        id: existingId || generateId(),
      } as IGpsMetricsTemp;

      log("Creating/Recreating GPS metrics temp:", newData);
      result = this.getRealm().create("GpsMetricsTemp", newData);
    });

    log("Result of createOrUpdate for GPS metrics temp:", result);
    return result;
  }

  resetAll(): void {
    this.getRealm().write(() => {
      const allGroups = this.getRealm().objects<IGpsMetricsTemp>("GpsMetricsTemp");
      log("Resetting all GPS metrics temp:", allGroups);
      this.getRealm().delete(allGroups);
    });
  }
}
