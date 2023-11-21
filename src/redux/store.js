import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api/apiSlice";
import { apiSliceForFacebook } from "./api/apiSliceForFacebook";
import SelectedUserReducer from "./Features/SelectedUser";
import SelectedComponent from "./Features/SelectedComponent";
import StoredData from "./Features/Data";

const store = configureStore({
  reducer: {
    SelectedUser: SelectedUserReducer,
    SelectedComponent: SelectedComponent,
    StoredData: StoredData,
    [api.reducerPath]: api.reducer,
    [apiSliceForFacebook.reducerPath]: apiSliceForFacebook.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .concat(apiSliceForFacebook.middleware), // Add the middleware for apiSliceForFacebook
});

export default store;
