'use server';

import { cookies } from 'next/headers';

export const createAuthCookie = async (refresh: string, access: string) => {
  cookies().set('access_token', access, {
    secure: true,
    expires: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
  });
  cookies().set('refresh_token', refresh, { secure: true });

  return {
    access_token: access,
    refresh_token: refresh
  };
};

export const getAuthCookie = async () => {
  const access = cookies();

  return await access.get('access_token')?.value;
};

export const deleteAuthCookie = async () => {
  cookies().delete('access_token');
};
