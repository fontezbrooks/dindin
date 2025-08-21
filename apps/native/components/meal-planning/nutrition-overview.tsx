import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

interface NutritionOverviewProps {
	nutritionData: {
		totalDays: number;
		averageDaily: {
			calories: number;
			protein: number;
			carbs: number;
			fat: number;
			fiber: number;
			sugar: number;
		};
		dailyBreakdown: Array<{
			date: string;
			calories: number;
			protein: number;
			carbs: number;
			fat: number;
			fiber: number;
			sugar: number;
		}>;
		weeklyTotals: {
			calories: number;
			protein: number;
			carbs: number;
			fat: number;
			fiber: number;
			sugar: number;
		};
	};
	targetCalories?: number;
	showCharts?: boolean;
}

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - 32;

export const NutritionOverview: React.FC<NutritionOverviewProps> = ({
	nutritionData,
	targetCalories = 2000,
	showCharts = true,
}) => {
	const chartConfig = {
		backgroundColor: "#ffffff",
		backgroundGradientFrom: "#ffffff",
		backgroundGradientTo: "#ffffff",
		decimalPlaces: 0,
		color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
		labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
		style: {
			borderRadius: 16,
		},
		propsForDots: {
			r: "6",
			strokeWidth: "2",
			stroke: "#3B82F6",
		},
	};

	const getMacroPercentages = () => {
		const { protein, carbs, fat } = nutritionData.averageDaily;
		const total = protein * 4 + carbs * 4 + fat * 9; // 4 cal/g for protein/carbs, 9 cal/g for fat

		if (total === 0) return { protein: 0, carbs: 0, fat: 0 };

		return {
			protein: Math.round(((protein * 4) / total) * 100),
			carbs: Math.round(((carbs * 4) / total) * 100),
			fat: Math.round(((fat * 9) / total) * 100),
		};
	};

	const getCaloriesTrend = () => {
		const last7Days = nutritionData.dailyBreakdown.slice(-7);

		return {
			labels: last7Days.map((day) => {
				const date = new Date(day.date);
				return date.toLocaleDateString("en", { weekday: "short" });
			}),
			datasets: [
				{
					data: last7Days.map((day) => day.calories || 0),
					color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
					strokeWidth: 2,
				},
			],
		};
	};

	const getMacroDistribution = () => {
		const percentages = getMacroPercentages();

		return [
			{
				name: "Protein",
				population: percentages.protein,
				color: "#10B981",
				legendFontColor: "#374151",
				legendFontSize: 12,
			},
			{
				name: "Carbs",
				population: percentages.carbs,
				color: "#F59E0B",
				legendFontColor: "#374151",
				legendFontSize: 12,
			},
			{
				name: "Fat",
				population: percentages.fat,
				color: "#EF4444",
				legendFontColor: "#374151",
				legendFontSize: 12,
			},
		];
	};

	const getNutrientComparison = () => {
		const { averageDaily } = nutritionData;
		const targets = {
			protein: (targetCalories * 0.15) / 4, // 15% of calories
			carbs: (targetCalories * 0.55) / 4, // 55% of calories
			fat: (targetCalories * 0.3) / 9, // 30% of calories
			fiber: 25, // recommended daily fiber
		};

		return [
			{
				name: "Current",
				protein: averageDaily.protein,
				carbs: averageDaily.carbs,
				fat: averageDaily.fat,
				fiber: averageDaily.fiber,
			},
			{
				name: "Target",
				protein: targets.protein,
				carbs: targets.carbs,
				fat: targets.fat,
				fiber: targets.fiber,
			},
		];
	};

	const macroPercentages = getMacroPercentages();
	const caloriesTrend = getCaloriesTrend();
	const macroDistribution = getMacroDistribution();

	return (
		<ScrollView className="flex-1 bg-gray-50">
			{/* Overview Cards */}
			<View className="flex-row flex-wrap justify-between px-4 py-6">
				<NutritionCard
					title="Avg. Calories"
					value={nutritionData.averageDaily.calories}
					target={targetCalories}
					unit="cal"
					color="#3B82F6"
					icon="flame-outline"
				/>

				<NutritionCard
					title="Protein"
					value={nutritionData.averageDaily.protein}
					target={(targetCalories * 0.15) / 4}
					unit="g"
					color="#10B981"
					icon="fitness-outline"
				/>

				<NutritionCard
					title="Carbs"
					value={nutritionData.averageDaily.carbs}
					target={(targetCalories * 0.55) / 4}
					unit="g"
					color="#F59E0B"
					icon="leaf-outline"
				/>

				<NutritionCard
					title="Fat"
					value={nutritionData.averageDaily.fat}
					target={(targetCalories * 0.3) / 9}
					unit="g"
					color="#EF4444"
					icon="water-outline"
				/>
			</View>

			{showCharts && nutritionData.dailyBreakdown.length > 0 && (
				<>
					{/* Calories Trend Chart */}
					<View className="bg-white mx-4 rounded-2xl p-4 mb-4 shadow-sm">
						<Text className="text-lg font-semibold text-gray-800 mb-4">
							Daily Calories (Last 7 Days)
						</Text>

						{caloriesTrend.datasets[0].data.length > 0 && (
							<LineChart
								data={caloriesTrend}
								width={chartWidth - 32}
								height={200}
								chartConfig={chartConfig}
								bezier
								style={{
									marginVertical: 8,
									borderRadius: 16,
								}}
							/>
						)}

						<View className="flex-row justify-between mt-4">
							<View className="items-center">
								<Text className="text-2xl font-bold text-blue-600">
									{Math.round(nutritionData.averageDaily.calories)}
								</Text>
								<Text className="text-sm text-gray-600">Avg. Daily</Text>
							</View>

							<View className="items-center">
								<Text className="text-2xl font-bold text-gray-800">
									{targetCalories}
								</Text>
								<Text className="text-sm text-gray-600">Target</Text>
							</View>

							<View className="items-center">
								<Text
									className={`text-2xl font-bold ${
										nutritionData.averageDaily.calories >= targetCalories
											? "text-green-600"
											: "text-orange-600"
									}`}
								>
									{Math.round(
										(nutritionData.averageDaily.calories / targetCalories) *
											100,
									)}
									%
								</Text>
								<Text className="text-sm text-gray-600">of Target</Text>
							</View>
						</View>
					</View>

					{/* Macronutrient Distribution */}
					<View className="bg-white mx-4 rounded-2xl p-4 mb-4 shadow-sm">
						<Text className="text-lg font-semibold text-gray-800 mb-4">
							Macronutrient Distribution
						</Text>

						<PieChart
							data={macroDistribution}
							width={chartWidth - 32}
							height={200}
							chartConfig={chartConfig}
							accessor="population"
							backgroundColor="transparent"
							paddingLeft="15"
							center={[10, 10]}
							absolute
						/>

						<View className="flex-row justify-between mt-4">
							<MacroInfo
								label="Protein"
								percentage={macroPercentages.protein}
								grams={nutritionData.averageDaily.protein}
								color="#10B981"
							/>
							<MacroInfo
								label="Carbs"
								percentage={macroPercentages.carbs}
								grams={nutritionData.averageDaily.carbs}
								color="#F59E0B"
							/>
							<MacroInfo
								label="Fat"
								percentage={macroPercentages.fat}
								grams={nutritionData.averageDaily.fat}
								color="#EF4444"
							/>
						</View>
					</View>

					{/* Nutrient Details */}
					<View className="bg-white mx-4 rounded-2xl p-4 mb-4 shadow-sm">
						<Text className="text-lg font-semibold text-gray-800 mb-4">
							Nutrient Details
						</Text>

						<View className="space-y-4">
							<NutrientRow
								label="Fiber"
								value={nutritionData.averageDaily.fiber}
								target={25}
								unit="g"
								color="#8B5CF6"
							/>

							<NutrientRow
								label="Sugar"
								value={nutritionData.averageDaily.sugar}
								target={50}
								unit="g"
								color="#EC4899"
								isLowerBetter
							/>
						</View>
					</View>

					{/* Weekly Summary */}
					<View className="bg-white mx-4 rounded-2xl p-4 mb-6 shadow-sm">
						<Text className="text-lg font-semibold text-gray-800 mb-4">
							Weekly Summary
						</Text>

						<View className="flex-row justify-between">
							<View className="items-center">
								<Text className="text-2xl font-bold text-gray-800">
									{Math.round(nutritionData.weeklyTotals.calories / 1000)}K
								</Text>
								<Text className="text-sm text-gray-600">Total Calories</Text>
							</View>

							<View className="items-center">
								<Text className="text-2xl font-bold text-green-600">
									{Math.round(nutritionData.weeklyTotals.protein)}g
								</Text>
								<Text className="text-sm text-gray-600">Protein</Text>
							</View>

							<View className="items-center">
								<Text className="text-2xl font-bold text-blue-600">
									{Math.round(nutritionData.weeklyTotals.fiber)}g
								</Text>
								<Text className="text-sm text-gray-600">Fiber</Text>
							</View>
						</View>
					</View>
				</>
			)}
		</ScrollView>
	);
};

