import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  
   users:[]

};

const StoredData = createSlice({
  name: "data",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload
    },
  },
});

export const { setUsers } = StoredData.actions;

export default StoredData.reducer;
