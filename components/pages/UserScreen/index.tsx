import { Button } from "@/components/custom/Button";
import { View, StyleSheet, ScrollView } from "react-native";

import Container from "../../custom/Container";
import Input from "../../custom/Input";
import Text from "../../custom/Text";

import { SeverityEnum } from "@/shared/enum/SeverityEnum";
import { Skeleton } from "../../custom/Skeleton";
import { IAcademy } from "@/shared/models/IAcademy";
import { IUser } from "@/shared/models/IUser";
import Dropdown from "../../custom/Dropdown";
import { generateDropdownOptions } from "@/shared/utils/generateDropdownOptions";
import { useMemo, useState } from "react";
import UserImage from "../../custom/UserImage";
import { useTranslation } from "@/hooks/useTranslation";
import { AppMessagesEnum } from "@/shared/enum/AppMessagesEnum";
import { IGroup } from "@/shared/models/IGroup";
import { useCreateListItem } from "@/components/custom/List/useCreateListItem";
import List from "@/components/custom/List";
import { Dispatch } from "@/shared/types/ReducerTypes";
import { ExtendedUserState } from "@/app/(authenticated)/(stacks)/(userStacks)/userReducer";
import { RootReduxState } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import Checkbox from "@/components/custom/Checkbox";

type UserScreenProps = {
  isLoading?: boolean;
  user: IUser;
  academyList: IAcademy[];
  groupList: IGroup[];
  onSave: () => Promise<void>;
  onRemove?: () => Promise<void>;
  dispatch: Dispatch<ExtendedUserState>;
  isNewUser?: boolean;
};

export default function UserScreen({
  isLoading = false,
  onSave,
  user,
  academyList,
  groupList,
  dispatch,
  onRemove,
  isNewUser = false,
}: UserScreenProps) {
  const { user: currentUser } = useSelector(
    (state: RootReduxState) => state.user,
  );
  const { t } = useTranslation();
  const { createListItem } = useCreateListItem();
  const { unifiedGroup } = useSelector((state: RootReduxState) => state.group);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const academyItems = useMemo(
    () => generateDropdownOptions({ list: academyList }),
    [academyList],
  );

  const groupItems = useMemo(
    () => generateDropdownOptions({ list: groupList }),
    [groupList],
  );

  const groupListItem = useMemo(
    () =>
      createListItem({
        list: groupList,
        savedIds: user.groupIds ?? [],
        onDelete: (id) => dispatch({ type: "removeGroupId", payload: id }),
      }),
    [user.groupIds, groupList, dispatch],
  );

  return (
    <Container>
      <ScrollView contentContainerStyle={{ width: "100%" }}>
        <View style={styles.fields}>
          {isLoading ? (
            <Skeleton style={styles.inputWrapper} />
          ) : (
            <View style={styles.inputWrapper}>
              <Input
                label={t(AppMessagesEnum.USER_NAME_LABEL)}
                value={user.name}
                onChange={(e) =>
                  dispatch({ type: "name", payload: e.nativeEvent.text })
                }
              />
            </View>
          )}

          {currentUser?.isAdmin && (
            <View style={styles.inputWrapper}>
              {isLoading ? (
                <Skeleton style={styles.inputWrapper} />
              ) : (
                <Checkbox
                  label={t(AppMessagesEnum.USER_ADMINISTRATOR)}
                  checked={user.isAdmin}
                  onChange={(checked) => {
                    dispatch({ type: "isAdmin", payload: checked });
                  }}
                />
              )}
            </View>
          )}

          {currentUser?.isAdmin && (
            <View style={styles.inputWrapper}>
              {isLoading ? (
                <Skeleton style={styles.inputWrapper} />
              ) : (
                <Checkbox
                  label={t(AppMessagesEnum.FREE_ACCOUNT)}
                  checked={user.isFree}
                  onChange={(checked) => {
                    dispatch({ type: "isFree", payload: checked });
                  }}
                />
              )}
            </View>
          )}

          {isLoading ? (
            <Skeleton style={styles.inputWrapper} />
          ) : (
            <View style={styles.inputWrapper}>
              <Input
                editable={isNewUser}
                label={t(AppMessagesEnum.USER_EMAIL_LABEL)}
                keyboardType="email-address"
                value={user.email}
                onChange={(e) =>
                  dispatch({ type: "email", payload: e.nativeEvent.text })
                }
              />
            </View>
          )}
          {/**TODO register other document types */}
          {isLoading ? (
            <Skeleton style={styles.inputWrapper} />
          ) : (
            <View style={styles.inputWrapper}>
              <Input
                mask={"CPF"}
                placeholder="999.999.999-99"
                label="CPF"
                value={user.cpf}
                onChange={(e) =>
                  dispatch({ type: "cpf", payload: e.nativeEvent.text })
                }
              />
            </View>
          )}

          {isLoading ? (
            <Skeleton style={styles.inputWrapper} />
          ) : (
            <View style={styles.inputWrapper}>
              <Input
                mask={"PHONE"}
                placeholder="(99) 9999-9999"
                label={t(AppMessagesEnum.USER_PHONE_LABEL)}
                value={user.phoneNumber}
                onChange={(e) =>
                  dispatch({ type: "phoneNumber", payload: e.nativeEvent.text })
                }
              />
            </View>
          )}

          {isLoading ? (
            <Skeleton style={styles.inputWrapper} />
          ) : (
            <Dropdown
              enabled={unifiedGroup.changeAcademy.permitted}
              items={academyItems}
              label={t(AppMessagesEnum.ACADEMY_LIST)}
              selectedValue={user?.academyId || ""}
              setSelectedValue={(value) =>
                dispatch({ type: "academyId", payload: value })
              }
            />
          )}

          {isLoading ? (
            <Skeleton style={styles.inputWrapper} />
          ) : (
            <View style={styles.fieldWithAddButton}>
              <Dropdown
                items={groupItems}
                label={t(AppMessagesEnum.GROUP_LIST)}
                selectedValue={selectedGroupId || ""}
                setSelectedValue={setSelectedGroupId}
                containerStyle={{ width: "50%" }}
              />
              <Button
                icon="plus"
                onPress={() =>
                  dispatch({
                    type: "addGroupId",
                    payload: selectedGroupId || "",
                  })
                }
                style={{ width: 80, height: 55 }}
              />
            </View>
          )}

          <List list={groupListItem} isLoading={isLoading} />

          {!isLoading && user.isAdmin && (
            <View>{<Text>{t(AppMessagesEnum.USER_ADMINISTRATOR)}</Text>}</View>
          )}

          <View style={styles.imageGroup}>
            <UserImage isLoading={isLoading} user={user} />
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <Button
          title={t(AppMessagesEnum.SAVE)}
          onPress={onSave}
          disabled={
            isLoading || !unifiedGroup.drawerMenu.users.update.permitted
          }
        />
        {onRemove && (
          <Button
            disabled={
              isLoading || !unifiedGroup.drawerMenu.users.delete.permitted
            }
            title={t(AppMessagesEnum.USER_REMOVE)}
            onPress={onRemove}
            severity={SeverityEnum.DANGER}
          />
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonWrapper: { width: "100%", gap: 5 },
  button: { flex: 1, width: 350, marginHorizontal: 30 },
  inputWrapper: { width: "100%", minHeight: 40 },
  fields: {
    width: "100%",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imageGroup: {
    width: "90%",
    alignItems: "center",
    gap: 5,
    marginVertical: 10,
  },
  fieldWithAddButton: {
    gap: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
  },
});
