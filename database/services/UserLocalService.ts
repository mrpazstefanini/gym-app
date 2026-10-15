import { Realm } from "@realm/react";
import { BaseLocalService } from "./BaseLocalService";
import {
  RefreshTokenData as RefreshTokenData,
  UserWithTokens,
} from "@/services/AuthServices/types";
import { IGoogleTokens } from "@/shared/interfaces/IGoogleTokens";
import { processLocalData } from "@/shared/utils/processLocalData";
import { log } from "@/shared/utils/log";

export class UserLocalService extends BaseLocalService<UserWithTokens> {
  constructor(getRealm: () => Realm) {
    super(getRealm, "User");
  }

  getUser(): UserWithTokens {
    return this.getRealm().objects<UserWithTokens>("User")[0];
  }

  updateUserTokens(data: RefreshTokenData): UserWithTokens | null {
    const user = this.getUser();
    if (!user) return null;
    return this.createOrUpdate(user.id.toString(), {
      token: data.token,
      googleTokens: data.googleTokens,
    });
  }

  saveUser(userData: UserWithTokens): UserWithTokens {
    try {
      log("Salvando usuário no banco local:", userData);

      const processedData = processLocalData(userData);
      log("Processed User Data for Local Storage:", processedData);

      // Buscar usuário existente
      const existingUser = this.getRealm().objects<UserWithTokens>("User")[0];

      // Se existe um usuário
      if (existingUser) {
        // Se é o mesmo usuário (mesmo email), apenas atualizar
        if (existingUser.email === processedData.email) {
          log("Atualizando usuário existente:", existingUser.id);
          this.createOrUpdate(existingUser.id.toString(), processedData);
          return this.getRealm().objects<UserWithTokens>("User")[0];
        }

        // Se é um usuário diferente, deletar o antigo
        log("Usuário diferente detectado, removendo usuário antigo");
        this.resetAll();
      }

      // Criar novo usuário (seja primeiro login ou após deletar o antigo)
      let savedUser: UserWithTokens;
      this.getRealm().write(() => {
        log("Criando novo usuário:", processedData.id);
        savedUser = this.getRealm().create<UserWithTokens>(
          "User",
          processedData,
          Realm.UpdateMode.Modified, // Permite update se já existir com mesmo ID
        );
      });

      if (!savedUser!) {
        throw new Error("Failed to save user");
      }

      log("Usuário salvo com sucesso");
      return savedUser!;
    } catch (error) {
      log("Erro ao salvar usuário:", error);
      throw error;
    }
  }

  updateTokens(
    userId: string,
    token: string,
    googleTokens: IGoogleTokens,
  ): UserWithTokens | null {
    return this.createOrUpdate(userId, { token, googleTokens });
  }

  resetAll() {
    log("Resetando dados do usuário local...");
    const allUsers = this.getRealm().objects<UserWithTokens>("User");
    this.getRealm().write(() => {
      this.getRealm().delete(allUsers);
    });
    log("Dados do usuário local resetados com sucesso.");
  }
}
