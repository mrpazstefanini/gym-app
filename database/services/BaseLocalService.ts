// src/database/services/BaseService.ts
import { IDefaultEntityProperties } from "@/shared/interfaces/IDefaultEntityProperties";
import { generateId } from "@/shared/utils/generateId";
import { Realm } from "@realm/react";
import { v4 as uuidv4 } from "uuid";

type IdType<T> = T[keyof T];

export class BaseLocalService<
  T extends IDefaultEntityProperties & { id: IdType<T> },
> {
  protected getRealm: () => Realm;
  protected schemaName: string;

  constructor(getRealm: () => Realm, schemaName: string) {
    this.getRealm = getRealm;
    this.schemaName = schemaName;
  }

  // Gerar um novo ID único
  generateId(): string {
    return uuidv4();
  }

  // Criar uma nova entidade
  create(data: Partial<T>): T {
    let result: T;

    this.getRealm().write(() => {
      result = this.getRealm().create(this.schemaName, {
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        ...data,
      }) as unknown as T;
    });

    return result!;
  }

  // Obter todas as entidades não excluídas
  getAll(): T[] {
    return Array.from(
      this.getRealm()
        .objects<T>(this.schemaName)
        .filtered("isDeleted == false")
        .sorted("createdAt", true),
    );
  }

  // Obter uma entidade por ID
  getById(id: IdType<T>): T | null {
    const result = this.getRealm().objectForPrimaryKey<T>(this.schemaName, id);
    return result && !result.isDeleted ? result : null;
  }

  // Atualizar uma entidade
  createOrUpdate(id: IdType<T>, data: Partial<T>): T | null {
    const object = this.getById(id);

    if (!object) return null;

    this.getRealm().write(() => {
      Object.assign(object, {
        ...data,
        updatedAt: new Date(),
      });
    });

    return object;
  }

  // Excluir logicamente uma entidade
  delete(id: IdType<T>): boolean {
    const object = this.getById(id);

    if (!object) return false;

    this.getRealm().write(() => {
      object.isDeleted = true;
      object.updatedAt = new Date();
    });

    return true;
  }

  // Excluir permanentemente uma entidade
  hardDelete(id: IdType<T>): boolean {
    const object = this.getRealm().objectForPrimaryKey<T>(this.schemaName, id);

    if (!object) return false;

    this.getRealm().write(() => {
      this.getRealm().delete(object);
    });

    return true;
  }
}
