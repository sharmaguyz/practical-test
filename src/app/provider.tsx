// app/providers.tsx
'use client';

import { SidebarProvider } from '@/context/SidebarContext';
// import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { NotificationModal } from '@/context/NotificationModal';
import { LoadingProvider } from '@/context/LoadingContext';
import { ConfirmationProvider } from '@/context/ConfirmationContext';
import GlobalLoader from '@/components/GlobalLoader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { AuthProvider } from "@/context/AuthContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* <ThemeProvider> */}
      <NotificationProvider>
        <LoadingProvider>
          <GlobalLoader />
          <LoadingOverlay />
          <SidebarProvider>
            <ConfirmationProvider>
              {children}
            </ConfirmationProvider>
            <NotificationModal />
          </SidebarProvider>
        </LoadingProvider>
      </NotificationProvider>
      {/* </ThemeProvider> */}
    </AuthProvider>
  );
}
