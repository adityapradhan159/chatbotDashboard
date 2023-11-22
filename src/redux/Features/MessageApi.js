import { api } from "../api/apiSlice";

const MessageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    seleteduserChat: builder.query({
      query: (user) => {
        // Log the 'number' here
        console.log("Number:", user.number);
        return `api/chat?chatId=${user.number}&whatsAppBusinessAccountId=${localStorage.getItem("whatsAppBusinessAccountId")}`;
      },
      providesTags: ["comments"],
    }),

    postChat: builder.mutation({
      query: (data) => ({
        url: `/api/chat`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["comments"],
    }),
  }),
});

export const {
  useSeleteduserChatQuery,
  usePostChatMutation,
} = MessageApi;