interface NutritionCardProps {
	title: string;
	value: number;
	target: number;
	unit: string;
	color: string;
	icon: string;
}

const NutritionCard: React.FC<NutritionCardProps> = ({
	title,
	value,
	target,
	unit,
	color,
	icon,
}) => {
	const percentage = target > 0 ? Math.round((value / target) * 100) : 0;
	const isOnTrack = percentage >= 80 && percentage <= 120;

	return (
		<View className="bg-white rounded-2xl p-4 w-[48%] mb-4 shadow-sm">
			<View className="flex-row items-center justify-between mb-3">
				<Ionicons name={icon as any} size={20} color={color} />
				<Text
					className={`text-xs font-medium ${
						isOnTrack
							? "text-green-600"
							: percentage < 80
								? "text-orange-600"
								: "text-red-600"
					}`}
				>
					{percentage}%
				</Text>
			</View>

			<Text className="text-2xl font-bold text-gray-800 mb-1">
				{Math.round(value)}
				<Text className="text-lg text-gray-600">{unit}</Text>
			</Text>

			<Text className="text-sm text-gray-600">{title}</Text>

			<View className="mt-3">
				<View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
					<View
						className="h-full rounded-full"
						style={{
							width: `${Math.min(percentage, 100)}%`,
							backgroundColor: color,
						}}
					/>
				</View>
				<Text className="text-xs text-gray-500 mt-1">
					Target: {Math.round(target)}
					{unit}
				</Text>
			</View>
		</View>
	);
};

