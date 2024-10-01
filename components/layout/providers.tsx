'use client';
import React from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import { Provider } from 'react-redux';
import { store } from '../../store/store';

// import { SessionProvider, SessionProviderProps } from 'next-auth/react';
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </Provider>
    </>
  );
}
