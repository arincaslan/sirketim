"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/lib/toast-context";
import { ToastViewport } from "@/components/store/toast-viewport";
import { CartDrawer } from "@/components/store/cart-drawer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <CartDrawer />
      <ToastViewport />
    </ToastProvider>
  );
}
