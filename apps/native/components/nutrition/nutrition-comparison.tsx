import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { DietaryTagsBadge } from "./dietary-tags-badge";
import { MacroBarChart, MacroChart } from "./macro-chart";
import { NutritionProgressBar } from "./nutrition-progress-bar";

interface NutritionData {
	calories: number;
	protein: number;
	carbohydrates: number;
	fat: number;
	fiber?: number;
	sugar?: number;
	sodium: number;
	saturatedFat?: number;
	cholesterol?: number;
	vitaminA?: number;
	vitaminC?: number;
	calcium?: number;
	iron?: number;
	servings: number;
	dietaryTags?: string[];
	allergens?: string[];
}

interface Recipe {
	_id: string;
	title: string;
	image_url?: string;
	cook_time?: number;
	servings?: number;
	nutrition?: NutritionData;
}

interface NutritionComparisonData {
	recipe1: {
		nutrition: NutritionData;
		macroPercentages: any;
		servings: number;
	};
	recipe2: {
		nutrition: NutritionData;
		macroPercentages: any;
		servings: number;
	};
	comparison: {
		calories: {
			recipe1: number;
			recipe2: number;
			difference: number;
			percentDifference: number;
		};
		protein: {
			recipe1: number;
			recipe2: number;
			difference: number;
			percentDifference: number;
		};
		carbohydrates: {
			recipe1: number;
			recipe2: number;
			difference: number;
			percentDifference: number;
		};
		fat: {
			recipe1: number;
			recipe2: number;
			difference: number;
			percentDifference: number;
		};
	};
}

interface NutritionComparisonProps {
	recipe1: Recipe;
	recipe2: Recipe;
	servings1?: number;
	servings2?: number;
	onServingsChange?: (recipeId: string, servings: number) => void;
	className?: string;
}

