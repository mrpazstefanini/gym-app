import { IDefaultEntityProperties } from "../interfaces/IDefaultEntityProperties";
import { IdType } from "../interfaces/IdType";
export interface IUser extends IDefaultEntityProperties {
  name: string;
  email: string;
  isAdmin: boolean;
  profilePhoto?: string;
  cpf?: string;
  phoneNumber?: string;
  groupIds?: IdType[];
  academyId?: IdType;
  refreshToken?: string;
  isFree: boolean;
}



