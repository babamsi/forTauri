import { create } from 'zustand';

export const stuffProductStore = create((set) => ({
  soldProducts: null,
  amountInEVC: 0,
  amountInCash: 0,
  revenue: 0,
  calculateRevenue: (rev) => set({ revenue: rev }),
  calculateSoldProducts: (products) => set({ soldProducts: products }),
  calculateAmountByEVC: (amountEvc) => set({ amountInEVC: amountEvc }),
  calculateAmountByCash: (cashAmount) => set({ amountInCash: cashAmount })
}));

// export const useStuffInfoStore = create((set) => ({
//   id: null,
//   name: null,
//   username: null,
//   role: null,
//   setUserInfo: (stuffInfo) => set({ id: stuffInfo.id,
//     name: stuffInfo.name,
//     username: stuffInfo.username,
//     role: stuffInfo.role }),
// }))

export const allProductsStore = create((set) => ({
  allProducts: null,
  setProducts: (products) => set({ allProducts: products })
}));

export const editProductStore = create((set) => ({
  producName: null,
  productPrice: null,
  productQuantity: null,
  productCategory: null,
  productUnit: null,
  productQuantityBased: true,
  setEditProductName: (product) =>
    set({
      editProduct: product.name,
      editProductPrice: product.price,
      editProductQuantity: product.quantity,
      editProductCategory: product.category,
      editProductUnit: product.unit,
      editProductQuantityBased: product.isQuantityBased
    })
}));
