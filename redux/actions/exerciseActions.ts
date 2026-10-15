import { LocalDatabaseServices } from "@/database/types/LocalDatabaseServices";
import { ExerciseServices } from "@/services/ExerciseServices";
import { IExercise } from "@/shared/models/IExercise";
import { log } from "@/shared/utils/log";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootReduxState } from "../index";
import { ApiRequestType } from "@/shared/types/ApiRequestType";
import { toPlainObject } from "@/database/utils/toPlainObject";

/**
 * @description the first parameter from  async (input: Input, { getState, rejectWithValue })
 */
type Input = { dataBase?: LocalDatabaseServices; ignoreCheckState?: boolean } | void;

type Output = IExercise[] | null;

type State = {
    state: RootReduxState;
    rejectValue: string;
    extra: { databaseService: LocalDatabaseServices, getDatabaseService: () => LocalDatabaseServices | null }
};

export const fetchExercise = createAsyncThunk<Output, Input, State>(
  'exercise/fetchExercise',
  async (inputData, { getState, rejectWithValue, extra }): Promise<Output | ReturnType<typeof rejectWithValue>> => {
    try {
      const state: RootReduxState = getState();

      // ✅ Skip Redux cache check if ignoreCheckState is true
      if (!inputData?.ignoreCheckState) {
        const exerciseList = state.exercise.list ?? [];
        if (exerciseList.length > 0) {
          log("exercise found in Redux state");
          return exerciseList;
        }
      }

      const databaseLocalService = inputData?.dataBase ?? extra.getDatabaseService();

      if (!databaseLocalService) {
        return rejectWithValue('Database service not available');
      }

      const exerciseList = databaseLocalService.exerciseLocalService?.getAll();

      if (exerciseList?.length > 0) {
        log("exercise found in the local database");
        const plainList = toPlainObject(exerciseList) as Output;
        return plainList;
      }

      const user = state.user?.user;
      if (!user) {
        return rejectWithValue('User not authenticated') as any;
      }

      const res = await ExerciseServices.getAll();
      
      if (res?.length > 0) {
        databaseLocalService.exerciseLocalService?.saveList(res);
        return res;
      }

      return [];
    } catch (error) {
      log("Error fetching exercises:", error);
      return rejectWithValue('Failed to fetch exercises');
    }
  }
);

export const updateExercise = createAsyncThunk<IExercise | null, ApiRequestType<IExercise & { changeOnlyLocally?: boolean }>, State>(
    'exercise/updateExercise',
    async (exerciseData, { getState, rejectWithValue, extra }) => {
        try {

            //  1. Update in the API
            if (!exerciseData?.changeOnlyLocally) {
                const res = await ExerciseServices.update(exerciseData);

                if (!res) {
                    return rejectWithValue('No response from API');
                }
            }

            //  2. Update in the local database
            const databaseLocalService = extra.getDatabaseService();

            if (databaseLocalService && exerciseData?.id) {
                const res = await databaseLocalService.exerciseLocalService?.createOrUpdate(exerciseData.id, exerciseData);
                if (!res) {
                    return rejectWithValue('Failed to update exercise in local database');
                }
                return JSON.parse(JSON.stringify(res)) as IExercise;
            }

            return null;
        } catch (error) {
            log("Error updating exercise:", error);
            return rejectWithValue('Failed to update exercise');
        }
    }
);


export const clearAllExercises = createAsyncThunk<void, void, State>(
    'exercise/clearAllExercises',
    async (_, { getState, rejectWithValue, extra }) => {
        try {
            const databaseLocalService = extra.getDatabaseService();

            if (databaseLocalService) {
                databaseLocalService.exerciseLocalService?.resetAllExercisesMade();
            }

        } catch (error) {
            log("Error clearing all exercises:", error);
            return rejectWithValue('Failed to clear all exercises');
        }
    }
);
