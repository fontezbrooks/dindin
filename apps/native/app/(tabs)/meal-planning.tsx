import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type React from "react";
import { useEffect, useState } from "react";
import {
	Alert,
	RefreshControl,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MealPlanCard } from "../../components/meal-planning/meal-plan-card";
import { ShoppingListCardCompact } from "../../components/meal-planning/shopping-list-card";

// Mock data - replace with actual API calls
const mockMealPlans = [
	{
		_id: "1",
		title: "Healthy Week Plan",
		description: "A balanced meal plan focused on whole foods and nutrition",
		planType: "weekly" as const,
		status: "active" as const,
		startDate: new Date().toISOString(),
		endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
		analytics: {
			completionRate: 65,
			totalMealsPlanned: 21,
			totalMealsCompleted: 14,
		},
		dailyPlans: [
			{
				date: new Date().toISOString(),
				meals: {
					breakfast: { recipeId: { title: "Overnight Oats" }, completed: true },
					lunch: { recipeId: { title: "Quinoa Salad" }, completed: false },
					dinner: { recipeId: { title: "Grilled Salmon" }, completed: false },
				},
			},
		],
	},
	{
		_id: "2",
		title: "Family Meal Prep",
		description: "Easy batch cooking for busy families",
		planType: "weekly" as const,
		status: "draft" as const,
		startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
		endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
		analytics: {
			completionRate: 0,
			totalMealsPlanned: 21,
			totalMealsCompleted: 0,
		},
		dailyPlans: [],
	},
];

const mockShoppingLists = [
	{
		_id: "1",
		title: "Weekly Groceries",
		status: "ready" as const,
		items: [
			{
				name: "Chicken Breast",
				quantity: "2 lbs",
				category: "meat-seafood",
				isPurchased: false,
			},
			{
				name: "Broccoli",
				quantity: "1 head",
				category: "produce",
				isPurchased: true,
			},
			{
				name: "Brown Rice",
				quantity: "1 bag",
				category: "pantry",
				isPurchased: false,
			},
		],
		dateRange: {
			startDate: new Date().toISOString(),
			endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
		},
		analytics: { completionRate: 33 },
	},
];

const mockTodaysMeals = [
	{
		planId: "1",
		planTitle: "Healthy Week Plan",
		date: new Date().toISOString(),
		meals: {
			breakfast: {
				recipeId: { title: "Greek Yogurt Parfait" },
				completed: true,
				completedAt: new Date().toISOString(),
			},
			lunch: {
				recipeId: { title: "Mediterranean Wrap" },
				completed: false,
			},
			dinner: {
				recipeId: { title: "Baked Cod with Vegetables" },
				completed: false,
			},
			snacks: [
				{ recipeId: { title: "Apple with Almond Butter" }, completed: true },
			],
		},
	},
];

