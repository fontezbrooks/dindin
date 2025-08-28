import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { DietaryTagsBadge } from "./dietary-tags-badge";
import { MacroChart } from "./macro-chart";
import { NutritionProgressBar } from "./nutrition-progress-bar";
import { WaterIntakeTracker } from "./water-intake-tracker";
import logger from '@/utils/logger';

interface DailyNutritionData {
	_id: string;
	userId: string;
	date: Date;
	totalCalories: number;
	totalProtein: number;
	totalCarbohydrates: number;
	totalFat: number;
	totalFiber: number;
	totalSodium: number;
	waterIntake: number;
	waterGoal: number;
	goals: {
		calories: number;
		protein: number;
		carbohydrates: number;
		fat: number;
		fiber: number;
		sodium: number;
	};
	meals: Array<{
		_id: string;
		mealType: string;
		recipeId: any;
		servings: number;
		consumedAt: Date;
		nutrition: any;
	}>;
	completed: boolean;
}

interface Recommendation {
	type: string;
	message: string;
	priority: "low" | "medium" | "high";
	suggestions?: string[];
}

interface DailyNutritionTrackerProps {
	userId: string;
	date?: Date;
	onAddMeal?: (mealType: string) => void;
	onEditGoals?: () => void;
	className?: string;
}

