"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/lib/toast-context";
import { ToastViewport } from "@/components/store/toast-viewport";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}
