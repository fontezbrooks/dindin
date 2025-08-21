import { QueryClientProvider } from "@tanstack/react-query";
import type React from "react";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";

interface TRPCProviderProps {
	children: React.ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}
