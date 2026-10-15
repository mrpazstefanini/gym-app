import { IGroup } from "@/shared/models/IGroup";
import { Realm } from "@realm/react";
import { BaseLocalService } from "./BaseLocalService";
import { processLocalData } from "@/shared/utils/processLocalData";

export class GroupLocalService extends BaseLocalService<IGroup> {
  constructor(getRealm: () => Realm) {
    super(getRealm, "Group");
  }

  getByAcademy(academyId: string): IGroup[] {
    return Array.from(
      this.getRealm()
        .objects<IGroup>("Group")
        .filtered("academyId == $0 AND isDeleted == false", academyId)
        .sorted("name"),
    );
  }

  saveList(exercises: IGroup[]): void {
    this.getRealm().write(() => {
      exercises.forEach((exerciseByUser) => {
        const processedData = processLocalData(exerciseByUser);
        this.getRealm().create("Group", processedData, Realm.UpdateMode.Modified);
      });
    });
  }

  createOrUpdate(
    exerciseId: string,
    updateData: Partial<IGroup>,
  ): IGroup | null {
    const group = this.getRealm().objectForPrimaryKey<IGroup>("Group", exerciseId);

    if (group) {
      const { id, ...dataWithoutPrimaryKey } = updateData;

      this.getRealm().write(() => {
        Object.assign(group, dataWithoutPrimaryKey);
      });
      return group;
    }

    return null;
  }

  resetAll(): void {
    this.getRealm().write(() => {
      const allGroups = this.getRealm().objects<IGroup>("Group");
      this.getRealm().delete(allGroups);
    });
  }
}
