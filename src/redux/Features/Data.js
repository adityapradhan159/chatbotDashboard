import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  
   users:[],
   apiType:"get"

};

const StoredData = createSlice({
  name: "data",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload
    },

    setApiType: (state, action) => {
      state.apiType = action.payload
    },
  },
});

export const { setUsers,setApiType} = StoredData.actions;

export default StoredData.reducer;
