import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  apiType: "get",
  apiUrl: null,
  navTab: 0,
  flowData: [],
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
    setFlowData: (state, action) => {
      state.flowData = action.payload;
    },
  },
});

export const { setUsers, setApiType, setApiUrl, setNavTab, setFlowData } =
  StoredData.actions;

export default StoredData.reducer;