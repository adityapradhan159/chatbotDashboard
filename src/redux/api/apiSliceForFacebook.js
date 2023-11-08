import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSliceForFacebook = createApi({
  reducerPath: 'apiSliceForFacebook',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://graph.facebook.com/v18.0' }),
  endpoints: () => ({}),
});