import { IAcademy } from "@/shared/models/IAcademy";
import { Realm } from "@realm/react";
import { BaseLocalService } from "./BaseLocalService";

export class AcademyLocalService extends BaseLocalService<IAcademy> {
  constructor(getRealm: () => Realm) {
    super(getRealm, "Academy");
  }

  // Métodos específicos para Academy
  getByName(name: string): IAcademy | null {
    const academies = this.getRealm()
      .objects<IAcademy>("Academy")
      .filtered("name == $0 AND isDeleted == false", name);

    return academies.length > 0 ? academies[0] : null;
  }

  resetAll(): void {
    this.getRealm().write(() => {
      const allAcademies =
        this.getRealm().objects<IAcademy>("Academy");
      this.getRealm().delete(allAcademies);
    });
  }
}
