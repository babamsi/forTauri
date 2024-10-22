'use server';

import { cookies } from 'next/headers';

export const createAuthCookie = async (
  refresh: string,
  access: string,
  userInfo: any
) => {
  cookies().set('access_token', access, {
    secure: true,
    expires: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
  });
  cookies().set('refresh_token', refresh, { secure: true });
  cookies().set('user', userInfo.username, { secure: true });
  cookies().set('role', userInfo.role, { secure: true });
  return {
    access_token: access,
    refresh_token: refresh,
    user: userInfo
  };
};

export const getAuthCookie = async () => {
  const access = cookies();

  return await access.get('access_token')?.value;
};

export const getUserInfo = async () => {
  const user = cookies();

  return {
    username: user.get('user')?.value,
    role: user.get('role')?.value
  };
};

export const deleteAuthCookie = async () => {
  cookies().delete('access_token');
};