export function NutritionComparison({
	recipe1,
	recipe2,
	servings1 = 1,
	servings2 = 1,
	onServingsChange,
	className,
}: NutritionComparisonProps) {
	const [comparisonData, setComparisonData] =
		useState<NutritionComparisonData | null>(null);
	const [loading, setLoading] = useState(false);
	const [viewMode, setViewMode] = useState<"overview" | "detailed" | "visual">(
		"overview",
	);

	React.useEffect(() => {
		loadComparison();
	}, [recipe1._id, recipe2._id, servings1, servings2]);

	const loadComparison = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`/api/nutrition/compare/${recipe1._id}/${recipe2._id}?servings1=${servings1}&servings2=${servings2}`,
			);
			if (response.ok) {
				const data = await response.json();
				setComparisonData(data);
			}
		} catch (error) {
			console.error("Error loading comparison:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading || !comparisonData) {
		return (
			<View className="flex-1 justify-center items-center p-6">
				<Text className="text-gray-600">Loading comparison...</Text>
			</View>
		);
	}

	return (
		<ScrollView className={`flex-1 bg-gray-50 ${className || ""}`}>
			{/* Header */}
			<View className="bg-white p-6 border-b border-gray-200">
				<Text className="text-2xl font-bold text-gray-900 mb-2">
					Nutrition Comparison
				</Text>

				{/* Recipe Headers */}
				<View className="flex-row space-x-4">
					<RecipeHeader
						recipe={recipe1}
						servings={servings1}
						onServingsChange={onServingsChange}
					/>
					<Text className="text-2xl text-gray-400 self-center font-light">
						vs
					</Text>
					<RecipeHeader
						recipe={recipe2}
						servings={servings2}
						onServingsChange={onServingsChange}
					/>
				</View>
			</View>

			{/* View Mode Tabs */}
			<View className="bg-white px-6 py-3 border-b border-gray-200">
				<View className="flex-row space-x-1">
					{(["overview", "detailed", "visual"] as const).map((mode) => (
						<TouchableOpacity
							key={mode}
							onPress={() => setViewMode(mode)}
							className={`px-4 py-2 rounded-lg ${
								viewMode === mode
									? "bg-blue-100 border border-blue-200"
									: "bg-gray-100"
							}`}
						>
							<Text
								className={`text-sm font-medium capitalize ${
									viewMode === mode ? "text-blue-700" : "text-gray-600"
								}`}
							>
								{mode}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			{/* Content based on view mode */}
			{viewMode === "overview" && (
				<OverviewComparison
					data={comparisonData}
					recipe1={recipe1}
					recipe2={recipe2}
				/>
			)}

			{viewMode === "detailed" && (
				<DetailedComparison
					data={comparisonData}
					recipe1={recipe1}
					recipe2={recipe2}
				/>
			)}

			{viewMode === "visual" && (
				<VisualComparison
					data={comparisonData}
					recipe1={recipe1}
					recipe2={recipe2}
				/>
			)}
		</ScrollView>
	);
}

// Recipe header component
function RecipeHeader({
	recipe,
	servings,
	onServingsChange,
}: {
	recipe: Recipe;
	servings: number;
	onServingsChange?: (recipeId: string, servings: number) => void;
}) {
	return (
		<View className="flex-1 bg-gray-50 rounded-lg p-3">
			<Text className="font-bold text-gray-900 mb-1" numberOfLines={2}>
				{recipe.title}
			</Text>

			<View className="flex-row items-center justify-between">
				<Text className="text-sm text-gray-600">
					{recipe.cook_time ? `${recipe.cook_time} min` : ""}
				</Text>

				{onServingsChange && (
					<View className="flex-row items-center space-x-2">
						<TouchableOpacity
							onPress={() =>
								onServingsChange(recipe._id, Math.max(0.5, servings - 0.5))
							}
							className="w-6 h-6 bg-gray-300 rounded-full justify-center items-center"
						>
							<Text className="text-gray-700 font-bold">-</Text>
						</TouchableOpacity>

						<Text className="text-sm font-medium min-w-12 text-center">
							{servings} serving{servings !== 1 ? "s" : ""}
						</Text>

						<TouchableOpacity
							onPress={() => onServingsChange(recipe._id, servings + 0.5)}
							className="w-6 h-6 bg-gray-300 rounded-full justify-center items-center"
						>
							<Text className="text-gray-700 font-bold">+</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>

			{recipe.nutrition?.dietaryTags && (
				<View className="mt-2">
					<DietaryTagsBadge
						tags={recipe.nutrition.dietaryTags.slice(0, 3)}
						size="small"
						layout="horizontal"
					/>
				</View>
			)}
		</View>
	);
}

// Overview comparison
function OverviewComparison({
	data,
	recipe1,
	recipe2,
}: {
	data: NutritionComparisonData;
	recipe1: Recipe;
	recipe2: Recipe;
}) {
	const { comparison } = data;

	return (
		<View className="p-6 space-y-6">
			{/* Quick Stats */}
			<View className="bg-white rounded-xl p-6 shadow-sm">
				<Text className="text-lg font-bold text-gray-900 mb-4">
					Quick Comparison
				</Text>

				<View className="space-y-4">
					{Object.entries(comparison).map(([nutrient, comp]) => (
						<ComparisonRow
							key={nutrient}
							label={nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
							recipe1Value={comp.recipe1}
							recipe2Value={comp.recipe2}
							unit={getNutrientUnit(nutrient)}
							difference={comp.difference}
							percentDifference={comp.percentDifference}
						/>
					))}
				</View>
			</View>

			{/* Winner Summary */}
			<View className="bg-white rounded-xl p-6 shadow-sm">
				<Text className="text-lg font-bold text-gray-900 mb-4">
					Which is Better?
				</Text>

				<View className="space-y-3">
					{getWinnerSummary(comparison, recipe1.title, recipe2.title).map(
						(item, index) => (
							<View key={index} className="flex-row items-center">
								<Text className="text-2xl mr-3">{item.icon}</Text>
								<View className="flex-1">
									<Text className="font-medium text-gray-900">
										{item.category}
									</Text>
									<Text className="text-sm text-gray-600">
										{item.winner} {item.reason}
									</Text>
								</View>
							</View>
						),
					)}
				</View>
			</View>

			{/* Dietary Tags Comparison */}
			{(recipe1.nutrition?.dietaryTags || recipe2.nutrition?.dietaryTags) && (
				<View className="bg-white rounded-xl p-6 shadow-sm">
					<Text className="text-lg font-bold text-gray-900 mb-4">
						Dietary Information
					</Text>

					<View className="space-y-4">
						<View>
							<Text className="font-medium text-gray-700 mb-2">
								{recipe1.title}
							</Text>
							<DietaryTagsBadge
								tags={recipe1.nutrition?.dietaryTags || []}
								allergens={recipe1.nutrition?.allergens || []}
							/>
						</View>

						<View>
							<Text className="font-medium text-gray-700 mb-2">
								{recipe2.title}
							</Text>
							<DietaryTagsBadge
								tags={recipe2.nutrition?.dietaryTags || []}
								allergens={recipe2.nutrition?.allergens || []}
							/>
						</View>
					</View>
				</View>
			)}
		</View>
	);
}

// Detailed comparison
function DetailedComparison({
	data,
	recipe1,
	recipe2,
}: {
	data: NutritionComparisonData;
	recipe1: Recipe;
	recipe2: Recipe;
}) {
	const nutrition1 = data.recipe1.nutrition;
	const nutrition2 = data.recipe2.nutrition;

	const nutrients = [
		{ key: "calories", label: "Calories", unit: "" },
		{ key: "protein", label: "Protein", unit: "g" },
		{ key: "carbohydrates", label: "Carbohydrates", unit: "g" },
		{ key: "fat", label: "Total Fat", unit: "g" },
		{ key: "saturatedFat", label: "Saturated Fat", unit: "g" },
		{ key: "fiber", label: "Fiber", unit: "g" },
		{ key: "sugar", label: "Sugar", unit: "g" },
		{ key: "sodium", label: "Sodium", unit: "mg" },
		{ key: "cholesterol", label: "Cholesterol", unit: "mg" },
		{ key: "vitaminA", label: "Vitamin A", unit: "IU" },
		{ key: "vitaminC", label: "Vitamin C", unit: "mg" },
		{ key: "calcium", label: "Calcium", unit: "mg" },
		{ key: "iron", label: "Iron", unit: "mg" },
	];

	return (
		<View className="p-6">
			<View className="bg-white rounded-xl shadow-sm">
				<View className="p-6 border-b border-gray-200">
					<Text className="text-lg font-bold text-gray-900">
						Detailed Nutrition Facts
					</Text>
				</View>

				<View className="overflow-hidden">
					{/* Table Header */}
					<View className="flex-row bg-gray-50 px-6 py-3">
						<Text className="flex-1 font-medium text-gray-700">Nutrient</Text>
						<Text className="w-20 font-medium text-gray-700 text-center">
							{recipe1.title.slice(0, 10)}...
						</Text>
						<Text className="w-20 font-medium text-gray-700 text-center">
							{recipe2.title.slice(0, 10)}...
						</Text>
						<Text className="w-16 font-medium text-gray-700 text-center">
							Diff
						</Text>
					</View>

					{/* Table Rows */}
					{nutrients.map((nutrient, index) => {
						const value1 = nutrition1[nutrient.key] || 0;
						const value2 = nutrition2[nutrient.key] || 0;
						const diff = value2 - value1;
						const isHigher = Math.abs(diff) > 0;

						return (
							<View
								key={nutrient.key}
								className={`flex-row px-6 py-3 ${
									index % 2 === 0 ? "bg-white" : "bg-gray-50"
								}`}
							>
								<Text className="flex-1 text-sm text-gray-900">
									{nutrient.label}
								</Text>
								<Text className="w-20 text-sm text-gray-900 text-center">
									{formatNutrientValue(value1, nutrient.unit)}
								</Text>
								<Text className="w-20 text-sm text-gray-900 text-center">
									{formatNutrientValue(value2, nutrient.unit)}
								</Text>
								<Text
									className={`w-16 text-xs text-center font-medium ${
										!isHigher
											? "text-gray-400"
											: diff > 0
												? "text-green-600"
												: "text-red-600"
									}`}
								>
									{isHigher
										? (diff > 0 ? "+" : "") +
											formatNutrientValue(diff, nutrient.unit, false)
										: "-"}
								</Text>
							</View>
						);
					})}
				</View>
			</View>
		</View>
	);
}

// Visual comparison
function VisualComparison({
	data,
	recipe1,
	recipe2,
}: {
	data: NutritionComparisonData;
	recipe1: Recipe;
	recipe2: Recipe;
}) {
	const macro1 = {
		protein: data.recipe1.nutrition.protein,
		carbohydrates: data.recipe1.nutrition.carbohydrates,
		fat: data.recipe1.nutrition.fat,
		calories: data.recipe1.nutrition.calories,
	};

	const macro2 = {
		protein: data.recipe2.nutrition.protein,
		carbohydrates: data.recipe2.nutrition.carbohydrates,
		fat: data.recipe2.nutrition.fat,
		calories: data.recipe2.nutrition.calories,
	};

	return (
		<View className="p-6 space-y-6">
			{/* Macro Charts Side by Side */}
			<View className="bg-white rounded-xl p-6 shadow-sm">
				<Text className="text-lg font-bold text-gray-900 mb-4 text-center">
					Macro Distribution
				</Text>

				<View className="flex-row space-x-4">
					<View className="flex-1">
						<Text className="text-sm font-medium text-gray-700 mb-3 text-center">
							{recipe1.title}
						</Text>
						<MacroChart macros={macro1} size={150} showCalories={false} />
					</View>

					<View className="flex-1">
						<Text className="text-sm font-medium text-gray-700 mb-3 text-center">
							{recipe2.title}
						</Text>
						<MacroChart macros={macro2} size={150} showCalories={false} />
					</View>
				</View>
			</View>

			{/* Bar Chart Comparison */}
			<View className="bg-white rounded-xl p-6 shadow-sm">
				<Text className="text-lg font-bold text-gray-900 mb-4">
					Side-by-Side Comparison
				</Text>

				<View className="space-y-6">
					{Object.entries(data.comparison).map(([nutrient, comp]) => (
						<View key={nutrient}>
							<Text className="text-sm font-medium text-gray-700 mb-2 capitalize">
								{nutrient}
							</Text>

							<View className="flex-row space-x-4">
								<View className="flex-1">
									<View className="flex-row justify-between items-center mb-1">
										<Text className="text-xs text-gray-600">
											{recipe1.title.slice(0, 15)}...
										</Text>
										<Text className="text-xs font-bold text-gray-900">
											{comp.recipe1}
											{getNutrientUnit(nutrient)}
										</Text>
									</View>
									<View className="h-3 bg-gray-200 rounded-full overflow-hidden">
										<View
											className="h-full bg-blue-500 rounded-full"
											style={{
												width: `${getBarWidth(comp.recipe1, Math.max(comp.recipe1, comp.recipe2))}%`,
											}}
										/>
									</View>
								</View>

								<View className="flex-1">
									<View className="flex-row justify-between items-center mb-1">
										<Text className="text-xs text-gray-600">
											{recipe2.title.slice(0, 15)}...
										</Text>
										<Text className="text-xs font-bold text-gray-900">
											{comp.recipe2}
											{getNutrientUnit(nutrient)}
										</Text>
									</View>
									<View className="h-3 bg-gray-200 rounded-full overflow-hidden">
										<View
											className="h-full bg-green-500 rounded-full"
											style={{
												width: `${getBarWidth(comp.recipe2, Math.max(comp.recipe1, comp.recipe2))}%`,
											}}
										/>
									</View>
								</View>
							</View>
						</View>
					))}
				</View>
			</View>
		</View>
	);
}

// Comparison row component
function ComparisonRow({
	label,
	recipe1Value,
	recipe2Value,
	unit,
	difference,
	percentDifference,
}: {
	label: string;
	recipe1Value: number;
	recipe2Value: number;
	unit: string;
	difference: number;
	percentDifference: number;
}) {
	const isSignificantDiff = Math.abs(percentDifference) > 10;
	const higherValue = recipe2Value > recipe1Value;

	return (
		<View className="flex-row items-center justify-between py-2">
			<Text className="font-medium text-gray-700">{label}</Text>

			<View className="flex-row items-center space-x-4">
				<Text
					className={`text-sm ${
						!isSignificantDiff
							? "text-gray-900"
							: higherValue
								? "text-red-600"
								: "text-blue-600"
					}`}
				>
					{recipe1Value}
					{unit}
				</Text>

				<Text className="text-xs text-gray-400">vs</Text>

				<Text
					className={`text-sm ${
						!isSignificantDiff
							? "text-gray-900"
							: higherValue
								? "text-blue-600"
								: "text-red-600"
					}`}
				>
					{recipe2Value}
					{unit}
				</Text>

				{isSignificantDiff && (
					<Text
						className={`text-xs font-medium ${
							higherValue ? "text-green-600" : "text-red-600"
						}`}
					>
						({percentDifference > 0 ? "+" : ""}
						{percentDifference}%)
					</Text>
				)}
			</View>
		</View>
	);
}

// Helper functions
function getNutrientUnit(nutrient: string): string {
	const units = {
		calories: "",
		protein: "g",
		carbohydrates: "g",
		fat: "g",
		sodium: "mg",
	};
	return units[nutrient] || "g";
}

function formatNutrientValue(
	value: number,
	unit: string,
	showUnit: boolean = true,
): string {
	const formatted = typeof value === "number" ? value.toFixed(1) : "0.0";
	return showUnit ? `${formatted}${unit}` : formatted;
}

function getBarWidth(value: number, maxValue: number): number {
	return maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 0;
}

function getWinnerSummary(
	comparison: any,
	recipe1Title: string,
	recipe2Title: string,
) {
	const results = [];

	// Calories (lower is usually better)
	if (Math.abs(comparison.calories.percentDifference) > 10) {
		results.push({
			icon: "🔥",
			category: "Calories",
			winner:
				comparison.calories.recipe1 < comparison.calories.recipe2
					? recipe1Title
					: recipe2Title,
			reason: `has ${Math.abs(comparison.calories.difference)} fewer calories`,
		});
	}

	// Protein (higher is usually better)
	if (Math.abs(comparison.protein.percentDifference) > 15) {
		results.push({
			icon: "💪",
			category: "Protein",
			winner:
				comparison.protein.recipe1 > comparison.protein.recipe2
					? recipe1Title
					: recipe2Title,
			reason: `has ${Math.abs(comparison.protein.difference)}g more protein`,
		});
	}

	// Fat (context dependent)
	if (Math.abs(comparison.fat.percentDifference) > 20) {
		results.push({
			icon: "🥩",
			category: "Fat Content",
			winner:
				comparison.fat.recipe1 < comparison.fat.recipe2
					? recipe1Title
					: recipe2Title,
			reason: `has ${Math.abs(comparison.fat.difference)}g less fat`,
		});
	}

	return results.length > 0
		? results
		: [
				{
					icon: "⚖️",
					category: "Overall",
					winner: "Both recipes",
					reason: "are nutritionally similar",
				},
			];
}
