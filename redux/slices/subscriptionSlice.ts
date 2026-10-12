import { createSlice, PayloadAction } from "@reduxjs/toolkit";


import { fetchSubscription } from "../actions/subscriptionActions";
import { ISubscriptionByUserData } from "@/services/PaymentSubscriptionServices/interfaces";

export interface SubscriptionState {
  subscriptionList: ISubscriptionByUserData[] | null;
  isFree: boolean;
  loading: boolean;
  error?: string;
}

const initialState: SubscriptionState = {
  subscriptionList: null,
  isFree: false,
  loading: false,
  error: undefined,
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSubscriptionListState: (
      state,
      action: PayloadAction<ISubscriptionByUserData[]>,
    ) => {
      state.subscriptionList = action.payload;
    },
    clearSubscriptionState: (state) => {
      state.subscriptionList = [];
    },
  },
  extraReducers: (builder) => {
    // getting data
    builder.addCase(fetchSubscription.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    });
    builder.addCase(fetchSubscription.fulfilled, (state, action) => {
      state.subscriptionList = action.payload.subscriptions;
      state.isFree = action.payload.isFree;
      state.loading = false;
    });
    builder.addCase(fetchSubscription.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export const { setSubscriptionListState, clearSubscriptionState } =
  subscriptionSlice.actions;
export default subscriptionSlice.reducer;
