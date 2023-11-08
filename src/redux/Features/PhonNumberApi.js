import { apiSliceForFacebook } from "../api/apiSliceForFacebook";

const MessageApi = apiSliceForFacebook.injectEndpoints({
  endpoints: (builder) => ({
    getWhatsAppPhoneNumbers: builder.query({
        query: ({whatsappBusinessAccountId, accessToken}) => {
          return `${whatsappBusinessAccountId}/phone_numbers?access_token=${accessToken}`;
        },
      }),
  }),
});

export const {
  useGetWhatsAppPhoneNumbersQuery,
} = MessageApi;