export default function MealPlanningScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState<"overview" | "plans" | "shopping">(
		"overview",
	);

	const [mealPlans, setMealPlans] = useState(mockMealPlans);
	const [shoppingLists, setShoppingLists] = useState(mockShoppingLists);
	const [todaysMeals, setTodaysMeals] = useState(mockTodaysMeals);

	const handleRefresh = async () => {
		setRefreshing(true);
		// Add API calls here
		setTimeout(() => setRefreshing(false), 1000);
	};

	const handleCreateMealPlan = () => {
		router.push("/meal-plan/create");
	};

	const handleCreateShoppingList = () => {
		router.push("/shopping-list/create");
	};

	const handleMealPlanPress = (mealPlan: any) => {
		router.push(`/meal-plan/${mealPlan._id}`);
	};

	const handleShoppingListPress = (shoppingList: any) => {
		router.push(`/shopping-list/${shoppingList._id}`);
	};

	const handleCompleteMeal = (planId: string, mealType: string) => {
		Alert.alert("Complete Meal", `Mark ${mealType} as completed?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Complete",
				onPress: () => {
					// Update meal completion status
					setTodaysMeals((prev) =>
						prev.map((plan) => {
							if (plan.planId === planId) {
								const updatedPlan = { ...plan };
								if (
									updatedPlan.meals[mealType as keyof typeof updatedPlan.meals]
								) {
									(
										updatedPlan.meals[
											mealType as keyof typeof updatedPlan.meals
										] as any
									).completed = true;
									(
										updatedPlan.meals[
											mealType as keyof typeof updatedPlan.meals
										] as any
									).completedAt = new Date().toISOString();
								}
								return updatedPlan;
							}
							return plan;
						}),
					);
				},
			},
		]);
	};

	const renderOverview = () => (
		<ScrollView
			className="flex-1"
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
			}
		>
			{/* Today's Meals Section */}
			<View className="px-4 py-6">
				<View className="flex-row justify-between items-center mb-4">
					<Text className="text-xl font-bold text-gray-800">Today's Meals</Text>
					<TouchableOpacity onPress={() => setActiveTab("plans")}>
						<Text className="text-blue-600 font-medium">View All Plans</Text>
					</TouchableOpacity>
				</View>

				{todaysMeals.length > 0 ? (
					todaysMeals.map((dayPlan) => (
						<View
							key={dayPlan.planId}
							className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
						>
							<Text className="text-lg font-semibold text-gray-800 mb-3">
								{dayPlan.planTitle}
							</Text>

							<View className="space-y-3">
								{/* Breakfast */}
								<MealRow
									mealType="Breakfast"
									meal={dayPlan.meals.breakfast}
									onComplete={() =>
										handleCompleteMeal(dayPlan.planId, "breakfast")
									}
									color="#FF9500"
								/>

								{/* Lunch */}
								<MealRow
									mealType="Lunch"
									meal={dayPlan.meals.lunch}
									onComplete={() => handleCompleteMeal(dayPlan.planId, "lunch")}
									color="#34C759"
								/>

								{/* Dinner */}
								<MealRow
									mealType="Dinner"
									meal={dayPlan.meals.dinner}
									onComplete={() =>
										handleCompleteMeal(dayPlan.planId, "dinner")
									}
									color="#007AFF"
								/>

								{/* Snacks */}
								{dayPlan.meals.snacks?.map((snack: any, index: number) => (
									<MealRow
										key={index}
										mealType={`Snack ${index + 1}`}
										meal={snack}
										onComplete={() => {
											/* Handle snack completion */
										}}
										color="#AF52DE"
									/>
								))}
							</View>
						</View>
					))
				) : (
					<View className="bg-white rounded-2xl p-6 items-center">
						<Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
						<Text className="text-gray-500 text-center mt-4">
							No meals planned for today
						</Text>
						<TouchableOpacity
							className="mt-4 bg-blue-500 px-6 py-2 rounded-full"
							onPress={handleCreateMealPlan}
						>
							<Text className="text-white font-medium">Create Meal Plan</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>

			{/* Quick Actions */}
			<View className="px-4 mb-6">
				<Text className="text-xl font-bold text-gray-800 mb-4">
					Quick Actions
				</Text>
				<View className="flex-row space-x-4">
					<QuickActionCard
						title="New Meal Plan"
						icon="calendar-outline"
						color="#3B82F6"
						onPress={handleCreateMealPlan}
					/>
					<QuickActionCard
						title="Shopping List"
						icon="list-outline"
						color="#10B981"
						onPress={handleCreateShoppingList}
					/>
					<QuickActionCard
						title="Templates"
						icon="library-outline"
						color="#8B5CF6"
						onPress={() => router.push("/meal-plan/templates")}
					/>
				</View>
			</View>

			{/* Recent Activity */}
			<View className="px-4 mb-6">
				<Text className="text-xl font-bold text-gray-800 mb-4">
					Recent Activity
				</Text>

				{/* Active Plans */}
				<View className="mb-4">
					<Text className="text-lg font-semibold text-gray-800 mb-3">
						Active Plans
					</Text>
					{mealPlans
						.filter((plan) => plan.status === "active")
						.slice(0, 2)
						.map((plan) => (
							<MealPlanCard
								key={plan._id}
								mealPlan={plan}
								onPress={() => handleMealPlanPress(plan)}
								showMenu={false}
							/>
						))}
				</View>

				{/* Shopping Lists */}
				<View>
					<Text className="text-lg font-semibold text-gray-800 mb-3">
						Shopping Lists
					</Text>
					{shoppingLists.slice(0, 2).map((list) => (
						<ShoppingListCardCompact
							key={list._id}
							shoppingList={list}
							onPress={() => handleShoppingListPress(list)}
						/>
					))}
				</View>
			</View>
		</ScrollView>
	);

	const renderPlans = () => (
		<ScrollView
			className="flex-1"
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
			}
		>
			<View className="px-4 py-6">
				<View className="flex-row justify-between items-center mb-6">
					<Text className="text-xl font-bold text-gray-800">Meal Plans</Text>
					<TouchableOpacity
						className="bg-blue-500 px-4 py-2 rounded-full flex-row items-center"
						onPress={handleCreateMealPlan}
					>
						<Ionicons name="add" size={20} color="white" />
						<Text className="text-white font-medium ml-1">Create Plan</Text>
					</TouchableOpacity>
				</View>

				{mealPlans.map((plan) => (
					<MealPlanCard
						key={plan._id}
						mealPlan={plan}
						onPress={() => handleMealPlanPress(plan)}
						onShare={() => {
							/* Handle share */
						}}
						onDuplicate={() => {
							/* Handle duplicate */
						}}
						onDelete={() => {
							/* Handle delete */
						}}
					/>
				))}

				{mealPlans.length === 0 && (
					<View className="bg-white rounded-2xl p-6 items-center">
						<Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
						<Text className="text-gray-500 text-center mt-4 text-lg">
							No meal plans yet
						</Text>
						<Text className="text-gray-400 text-center mt-2">
							Create your first meal plan to get started
						</Text>
						<TouchableOpacity
							className="mt-6 bg-blue-500 px-8 py-3 rounded-full"
							onPress={handleCreateMealPlan}
						>
							<Text className="text-white font-semibold">Create Meal Plan</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		</ScrollView>
	);

	const renderShopping = () => (
		<ScrollView
			className="flex-1"
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
			}
		>
			<View className="px-4 py-6">
				<View className="flex-row justify-between items-center mb-6">
					<Text className="text-xl font-bold text-gray-800">
						Shopping Lists
					</Text>
					<TouchableOpacity
						className="bg-green-500 px-4 py-2 rounded-full flex-row items-center"
						onPress={handleCreateShoppingList}
					>
						<Ionicons name="add" size={20} color="white" />
						<Text className="text-white font-medium ml-1">New List</Text>
					</TouchableOpacity>
				</View>

				{shoppingLists.map((list) => (
					<ShoppingListCardCompact
						key={list._id}
						shoppingList={list}
						onPress={() => handleShoppingListPress(list)}
						showMenu={true}
						onShare={() => {
							/* Handle share */
						}}
						onDuplicate={() => {
							/* Handle duplicate */
						}}
						onDelete={() => {
							/* Handle delete */
						}}
					/>
				))}

				{shoppingLists.length === 0 && (
					<View className="bg-white rounded-2xl p-6 items-center">
						<Ionicons name="list-outline" size={64} color="#9CA3AF" />
						<Text className="text-gray-500 text-center mt-4 text-lg">
							No shopping lists yet
						</Text>
						<Text className="text-gray-400 text-center mt-2">
							Create a list or generate one from a meal plan
						</Text>
						<TouchableOpacity
							className="mt-6 bg-green-500 px-8 py-3 rounded-full"
							onPress={handleCreateShoppingList}
						>
							<Text className="text-white font-semibold">
								Create Shopping List
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		</ScrollView>
	);

	return (
		<View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
			{/* Header */}
			<View className="bg-white border-b border-gray-200">
				<View className="px-4 py-4">
					<Text className="text-2xl font-bold text-gray-800">
						Meal Planning
					</Text>
				</View>

				{/* Tab Navigation */}
				<View className="flex-row border-t border-gray-100">
					<TabButton
						title="Overview"
						isActive={activeTab === "overview"}
						onPress={() => setActiveTab("overview")}
					/>
					<TabButton
						title="Plans"
						isActive={activeTab === "plans"}
						onPress={() => setActiveTab("plans")}
					/>
					<TabButton
						title="Shopping"
						isActive={activeTab === "shopping"}
						onPress={() => setActiveTab("shopping")}
					/>
				</View>
			</View>

			{/* Content */}
			{activeTab === "overview" && renderOverview()}
			{activeTab === "plans" && renderPlans()}
			{activeTab === "shopping" && renderShopping()}
		</View>
	);
}

interface TabButtonProps {
	title: string;
	isActive: boolean;
	onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onPress }) => (
	<TouchableOpacity
		className={`flex-1 py-3 items-center border-b-2 ${
			isActive ? "border-blue-500" : "border-transparent"
		}`}
		onPress={onPress}
	>
		<Text
			className={`font-medium ${isActive ? "text-blue-600" : "text-gray-600"}`}
		>
			{title}
		</Text>
	</TouchableOpacity>
);

interface MealRowProps {
	mealType: string;
	meal: any;
	onComplete: () => void;
	color: string;
}

const MealRow: React.FC<MealRowProps> = ({
	mealType,
	meal,
	onComplete,
	color,
}) => (
	<View className="flex-row items-center justify-between py-2">
		<View className="flex-row items-center flex-1">
			<View
				className="w-3 h-3 rounded-full mr-3"
				style={{ backgroundColor: color }}
			/>
			<View className="flex-1">
				<Text className="text-sm font-medium text-gray-600">{mealType}</Text>
				<Text className="text-base text-gray-800">
					{meal?.recipeId?.title || meal?.customMeal?.name || "Not planned"}
				</Text>
			</View>
		</View>

		{meal && (meal.recipeId || meal.customMeal) && (
			<TouchableOpacity
				className={`p-2 rounded-full ${
					meal.completed ? "bg-green-100" : "bg-gray-100"
				}`}
				onPress={meal.completed ? undefined : onComplete}
			>
				<Ionicons
					name={meal.completed ? "checkmark" : "ellipse-outline"}
					size={20}
					color={meal.completed ? "#10B981" : "#9CA3AF"}
				/>
			</TouchableOpacity>
		)}
	</View>
);

interface QuickActionCardProps {
	title: string;
	icon: string;
	color: string;
	onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
	title,
	icon,
	color,
	onPress,
}) => (
	<TouchableOpacity
		className="flex-1 bg-white rounded-xl p-4 items-center shadow-sm"
		onPress={onPress}
	>
		<View
			className="w-12 h-12 rounded-full items-center justify-center mb-2"
			style={{ backgroundColor: `${color}20` }}
		>
			<Ionicons name={icon as any} size={24} color={color} />
		</View>
		<Text className="text-sm font-medium text-gray-800 text-center">
			{title}
		</Text>
	</TouchableOpacity>
);
