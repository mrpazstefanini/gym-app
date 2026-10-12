import { LOAD_ALL, RESET } from "@/shared/constants/reducerConsts";
import { IUser } from "@/shared/models/IUser";
import { ActionType } from "@/shared/types/ReducerTypes";

export interface ExtendedUserState extends IUser {
  addGroupId: string;
  removeGroupId: string;
}

export const initialUser: ExtendedUserState = {
  name: "",
  email: "",
  isAdmin: false,
  createdAt: new Date(),
  id: "",
  profilePhoto: undefined,
  cpf: undefined,
  phoneNumber: undefined,
  groupIds: undefined,
  academyId: undefined,
  addGroupId: "",
  removeGroupId: "",
  isFree: false,
};

export default function userReducer(
  state: ExtendedUserState,
  action: ActionType<ExtendedUserState>
): ExtendedUserState {
  switch (action.type) {
    // Casos para propriedades diretas do IUser
    case "name":
    case "email":
    case "isAdmin":
    case "createdAt":
    case "id":
    case "profilePhoto":
    case "cpf":
    case "phoneNumber":
    case "groupIds":
    case "academyId":
    case "isFree":
      return { ...state, [action.type]: action.payload };
    case "isFree":
      return { ...state, isFree: action.payload };

    case "addGroupId":
      if (state.groupIds?.includes(action.payload as string)) {
        return state;
      }

      return {
        ...state,
        groupIds: state.groupIds
          ? [...state.groupIds, action.payload as string]
          : [action.payload as string],
      };

    case "removeGroupId":
      return {
        ...state,
        groupIds: state.groupIds
          ? state.groupIds.filter(
            (rep) => rep !== (action.payload as string)
          )
          : [],
      };

    case LOAD_ALL:
      const user = action.payload as ExtendedUserState;
      return {
        ...user,
      };

    case RESET:
      return initialUser;

    default:
      return state;
  }
}
