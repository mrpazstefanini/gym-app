import { IUser } from "@/shared/models/IUser";
import { post, get, patch, remove } from "../api";
import { ApiRequestType } from "@/shared/types/ApiRequestType";


export class UserServices {
    static async getAll() {
        return get<IUser[]>('/user');
    }

    static async getById(id: string) {
        return get<IUser>(`/user/${id}`);
    }

    static async create(body: ApiRequestType<IUser>) {
        return post<ApiRequestType<IUser>, IUser>('/user', body)
    }

    static async update(body: ApiRequestType<IUser>) {
        return patch<ApiRequestType<IUser>, IUser>(`/user`, body);
    }

    static async delete(id: string) {
        const response = await remove<{ message: string }>(`/user/${id}`);
        return response.message;
    }

    static async getLoggedUser() {
        return get<IUser>('/user/logged-user');
    }


    static async getByEmail(email: string) {
        return get<IUser>(`/user/email/${email}`);
    }

}   