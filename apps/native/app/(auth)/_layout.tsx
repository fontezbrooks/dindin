import { Stack } from "expo-router";

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: "#FF6B6B",
				},
				headerTintColor: "#fff",
				headerTitleStyle: {
					fontWeight: "bold",
				},
			}}
		>
			<Stack.Screen
				name="sign-in"
				options={{
					title: "Sign In",
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="sign-up"
				options={{
					title: "Create Account",
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="forgot-password"
				options={{
					title: "Reset Password",
				}}
			/>
		</Stack>
	);
}
