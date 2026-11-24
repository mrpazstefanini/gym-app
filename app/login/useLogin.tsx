import { AuthContext } from "@/contexts/authContext";
import { useApi } from "@/hooks/useApi";
import { AuthServices } from "@/services/AuthServices";
import { SigninCreateReq, UserWithTokens } from "@/services/AuthServices/types";

import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { useContext } from "react";
import { useDispatch } from "react-redux";
import { log } from "@/shared/utils/log";
import { useTranslation } from "@/hooks/useTranslation";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import { addUser } from "@/redux/actions/userActions";
import { AppInitContext } from "@/contexts/appInitializerContext";

export default function useLogin() {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { call } = useApi();
  const dispatch = useDispatch();
  const { initializeUserData } = useContext(AppInitContext);

  const handleGoogleSignIn = async () => {
    call({
      loading: true,
      try: async (toast: any) => {
        log("Iniciando Google Sign-In...");
        await GoogleSignin.hasPlayServices();
        log("Play Services OK");

        const response = await GoogleSignin.signIn();
        log("Google Sign-In resposta:", response);

        if (!isSuccessResponse(response)) {
          throw new Error(t(AppMessagesEnum.LOGIN_ERROR));
        }

        log("Google Sign-In Response:", response.data);
        const authCode = response.data.serverAuthCode ?? "";
        const token = response.data.idToken ?? "";
        const email = response.data.user.email;
        const profilePhoto = response.data.user.photo ?? undefined;
        const name = response.data.user.name ?? "No Name";

        if (!token || !authCode) {
          throw new Error(t(AppMessagesEnum.LOGIN_ERROR));
        }

        const requestBody: SigninCreateReq = {
          name,
          profilePhoto,
          email,
          token,
          authCode,
          isAdmin: false,
        };

        log("Request body for backend:", requestBody);

        const data: UserWithTokens =
          await AuthServices.createOrLogin(requestBody);

        log("User data from backend:", data);

        log("Response signin-create received:", {
          hasBackendToken: Boolean(data?.token),
        });

        if (!data) {
          throw new Error(t(AppMessagesEnum.LOGIN_ERROR));
        }

        log("Dispatching loginUser with data:", data);
        await authContext.logIn(data);
        log('authContext.logIn concluído');

        await dispatch(addUser(data));
        await initializeUserData({ willFetchUser: false });

        toast.show({
          type: "success",
          text1: t(AppMessagesEnum.LOGIN_SUCCESS),
          text2: t(AppMessagesEnum.LOGIN_SUCCESS_MESSAGE),
        });
      },
    });
  };

  return {
    handleGoogleSignIn,
  };
}