export function DailyNutritionTracker({
	userId,
	date = new Date(),
	onAddMeal,
	onEditGoals,
	className,
}: DailyNutritionTrackerProps) {
	const [dailyNutrition, setDailyNutrition] =
		useState<DailyNutritionData | null>(null);
	const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadDailyNutrition();
	}, [userId, date]);

	const loadDailyNutrition = async () => {
		try {
			setLoading(true);
			setError(null);

			const dateString = date.toISOString().split("T")[0];
			const response = await fetch(
				`/api/nutrition/daily/${userId}?date=${dateString}`,
			);

			if (!response.ok) {
				throw new Error("Failed to load nutrition data");
			}

			const data = await response.json();
			setDailyNutrition(data.dailyNutrition);
			setRecommendations(data.recommendations || []);
		} catch (err) {
			logger.error("Error loading daily nutrition:", err);
			setError("Failed to load nutrition data");
		} finally {
			setLoading(false);
		}
	};

	const handleAddWater = async (ounces: number) => {
		try {
			const response = await fetch(`/api/nutrition/daily/${userId}/water`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					ounces,
					date: date.toISOString().split("T")[0],
				}),
			});

			if (response.ok) {
				await loadDailyNutrition();
			}
		} catch (err) {
			logger.error("Error adding water:", err);
			Alert.alert("Error", "Failed to update water intake");
		}
	};

	const handleRemoveMeal = async (mealId: string) => {
		try {
			const response = await fetch(
				`/api/nutrition/daily/${userId}/meal/${mealId}?date=${date.toISOString().split("T")[0]}`,
				{
					method: "DELETE",
				},
			);

			if (response.ok) {
				await loadDailyNutrition();
			}
		} catch (err) {
			logger.error("Error removing meal:", err);
			Alert.alert("Error", "Failed to remove meal");
		}
	};

	const handleMarkDayComplete = async () => {
		try {
			const response = await fetch(
				`/api/nutrition/daily/${userId}/complete?date=${date.toISOString().split("T")[0]}`,
				{
					method: "POST",
				},
			);

			if (response.ok) {
				await loadDailyNutrition();
				Alert.alert("Success", "Day marked as completed!");
			}
		} catch (err) {
			logger.error("Error marking day complete:", err);
			Alert.alert("Error", "Failed to mark day as complete");
		}
	};

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center p-6">
				<ActivityIndicator size="large" color="#3B82F6" />
				<Text className="mt-2 text-gray-600">Loading nutrition data...</Text>
			</View>
		);
	}

	if (error || !dailyNutrition) {
		return (
			<View className="flex-1 justify-center items-center p-6">
				<Text className="text-red-500 text-center mb-4">
					{error || "No nutrition data available"}
				</Text>
				<TouchableOpacity
					onPress={loadDailyNutrition}
					className="bg-blue-500 px-4 py-2 rounded-lg"
				>
					<Text className="text-white font-medium">Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	const goalPercentages = {
		calories: Math.round(
			(dailyNutrition.totalCalories / dailyNutrition.goals.calories) * 100,
		),
		protein: Math.round(
			(dailyNutrition.totalProtein / dailyNutrition.goals.protein) * 100,
		),
		carbohydrates: Math.round(
			(dailyNutrition.totalCarbohydrates / dailyNutrition.goals.carbohydrates) *
				100,
		),
		fat: Math.round((dailyNutrition.totalFat / dailyNutrition.goals.fat) * 100),
		fiber: Math.round(
			(dailyNutrition.totalFiber / dailyNutrition.goals.fiber) * 100,
		),
		sodium: Math.round(
			(dailyNutrition.totalSodium / dailyNutrition.goals.sodium) * 100,
		),
	};

	const macroData = {
		protein: dailyNutrition.totalProtein,
		carbohydrates: dailyNutrition.totalCarbohydrates,
		fat: dailyNutrition.totalFat,
		calories: dailyNutrition.totalCalories,
	};

	return (
		<ScrollView className={`flex-1 bg-gray-50 ${className || ""}`}>
			{/* Header */}
			<LinearGradient
				colors={["#3B82F6", "#1D4ED8"]}
				className="px-6 py-8 mb-4"
			>
				<View className="flex-row justify-between items-center">
					<View>
						<Text className="text-white text-2xl font-bold">
							{date.toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
							})}
						</Text>
						<Text className="text-blue-200 text-sm">
							Daily Nutrition Tracking
						</Text>
					</View>
					{!dailyNutrition.completed && (
						<TouchableOpacity
							onPress={handleMarkDayComplete}
							className="bg-white/20 px-4 py-2 rounded-lg"
						>
							<Text className="text-white font-medium">Mark Complete</Text>
						</TouchableOpacity>
					)}
				</View>

				{dailyNutrition.completed && (
					<View className="mt-2">
						<DietaryTagsBadge tags={["completed"]} size="small" />
					</View>
				)}
			</LinearGradient>

			{/* Calorie Overview */}
			<View className="bg-white mx-4 mb-4 rounded-xl p-6 shadow-sm">
				<View className="flex-row justify-between items-center mb-4">
					<Text className="text-lg font-bold text-gray-900">Calorie Goal</Text>
					<TouchableOpacity onPress={onEditGoals}>
						<Text className="text-blue-500 text-sm font-medium">
							Edit Goals
						</Text>
					</TouchableOpacity>
				</View>

				<NutritionProgressBar
					label="Calories"
					current={dailyNutrition.totalCalories}
					goal={dailyNutrition.goals.calories}
					unit="cal"
					color="#3B82F6"
					size="large"
				/>

				<View className="flex-row justify-between mt-2 text-sm text-gray-600">
					<Text>Consumed: {dailyNutrition.totalCalories} cal</Text>
					<Text>
						Remaining:{" "}
						{Math.max(
							0,
							dailyNutrition.goals.calories - dailyNutrition.totalCalories,
						)}{" "}
						cal
					</Text>
				</View>
			</View>

			{/* Macro Distribution */}
			<View className="bg-white mx-4 mb-4 rounded-xl p-6 shadow-sm">
				<Text className="text-lg font-bold text-gray-900 mb-4">
					Macro Distribution
				</Text>
				<MacroChart macros={macroData} size={180} />
			</View>

			{/* Detailed Nutrients */}
			<View className="bg-white mx-4 mb-4 rounded-xl p-6 shadow-sm">
				<Text className="text-lg font-bold text-gray-900 mb-4">
					Nutrient Goals
				</Text>
				<View className="space-y-4">
					<NutritionProgressBar
						label="Protein"
						current={dailyNutrition.totalProtein}
						goal={dailyNutrition.goals.protein}
						unit="g"
						color="#3B82F6"
					/>
					<NutritionProgressBar
						label="Carbs"
						current={dailyNutrition.totalCarbohydrates}
						goal={dailyNutrition.goals.carbohydrates}
						unit="g"
						color="#10B981"
					/>
					<NutritionProgressBar
						label="Fat"
						current={dailyNutrition.totalFat}
						goal={dailyNutrition.goals.fat}
						unit="g"
						color="#F59E0B"
					/>
					<NutritionProgressBar
						label="Fiber"
						current={dailyNutrition.totalFiber}
						goal={dailyNutrition.goals.fiber}
						unit="g"
						color="#8B5CF6"
					/>
					<NutritionProgressBar
						label="Sodium"
						current={dailyNutrition.totalSodium}
						goal={dailyNutrition.goals.sodium}
						unit="mg"
						color="#EF4444"
						warning={goalPercentages.sodium > 90}
					/>
				</View>
			</View>

			{/* Water Intake */}
			<View className="bg-white mx-4 mb-4 rounded-xl p-6 shadow-sm">
				<WaterIntakeTracker
					current={dailyNutrition.waterIntake}
					goal={dailyNutrition.waterGoal}
					onAddWater={handleAddWater}
				/>
			</View>

			{/* Meals */}
			<View className="bg-white mx-4 mb-4 rounded-xl p-6 shadow-sm">
				<Text className="text-lg font-bold text-gray-900 mb-4">
					Today's Meals
				</Text>

				{["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
					const mealData = dailyNutrition.meals.filter(
						(m) => m.mealType === mealType,
					);

					return (
						<View key={mealType} className="mb-4">
							<View className="flex-row justify-between items-center mb-2">
								<Text className="text-sm font-semibold text-gray-700 capitalize">
									{mealType}
								</Text>
								<TouchableOpacity
									onPress={() => onAddMeal?.(mealType)}
									className="bg-blue-500 px-3 py-1 rounded-full"
								>
									<Text className="text-white text-xs font-medium">+ Add</Text>
								</TouchableOpacity>
							</View>

							{mealData.length === 0 ? (
								<Text className="text-gray-400 text-sm italic">
									No meals added
								</Text>
							) : (
								<View className="space-y-2">
									{mealData.map((meal) => (
										<View
											key={meal._id}
											className="flex-row justify-between items-center bg-gray-50 p-3 rounded-lg"
										>
											<View className="flex-1">
												<Text className="font-medium text-gray-900">
													{meal.recipeId?.title || "Unknown Recipe"}
												</Text>
												<Text className="text-sm text-gray-600">
													{meal.servings} serving
													{meal.servings !== 1 ? "s" : ""} •{" "}
													{meal.nutrition?.calories || 0} cal
												</Text>
											</View>
											<TouchableOpacity
												onPress={() => handleRemoveMeal(meal._id)}
												className="ml-2 p-2"
											>
												<Text className="text-red-500 text-sm">Remove</Text>
											</TouchableOpacity>
										</View>
									))}
								</View>
							)}
						</View>
					);
				})}
			</View>

			{/* Recommendations */}
			{recommendations.length > 0 && (
				<View className="bg-white mx-4 mb-4 rounded-xl p-6 shadow-sm">
					<Text className="text-lg font-bold text-gray-900 mb-4">
						Recommendations
					</Text>
					<View className="space-y-3">
						{recommendations.map((rec, index) => (
							<View
								key={index}
								className={`p-3 rounded-lg ${
									rec.priority === "high"
										? "bg-red-50 border border-red-200"
										: rec.priority === "medium"
											? "bg-yellow-50 border border-yellow-200"
											: "bg-blue-50 border border-blue-200"
								}`}
							>
								<Text
									className={`font-medium mb-1 ${
										rec.priority === "high"
											? "text-red-700"
											: rec.priority === "medium"
												? "text-yellow-700"
												: "text-blue-700"
									}`}
								>
									{rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
								</Text>
								<Text className="text-sm text-gray-700 mb-2">
									{rec.message}
								</Text>
								{rec.suggestions && rec.suggestions.length > 0 && (
									<View className="flex-row flex-wrap">
										{rec.suggestions.map((suggestion, idx) => (
											<View
												key={idx}
												className="bg-white px-2 py-1 rounded-full mr-2 mb-1"
											>
												<Text className="text-xs text-gray-600">
													{suggestion}
												</Text>
											</View>
										))}
									</View>
								)}
							</View>
						))}
					</View>
				</View>
			)}
		</ScrollView>
	);
}