interface MacroInfoProps {
	label: string;
	percentage: number;
	grams: number;
	color: string;
}

const MacroInfo: React.FC<MacroInfoProps> = ({
	label,
	percentage,
	grams,
	color,
}) => (
	<View className="items-center">
		<View className="flex-row items-center mb-1">
			<View
				className="w-3 h-3 rounded-full mr-2"
				style={{ backgroundColor: color }}
			/>
			<Text className="text-sm font-medium text-gray-800">{label}</Text>
		</View>
		<Text className="text-lg font-bold text-gray-800">{percentage}%</Text>
		<Text className="text-xs text-gray-600">{Math.round(grams)}g</Text>
	</View>
);

interface NutrientRowProps {
	label: string;
	value: number;
	target: number;
	unit: string;
	color: string;
	isLowerBetter?: boolean;
}

const NutrientRow: React.FC<NutrientRowProps> = ({
	label,
	value,
	target,
	unit,
	color,
	isLowerBetter = false,
}) => {
	const percentage = target > 0 ? Math.round((value / target) * 100) : 0;
	const isGood = isLowerBetter ? percentage <= 100 : percentage >= 80;

	return (
		<View>
			<View className="flex-row justify-between items-center mb-2">
				<Text className="text-base font-medium text-gray-800">{label}</Text>
				<Text className="text-sm text-gray-600">
					{Math.round(value)}/{target}
					{unit}
				</Text>
			</View>

			<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
				<View
					className="h-full rounded-full"
					style={{
						width: `${Math.min(percentage, 100)}%`,
						backgroundColor: isGood ? color : "#EF4444",
					}}
				/>
			</View>

			<Text className="text-xs text-gray-500 mt-1">
				{percentage}% of {isLowerBetter ? "limit" : "target"}
			</Text>
		</View>
	);
};
