import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

interface MacroData {
	protein: number;
	carbohydrates: number;
	fat: number;
	calories: number;
}

interface MacroChartProps {
	macros: MacroData;
	size?: number;
	showPercentages?: boolean;
	showCalories?: boolean;
	className?: string;
}

export function MacroChart({
	macros,
	size = 200,
	showPercentages = true,
	showCalories = true,
	className,
}: MacroChartProps) {
	// Calculate macro percentages and calories
	const proteinCals = macros.protein * 4;
	const carbCals = macros.carbohydrates * 4;
	const fatCals = macros.fat * 9;
	const totalMacroCals = proteinCals + carbCals + fatCals;

	const percentages = {
		protein:
			totalMacroCals > 0 ? Math.round((proteinCals / totalMacroCals) * 100) : 0,
		carbs:
			totalMacroCals > 0 ? Math.round((carbCals / totalMacroCals) * 100) : 0,
		fat: totalMacroCals > 0 ? Math.round((fatCals / totalMacroCals) * 100) : 0,
	};

	// Colors for each macro
	const colors = {
		protein: "#3B82F6", // Blue
		carbs: "#10B981", // Green
		fat: "#F59E0B", // Amber
	};

	// Calculate pie chart segments
	const radius = (size - 40) / 2;
	const centerX = size / 2;
	const centerY = size / 2;

	const createArcPath = (startAngle: number, endAngle: number) => {
		const start = polarToCartesian(centerX, centerY, radius, startAngle);
		const end = polarToCartesian(centerX, centerY, radius, endAngle);
		const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

		return [
			"M",
			centerX,
			centerY,
			"L",
			start.x,
			start.y,
			"A",
			radius,
			radius,
			0,
			largeArcFlag,
			1,
			end.x,
			end.y,
			"Z",
		].join(" ");
	};

	const polarToCartesian = (
		centerX: number,
		centerY: number,
		radius: number,
		angleInDegrees: number,
	) => {
		const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians),
		};
	};

	// Calculate angles for each segment
	const currentAngle = 0;
	const proteinAngle = (percentages.protein / 100) * 360;
	const carbsAngle = (percentages.carbs / 100) * 360;
	const fatAngle = (percentages.fat / 100) * 360;

	return (
		<View className={`items-center ${className || ""}`}>
			{/* Pie Chart */}
			<View className="relative">
				<Svg width={size} height={size}>
					{/* Protein segment */}
					{percentages.protein > 0 && (
						<Path
							d={createArcPath(currentAngle, currentAngle + proteinAngle)}
							fill={colors.protein}
							stroke="white"
							strokeWidth="2"
						/>
					)}

					{/* Carbs segment */}
					{percentages.carbs > 0 && (
						<Path
							d={createArcPath(
								currentAngle + proteinAngle,
								currentAngle + proteinAngle + carbsAngle,
							)}
							fill={colors.carbs}
							stroke="white"
							strokeWidth="2"
						/>
					)}

					{/* Fat segment */}
					{percentages.fat > 0 && (
						<Path
							d={createArcPath(currentAngle + proteinAngle + carbsAngle, 360)}
							fill={colors.fat}
							stroke="white"
							strokeWidth="2"
						/>
					)}

					{/* Center circle for donut effect */}
					<Circle cx={centerX} cy={centerY} r={radius * 0.6} fill="white" />

					{/* Center text */}
					{showCalories && (
						<>
							<SvgText
								x={centerX}
								y={centerY - 10}
								textAnchor="middle"
								fontSize="24"
								fontWeight="bold"
								fill="#1F2937"
							>
								{macros.calories}
							</SvgText>
							<SvgText
								x={centerX}
								y={centerY + 10}
								textAnchor="middle"
								fontSize="12"
								fill="#6B7280"
							>
								calories
							</SvgText>
						</>
					)}
				</Svg>
			</View>

			{/* Legend */}
			<View className="mt-4 space-y-2">
				<MacroLegendItem
					color={colors.protein}
					label="Protein"
					grams={macros.protein}
					percentage={showPercentages ? percentages.protein : undefined}
					calories={proteinCals}
				/>
				<MacroLegendItem
					color={colors.carbs}
					label="Carbs"
					grams={macros.carbohydrates}
					percentage={showPercentages ? percentages.carbs : undefined}
					calories={carbCals}
				/>
				<MacroLegendItem
					color={colors.fat}
					label="Fat"
					grams={macros.fat}
					percentage={showPercentages ? percentages.fat : undefined}
					calories={fatCals}
				/>
			</View>
		</View>
	);
}

