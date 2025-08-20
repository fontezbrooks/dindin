import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, queryClient, trpcClient } from "@/utils/trpc";

interface TRPCProviderProps {
  children: React.ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}