import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { authClient } from "@/lib/auth-client";
import type { AppRouter } from "../../server/src/routers";

export const queryClient = new QueryClient();

export const trpc = createTRPCReact<AppRouter>();

// For now, we'll use HTTP-only since WebSocket support requires additional setup
// WebSockets in React Native need a different approach than Node.js
export const trpcClient = trpc.createClient({
	links: [
		httpBatchLink({
			url: `${process.env.EXPO_PUBLIC_SERVER_URL}/trpc`,
			headers() {
				const headers = new Map<string, string>();
				const cookies = authClient.getCookie();
				if (cookies) {
					headers.set("Cookie", cookies);
				}
				return Object.fromEntries(headers);
			},
		}),
	],
});

// Helper function to check if WebSocket is available
export const isWebSocketAvailable = () => {
	return typeof WebSocket !== "undefined";
};
