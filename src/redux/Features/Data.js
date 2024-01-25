import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  apiType: "get",
  apiUrl: null,
  navTab: 0,
};

const StoredData = createSlice({
  name: "data",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },

    setApiType: (state, action) => {
      state.apiType = action.payload;
    },

    setApiUrl: (state, action) => {
      state.apiType = action.payload;
    },

    setNavTab: (state, action) => {
      state.navTab = action.payload;
    },
  },
});

export const { setUsers, setApiType, setApiUrl, setNavTab } =
  StoredData.actions;

export default StoredData.reducer;
