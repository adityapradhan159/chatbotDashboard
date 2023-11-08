import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name:"",
number:"",

};

const SelectedUser = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSelectedUsers: (state, action) => {
      state.name =action.payload.name;
      state.number =action.payload.number;
    },
  },
});

export const { setSelectedUsers } = SelectedUser.actions;

export default SelectedUser.reducer;
