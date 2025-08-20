import { authClient } from "@/lib/auth-client";
import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../server/src/routers";

export const queryClient = new QueryClient();

export const trpc = createTRPCReact<AppRouter>();

// For now, only use HTTP batch link since WebSocket server is not set up
// TODO: Re-enable WebSocket support when server is properly configured
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

// Original WebSocket configuration for future use:
// const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3001';
// 
// export const trpcClient = trpc.createClient({
// 	links: [
// 		splitLink({
// 			condition(op) {
// 				return op.type === 'subscription';
// 			},
// 			true: wsLink({
// 				url: WS_URL,
// 				connectionParams: async () => {
// 					const cookies = authClient.getCookie();
// 					return {
// 						authorization: cookies,
// 					};
// 				},
// 			}),
// 			false: httpBatchLink({
// 				url: `${process.env.EXPO_PUBLIC_SERVER_URL}/trpc`,
// 				headers() {
// 					const headers = new Map<string, string>();
// 					const cookies = authClient.getCookie();
// 					if (cookies) {
// 						headers.set("Cookie", cookies);
// 					}
// 					return Object.fromEntries(headers);
// 				},
// 			}),
// 		}),
// 	],
// });