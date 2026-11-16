import React, { useState } from "react";
import { Button, StyleSheet, ImageSourcePropType } from "react-native";

import { ExternalLink } from "./ExternalLink";
import { MonoText } from "./StyledText";
import { Text, View } from "./Themed";

import {
  GoogleSignin,
  isSuccessResponse,
  User,
} from "@react-native-google-signin/google-signin";
import { Colors } from "@/shared/constants/Colors";
import { log } from "@/shared/utils/log";
import CustomImage from "./CustomImage";
import { IOS_ID, WEB_ID } from "@/shared/constants/envConstants";

console.log('🔧 [Login] WEB_ID being used:', WEB_ID);
console.log('🔧 [Login] IOS_ID being used:', IOS_ID);

GoogleSignin.configure({
  iosClientId: IOS_ID,
  webClientId: WEB_ID,
  offlineAccess: true,
});

export default function EditScreenInfo({ path }: { path: string }) {
  const [auth, setAuth] = useState<User | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        log("Google Sign-In Response:", response.data);
        setAuth(response.data);
      }
    } catch (e) {
      log(e);
    }
  };

  return (
    <View>
      <View style={styles.getStartedContainer}>
        <Text
          style={styles.getStartedText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Open up the code for this screen:
        </Text>

        <View
          style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
          darkColor="rgba(255,255,255,0.05)"
          lightColor="rgba(0,0,0,0.05)"
        >
          <MonoText>{path}</MonoText>
        </View>

        <Text
          style={styles.getStartedText}
          lightColor="rgba(0,0,0,0.8)"
          darkColor="rgba(255,255,255,0.8)"
        >
          Change any of the text, save the file, and your app will automatically
          update.
        </Text>
      </View>

      <View style={styles.helpContainer}>
        <ExternalLink
          style={styles.helpLink}
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet"
        >
          <Text style={styles.helpLinkText} lightColor={Colors.light.tint}>
            Tap here if your app doesn't automatically update after making
            changes
          </Text>
        </ExternalLink>
        <Button title="Sign in with Google" onPress={handleGoogleSignIn} />

        {auth && (
          <>
            <Text style={{ marginTop: 20, textAlign: "center" }}>
              Welcome, {auth?.user.name}
            </Text>
            <Text style={{ textAlign: "center" }}>{auth?.user.email}</Text>
            <CustomImage
              source={{ uri: auth?.user.photo } as ImageSourcePropType}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                marginTop: 10,
              }}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: "center",
  },
});
