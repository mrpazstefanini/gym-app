import { createSlice } from "@reduxjs/toolkit";

export interface StripeState {
  isTestMode: boolean;
  currentKey: string;
}

const initialState: StripeState = {
  isTestMode: false,
  currentKey: "",
};

const stripeSlice = createSlice({
  name: "stripe",
  initialState,
  reducers: {
    toggleStripeTestMode: (state) => {
      state.isTestMode = !state.isTestMode;
    },
  },
});

export const { toggleStripeTestMode } = stripeSlice.actions;
export default stripeSlice.reducer;
