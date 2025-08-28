import { Link, router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authClient } from "@/lib/auth-client";
import logger from '@/utils/logger';

export default function SignUpScreen() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSignUp = async () => {
		if (!name || !email || !password || !confirmPassword) {
			Alert.alert("Error", "Please fill in all fields");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Error", "Passwords do not match");
			return;
		}

		if (password.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);
		try {
			const result = await authClient.signUp.email({
				email,
				password,
				name,
			});

			if (result.error) {
				Alert.alert(
					"Sign Up Failed",
					result.error.message || "Failed to create account",
				);
			} else {
				// Successfully signed up and signed in
				Alert.alert("Success", "Account created successfully!", [
					{ text: "OK", onPress: () => router.replace("/(tabs)/swipe") },
				]);
			}
		} catch (error) {
			Alert.alert("Error", "Failed to create account. Please try again.");
			logger.error("Sign up error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			<ScrollView className="flex-1">
				<View className="p-6">
					<View className="mb-8 mt-4">
						<Text className="text-4xl font-bold text-center text-pink-500 mb-2">
							Join DinDin 🎉
						</Text>
						<Text className="text-center text-gray-600">
							Start finding recipes together
						</Text>
					</View>

					<View className="space-y-4">
						<View>
							<Text className="text-gray-700 mb-2 font-medium">Name</Text>
							<TextInput
								className="border border-gray-300 rounded-lg p-3 text-gray-800"
								placeholder="Enter your name"
								value={name}
								onChangeText={setName}
								editable={!isLoading}
							/>
						</View>

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
								placeholder="Create a password (min 6 characters)"
								value={password}
								onChangeText={setPassword}
								secureTextEntry
								editable={!isLoading}
							/>
						</View>

						<View>
							<Text className="text-gray-700 mb-2 font-medium">
								Confirm Password
							</Text>
							<TextInput
								className="border border-gray-300 rounded-lg p-3 text-gray-800"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								secureTextEntry
								editable={!isLoading}
							/>
						</View>

						<TouchableOpacity
							className={`${isLoading ? "bg-pink-300" : "bg-pink-500"} rounded-lg p-4 items-center mt-4`}
							onPress={handleSignUp}
							disabled={isLoading}
						>
							<Text className="text-white font-bold text-lg">
								{isLoading ? "Creating Account..." : "Create Account"}
							</Text>
						</TouchableOpacity>

						<View className="flex-row justify-center mt-6">
							<Text className="text-gray-600">Already have an account? </Text>
							<Link href="/(auth)/sign-in" asChild>
								<TouchableOpacity>
									<Text className="text-pink-500 font-semibold">Sign In</Text>
								</TouchableOpacity>
							</Link>
						</View>

						<Text className="text-center text-gray-500 text-xs mt-4 px-4">
							By creating an account, you agree to our Terms of Service and
							Privacy Policy
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
