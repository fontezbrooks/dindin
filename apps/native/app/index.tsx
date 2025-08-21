import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { authClient } from "@/lib/auth-client";

export default function Index() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async () => {
		try {
			const session = await authClient.getSession();
			setIsAuthenticated(!!session?.data);
		} catch (error) {
			console.error("Auth check error:", error);
			setIsAuthenticated(false);
		}
	};

	if (isAuthenticated === null) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<ActivityIndicator size="large" color="#FF6B6B" />
			</View>
		);
	}

	// Redirect based on authentication status
	return (
		<Redirect href={isAuthenticated ? "/(tabs)/swipe" : "/(auth)/sign-in"} />
	);
}