interface MacroLegendItemProps {
	color: string;
	label: string;
	grams: number;
	percentage?: number;
	calories: number;
}

function MacroLegendItem({
	color,
	label,
	grams,
	percentage,
	calories,
}: MacroLegendItemProps) {
	return (
		<View className="flex-row items-center justify-between w-48">
			<View className="flex-row items-center">
				<View
					className="w-4 h-4 rounded-full mr-3"
					style={{ backgroundColor: color }}
				/>
				<Text className="text-sm font-medium text-gray-700">{label}</Text>
			</View>
			<View className="flex-row items-center space-x-2">
				<Text className="text-sm font-bold text-gray-900">{grams}g</Text>
				{percentage !== undefined && (
					<Text className="text-sm text-gray-600">({percentage}%)</Text>
				)}
				<Text className="text-xs text-gray-500">{calories} cal</Text>
			</View>
		</View>
	);
}

// Alternative bar chart view for macros
export function MacroBarChart({ macros, className }: MacroChartProps) {
	const proteinCals = macros.protein * 4;
	const carbCals = macros.carbohydrates * 4;
	const fatCals = macros.fat * 9;
	const totalCals = macros.calories;

	const percentages = {
		protein: totalCals > 0 ? (proteinCals / totalCals) * 100 : 0,
		carbs: totalCals > 0 ? (carbCals / totalCals) * 100 : 0,
		fat: totalCals > 0 ? (fatCals / totalCals) * 100 : 0,
	};

	const colors = {
		protein: "#3B82F6",
		carbs: "#10B981",
		fat: "#F59E0B",
	};

	return (
		<View className={`space-y-4 ${className || ""}`}>
			<Text className="text-lg font-bold text-gray-900 text-center">
				Macro Distribution
			</Text>

			{/* Stacked bar */}
			<View className="h-8 bg-gray-200 rounded-lg overflow-hidden flex-row">
				<View
					className="h-full"
					style={{
						backgroundColor: colors.protein,
						width: `${percentages.protein}%`,
					}}
				/>
				<View
					className="h-full"
					style={{
						backgroundColor: colors.carbs,
						width: `${percentages.carbs}%`,
					}}
				/>
				<View
					className="h-full"
					style={{
						backgroundColor: colors.fat,
						width: `${percentages.fat}%`,
					}}
				/>
			</View>

			{/* Individual bars */}
			<View className="space-y-3">
				<MacroBarItem
					color={colors.protein}
					label="Protein"
					grams={macros.protein}
					percentage={Math.round(percentages.protein)}
					calories={proteinCals}
					maxValue={Math.max(macros.protein, macros.carbohydrates, macros.fat)}
				/>
				<MacroBarItem
					color={colors.carbs}
					label="Carbs"
					grams={macros.carbohydrates}
					percentage={Math.round(percentages.carbs)}
					calories={carbCals}
					maxValue={Math.max(macros.protein, macros.carbohydrates, macros.fat)}
				/>
				<MacroBarItem
					color={colors.fat}
					label="Fat"
					grams={macros.fat}
					percentage={Math.round(percentages.fat)}
					calories={fatCals}
					maxValue={Math.max(macros.protein, macros.carbohydrates, macros.fat)}
				/>
			</View>
		</View>
	);
}

interface MacroBarItemProps {
	color: string;
	label: string;
	grams: number;
	percentage: number;
	calories: number;
	maxValue: number;
}

function MacroBarItem({
	color,
	label,
	grams,
	percentage,
	calories,
	maxValue,
}: MacroBarItemProps) {
	const barWidth = maxValue > 0 ? (grams / maxValue) * 100 : 0;

	return (
		<View className="space-y-1">
			<View className="flex-row justify-between items-center">
				<Text className="text-sm font-medium text-gray-700">{label}</Text>
				<View className="flex-row items-center space-x-2">
					<Text className="text-sm font-bold text-gray-900">{grams}g</Text>
					<Text className="text-sm text-gray-600">({percentage}%)</Text>
					<Text className="text-xs text-gray-500">{calories} cal</Text>
				</View>
			</View>
			<View className="h-3 bg-gray-200 rounded-full overflow-hidden">
				<View
					className="h-full rounded-full"
					style={{
						backgroundColor: color,
						width: `${barWidth}%`,
					}}
				/>
			</View>
		</View>
	);
}
