import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
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
        url: '/products/soldProducts',
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
        body: cred.data,
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
  useDeleteProductMutation
} = authApi;
