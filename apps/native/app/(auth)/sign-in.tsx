import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth-client";

export default function SignInScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSignIn = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please enter email and password");
			return;
		}

		setIsLoading(true);
		try {
			const result = await authClient.signIn.email({
				email,
				password,
			});

			if (result.error) {
				Alert.alert(
					"Sign In Failed",
					result.error.message || "Invalid credentials",
				);
			} else {
				// Successfully signed in
				router.replace("/(tabs)/swipe");
			}
		} catch (error) {
			Alert.alert("Error", "Failed to sign in. Please try again.");
			console.error("Sign in error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			<View className="flex-1 p-6 justify-center">
				<View className="mb-8">
					<Text className="text-4xl font-bold text-center text-pink-500 mb-2">
						DinDin 🍽️
					</Text>
					<Text className="text-center text-gray-600">
						Find recipes you both love
					</Text>
				</View>

				<View className="space-y-4">
					<View>
						<Text className="text-gray-700 mb-2 font-medium">Email</Text>
						<TextInput
							className="border border-gray-300 rounded-lg p-3 text-gray-800"
							placeholder="Enter your email"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							editable={!isLoading}
						/>
					</View>

					<View>
						<Text className="text-gray-700 mb-2 font-medium">Password</Text>
						<TextInput
							className="border border-gray-300 rounded-lg p-3 text-gray-800"
							placeholder="Enter your password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							editable={!isLoading}
						/>
					</View>

					<TouchableOpacity
						className={`${isLoading ? "bg-pink-300" : "bg-pink-500"} rounded-lg p-4 items-center mt-4`}
						onPress={handleSignIn}
						disabled={isLoading}
					>
						<Text className="text-white font-bold text-lg">
							{isLoading ? "Signing In..." : "Sign In"}
						</Text>
					</TouchableOpacity>

					<Link href="/(auth)/forgot-password" asChild>
						<TouchableOpacity className="mt-2">
							<Text className="text-center text-pink-500">
								Forgot Password?
							</Text>
						</TouchableOpacity>
					</Link>

					<View className="flex-row justify-center mt-6">
						<Text className="text-gray-600">Don't have an account? </Text>
						<Link href="/(auth)/sign-up" asChild>
							<TouchableOpacity>
								<Text className="text-pink-500 font-semibold">Sign Up</Text>
							</TouchableOpacity>
						</Link>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
