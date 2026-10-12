
import { fetchUser } from "@/redux/actions/userActions";
import { UserWithTokens } from "@/services/AuthServices/types";
import { IUser } from "@/shared/models/IUser";
import { useDispatch } from "react-redux";

export default function useFetchUser() {
    const dispatchRedux = useDispatch();

    const getUser = async (): Promise<IUser> => {
        const data: { payload: UserWithTokens } = await dispatchRedux(
            fetchUser()
        );

        const user: IUser = {
            name: data.payload.name,
            email: data.payload.email,
            isAdmin: data.payload.isAdmin,
            profilePhoto: data.payload.profilePhoto,
            cpf: data.payload.cpf,
            phoneNumber: data.payload.phoneNumber,
            groupIds: data.payload.groupIds,
            academyId: data.payload.academyId,
            id: data.payload.id,
            isFree: data.payload.isFree,
            createdAt: data.payload.createdAt,
            updatedAt: data.payload.updatedAt,
        }

        return user;
    }

    return { getUser };
}