import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://pfv4xcnqev.ap-south-1.awsapprunner.com/api',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');

      return headers;
    }
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials.data
      })
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST'
      })
    }),
    getProducts: builder.query({
      query: (cred) => ({
        url: '/products',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred}`
        }
      })
    }),
    getSoldProducts: builder.query({
      query: (cred) => ({
        url: '/auth/me',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred}`
        }
      })
    }),
    selProduct: builder.mutation({
      query: (cred) => ({
        url: '/orders',
        method: 'POST',
        body: cred,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred.cookies}`
        }
      })
    }),
    updateProduct: builder.mutation({
      query: (cred) => ({
        url: `/products/${cred.id}`,
        method: 'PUT',
        body: cred.data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred.cookies}`
        }
      })
    }),
    createProduct: builder.mutation({
      query: (cred) => ({
        url: `/products/`,
        method: 'POST',
        body: cred.data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred.cookies}`
        }
      })
    }),
    deleteProduct: builder.mutation({
      query: (cred) => ({
        url: `/products/${cred.id}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred.cookies}`
        }
      })
    }),
    getSpecificProduct: builder.query({
      query: (cred) => ({
        url: `/products/${cred.id}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred.cookies}`
        }
      })
    }),
    getOrders: builder.query({
      query: (cred) => ({
        url: `/orders/`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred}`
        }
      })
    }),
    addExpenses: builder.mutation({
      query: (cred) => ({
        url: `/orders/addExpense`,
        method: 'POST',
        body: cred.data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred.cookies}`
        }
      })
    }),
    getOrderByInvoice: builder.query({
      query: (cred) => {
        return {
          url: `/orders/invoice/${cred.invoiceNumber}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cred.cookies}`
          }
        };
      }
    }),
    updateOrder: builder.mutation({
      query: (cred) => ({
        url: `/products/refundQuantity/${cred.id}`,
        method: 'PUT',
        body: cred.data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred.cookies}`
        }
      })
    }),
    getExpense: builder.query({
      query: (cred) => ({
        url: `/expense`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred}`
        }
      })
    }),
    getMyExpanses: builder.query({
      query: (cred) => ({
        url: `/expense/me`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred}`
        }
      })
    }),
    getAllOrders: builder.query({
      query: (cred) => ({
        url: `/orders/all`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred}`
        }
      })
    }),
    getAllCustomer: builder.query({
      query: (cred) => ({
        url: `/customers/`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred}`
        }
      })
    }),
    getOrderFromCustomer: builder.query({
      query: (cred) => ({
        url: `/customers/${cred.phone}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cred.cookies}`
        }
      })
    })
  })
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetProductsQuery,
  useGetSoldProductsQuery,
  useSelProductMutation,
  useUpdateProductMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetSpecificProductQuery,
  useGetOrdersQuery,
  useAddExpensesMutation,
  useGetOrderByInvoiceQuery,
  useUpdateOrderMutation,
  useGetExpenseQuery,
  useGetMyExpansesQuery,
  useGetAllOrdersQuery,
  useGetAllCustomerQuery,
  useGetOrderFromCustomerQuery
} = authApi;
