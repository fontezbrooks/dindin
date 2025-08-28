import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import appConfig from "@/config/env.config";

export const authClient = createAuthClient({
	baseURL: appConfig.EXPO_PUBLIC_SERVER_URL,
	plugins: [
		expoClient({
			storagePrefix: appConfig.EXPO_PUBLIC_APP_NAME.toLowerCase(),
			storage: SecureStore,
		}),
	],
});
