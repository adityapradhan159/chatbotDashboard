import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  
    showComponent:""

};

const SelectedComponent = createSlice({
  name: "component",
  initialState,
  reducers: {
    setShowComponent: (state, action) => {
      state.showComponent = action.payload
    },
  },
});

export const { setShowComponent } = SelectedComponent.actions;

export default SelectedComponent.reducer;
