"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/instructorlayout/AppHeader";
import AppSidebar from "@/instructorlayout/AppSidebar";
import Backdrop from "@/instructorlayout/Backdrop";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from '@/context/LoadingContext';

import GlobalLoader from '@/components/GlobalLoader';
import LoadingOverlay from '@/components/common/LoadingOverlay';
export default function Instructorlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <AuthProvider>
      <div className="min-h-screen xl:flex">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />

        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          <LoadingProvider>
            <GlobalLoader />
            <LoadingOverlay />
            {/* Header */}
            <AppHeader />
            {/* Page Content */}
            <div className="p-4 mx-auto max-w-(--breakpoint-2xl)">
              {children}
            </div>
          </LoadingProvider>
        </div>
      </div>
    </AuthProvider>
  );
}
