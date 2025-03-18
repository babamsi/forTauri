// 'use server';

// import { cookies } from 'next/headers';

// export const createAuthCookie = async (
//   refresh: string,
//   access: string,
//   userInfo: any
// ) => {
//   cookies().set('access_token', access, {
//     secure: true,
//     expires: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
//   });
//   cookies().set('refresh_token', refresh, { secure: true });
//   cookies().set('user', userInfo.username, { secure: true });
//   cookies().set('role', userInfo.role, { secure: true });
//   return {
//     access_token: access,
//     refresh_token: refresh,
//     user: userInfo
//   };
// };

// export const getAuthCookie = async () => {
//   const access = cookies();

//   return await access.get('access_token')?.value;
// };

// export const getUserInfo = async () => {
//   const user = cookies();

//   return {
//     username: user.get('user')?.value,
//     role: user.get('role')?.value
//   };
// };

// export const deleteAuthCookie = async () => {
//   cookies().delete('access_token');
// };

import { Store } from '@tauri-apps/plugin-store';
// when using `"withGlobalTauri": true`, you may use
// const { load } = window.__TAURI__.store;

// Create a new store or load the existing one,
// note that the options will be ignored if a `Store` with that path has already been created

// export const createAuthCookie = async (access: string, userInfo:any) => {
//   // console.log('getting', access, userInfo)
//   const store = new Store(".settings.dat");
//   await store.set('user', userInfo.username);
//   await store.set('role', userInfo.role)
//   await store.set('access', access)
//   console.log(store)
//   await store.save()

//   return {
//     access_token: access,
//     user: userInfo
//   }

// }

export const getAuthCookie = async () => {
  const store = await load('store.json', { autoSave: false });

  // const access = await store.get('access_token')?.value;

  return await store.get('access_token')?.value;
};

export const getUserInfo = async () => {
  const store = await load('store.json', { autoSave: false });
  return {
    username: store.get('user')?.value,
    role: store.get('role')?.value
  };
};

export const deleteAuthCookie = async () => {
  const store = await load('store.json', { autoSave: false });

  await store.delete('access_token');
  await store.save();
};

// const store = await load('store.json', { autoSave: false });

// Set a value.
// await store.set('some-key', { value: 5 });

// Get a value.
// const val = await store.get<{ value: number }>('some-key');
// console.log(val); // { value: 5 }

// You can manually save the store after making changes.
// Otherwise, it will save upon graceful exit
// And if you set `autoSave` to a number or left empty,
// it will save the changes to disk after a debounce delay, 100ms by default.
// await store.save();
