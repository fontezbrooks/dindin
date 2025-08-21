import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#FF6B6B",
				tabBarStyle: {
					backgroundColor: "#fff",
					borderTopWidth: 1,
					borderTopColor: "#e5e7eb",
					paddingBottom: 5,
					height: 60,
				},
				headerStyle: {
					backgroundColor: "#fff",
				},
				headerTintColor: "#FF6B6B",
				headerTitleStyle: {
					fontWeight: "bold",
				},
			}}
		>
			<Tabs.Screen
				name="swipe"
				options={{
					title: "Discover",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="restaurant" size={size || 24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="matches"
				options={{
					title: "Matches",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="heart" size={size || 24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="library"
				options={{
					title: "Recipes",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="book" size={size || 24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="meal-planning"
				options={{
					title: "Meal Plans",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="calendar" size={size || 24} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person" size={size || 24} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
