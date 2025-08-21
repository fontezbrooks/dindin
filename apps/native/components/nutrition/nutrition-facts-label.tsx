import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

interface NutritionData {
	calories: number;
	protein: number;
	carbohydrates: number;
	fat: number;
	saturatedFat?: number;
	transFat?: number;
	cholesterol?: number;
	sodium: number;
	fiber?: number;
	sugar?: number;
	vitaminA?: number;
	vitaminC?: number;
	calcium?: number;
	iron?: number;
	servings: number;
}

interface NutritionFactsLabelProps {
	nutrition: NutritionData;
	dailyValuePercentages?: { [key: string]: number };
	className?: string;
}

export function NutritionFactsLabel({
	nutrition,
	dailyValuePercentages = {},
	className,
}: NutritionFactsLabelProps) {
	const formatValue = (value?: number, unit: string = "g") => {
		if (!value && value !== 0) return "--";
		if (unit === "mg" && value >= 1000) {
			return `${(value / 1000).toFixed(1)}g`;
		}
		return `${value}${unit}`;
	};

	const formatDV = (nutrient: string) => {
		const percentage = dailyValuePercentages[nutrient];
		return percentage ? `${percentage}%` : "";
	};

	return (
		<View className={`bg-white border border-gray-300 p-3 ${className || ""}`}>
			{/* Header */}
			<View className="border-b-2 border-gray-900 pb-1 mb-2">
				<Text className="text-2xl font-black text-gray-900">
					Nutrition Facts
				</Text>
				<Text className="text-sm text-gray-700">
					Per {nutrition.servings} serving{nutrition.servings !== 1 ? "s" : ""}
				</Text>
			</View>

			{/* Calories */}
			<View className="border-b-4 border-gray-900 py-1 mb-2">
				<View className="flex-row items-baseline">
					<Text className="text-lg font-bold text-gray-900">Calories </Text>
					<Text className="text-3xl font-black text-gray-900">
						{nutrition.calories}
					</Text>
				</View>
			</View>

			{/* Daily Value Header */}
			<View className="border-b border-gray-400 pb-1 mb-1">
				<Text className="text-xs text-right text-gray-700 font-bold">
					% Daily Value*
				</Text>
			</View>

			{/* Macronutrients */}
			<NutrientRow
				label="Total Fat"
				value={formatValue(nutrition.fat)}
				dailyValue={formatDV("fat")}
				bold
			/>

			{nutrition.saturatedFat !== undefined && (
				<NutrientRow
					label="Saturated Fat"
					value={formatValue(nutrition.saturatedFat)}
					dailyValue={formatDV("saturatedFat")}
					indent
				/>
			)}

			{nutrition.transFat !== undefined && (
				<NutrientRow
					label="Trans Fat"
					value={formatValue(nutrition.transFat)}
					indent
				/>
			)}

			{nutrition.cholesterol !== undefined && (
				<NutrientRow
					label="Cholesterol"
					value={formatValue(nutrition.cholesterol, "mg")}
					dailyValue={formatDV("cholesterol")}
					bold
					border
				/>
			)}

			<NutrientRow
				label="Sodium"
				value={formatValue(nutrition.sodium, "mg")}
				dailyValue={formatDV("sodium")}
				bold
				border
			/>

			<NutrientRow
				label="Total Carbohydrate"
				value={formatValue(nutrition.carbohydrates)}
				dailyValue={formatDV("carbohydrates")}
				bold
				border
			/>

			{nutrition.fiber !== undefined && (
				<NutrientRow
					label="Dietary Fiber"
					value={formatValue(nutrition.fiber)}
					dailyValue={formatDV("fiber")}
					indent
				/>
			)}

			{nutrition.sugar !== undefined && (
				<NutrientRow
					label="Total Sugars"
					value={formatValue(nutrition.sugar)}
					indent
				/>
			)}

			<NutrientRow
				label="Protein"
				value={formatValue(nutrition.protein)}
				dailyValue={formatDV("protein")}
				bold
				border
			/>

			{/* Vitamins and Minerals */}
			{(nutrition.vitaminA ||
				nutrition.vitaminC ||
				nutrition.calcium ||
				nutrition.iron) && (
				<View className="border-t-4 border-gray-900 mt-2 pt-2">
					{nutrition.vitaminA !== undefined && (
						<NutrientRow
							label="Vitamin A"
							value={formatValue(nutrition.vitaminA, "IU")}
							dailyValue={formatDV("vitaminA")}
						/>
					)}
					{nutrition.vitaminC !== undefined && (
						<NutrientRow
							label="Vitamin C"
							value={formatValue(nutrition.vitaminC, "mg")}
							dailyValue={formatDV("vitaminC")}
						/>
					)}
					{nutrition.calcium !== undefined && (
						<NutrientRow
							label="Calcium"
							value={formatValue(nutrition.calcium, "mg")}
							dailyValue={formatDV("calcium")}
						/>
					)}
					{nutrition.iron !== undefined && (
						<NutrientRow
							label="Iron"
							value={formatValue(nutrition.iron, "mg")}
							dailyValue={formatDV("iron")}
						/>
					)}
				</View>
			)}

			{/* Footer */}
			<View className="border-t border-gray-400 mt-2 pt-1">
				<Text className="text-xs text-gray-600 leading-4">
					*The % Daily Value (DV) tells you how much a nutrient in a serving of
					food contributes to a daily diet. 2,000 calories a day is used for
					general nutrition advice.
				</Text>
			</View>
		</View>
	);
}

interface NutrientRowProps {
	label: string;
	value: string;
	dailyValue?: string;
	bold?: boolean;
	indent?: boolean;
	border?: boolean;
}

function NutrientRow({
	label,
	value,
	dailyValue,
	bold = false,
	indent = false,
	border = false,
}: NutrientRowProps) {
	return (
		<View
			className={`flex-row justify-between items-center py-0.5 ${
				border ? "border-b border-gray-300" : ""
			}`}
		>
			<Text
				className={`text-sm ${
					bold ? "font-bold text-gray-900" : "text-gray-800"
				} ${indent ? "ml-4" : ""}`}
			>
				{label}
			</Text>
			<View className="flex-row items-center">
				<Text
					className={`text-sm ${
						bold ? "font-bold text-gray-900" : "text-gray-800"
					}`}
				>
					{value}
				</Text>
				{dailyValue && (
					<Text className="text-sm font-bold text-gray-900 ml-4 w-8 text-right">
						{dailyValue}
					</Text>
				)}
			</View>
		</View>
	);
}
