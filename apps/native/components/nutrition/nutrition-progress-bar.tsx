import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

interface NutritionProgressBarProps {
	label: string;
	current: number;
	goal: number;
	unit: string;
	color?: string;
	size?: "small" | "medium" | "large";
	showPercentage?: boolean;
	warning?: boolean;
	className?: string;
}

export function NutritionProgressBar({
	label,
	current,
	goal,
	unit,
	color = "#3B82F6",
	size = "medium",
	showPercentage = true,
	warning = false,
	className,
}: NutritionProgressBarProps) {
	const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
	const isOverGoal = current > goal;
	const remaining = Math.max(0, goal - current);

	const heights = {
		small: "h-2",
		medium: "h-3",
		large: "h-4",
	};

	const textSizes = {
		small: "text-xs",
		medium: "text-sm",
		large: "text-base",
	};

	const getBarColor = () => {
		if (warning || isOverGoal) {
			return ["#EF4444", "#DC2626"]; // Red gradient
		}
		if (percentage >= 100) {
			return ["#10B981", "#059669"]; // Green gradient
		}
		if (percentage >= 75) {
			return ["#F59E0B", "#D97706"]; // Amber gradient
		}
		return [color, color];
	};

	const getProgressWidth = () => {
		if (isOverGoal) {
			return 100; // Fill entire bar when over goal
		}
		return Math.max(percentage, 2); // Minimum 2% for visibility
	};

	return (
		<View className={`${className || ""}`}>
			{/* Label and Values */}
			<View className="flex-row justify-between items-center mb-2">
				<Text className={`font-medium text-gray-700 ${textSizes[size]}`}>
					{label}
				</Text>
				<View className="flex-row items-center space-x-2">
					<Text className={`font-bold text-gray-900 ${textSizes[size]}`}>
						{current.toLocaleString()}
					</Text>
					<Text className={`text-gray-600 ${textSizes[size]}`}>
						/ {goal.toLocaleString()} {unit}
					</Text>
					{showPercentage && (
						<Text
							className={`font-medium ${
								warning || isOverGoal
									? "text-red-600"
									: percentage >= 100
										? "text-green-600"
										: percentage >= 75
											? "text-amber-600"
											: "text-blue-600"
							} ${textSizes[size]}`}
						>
							({Math.round(percentage)}%)
						</Text>
					)}
				</View>
			</View>

			{/* Progress Bar */}
			<View
				className={`bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}
			>
				<LinearGradient
					colors={getBarColor()}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					className={`${heights[size]} rounded-full`}
					style={{ width: `${getProgressWidth()}%` }}
				/>

				{/* Over-goal indicator */}
				{isOverGoal && (
					<View
						className="absolute top-0 right-0 bg-red-600/20 h-full"
						style={{
							width: `${Math.min(((current - goal) / goal) * 100, 50)}%`,
						}}
					/>
				)}
			</View>

			{/* Additional Info */}
			{size !== "small" && (
				<View className="flex-row justify-between items-center mt-1">
					{!isOverGoal ? (
						<Text className="text-xs text-gray-500">
							{remaining.toLocaleString()} {unit} remaining
						</Text>
					) : (
						<Text className="text-xs text-red-500">
							{(current - goal).toLocaleString()} {unit} over goal
						</Text>
					)}

					{warning && (
						<Text className="text-xs text-red-500 font-medium">
							⚠️ High intake
						</Text>
					)}
				</View>
			)}
		</View>
	);
}

// Compact version for dashboard views
export function CompactNutritionProgress({
	label,
	current,
	goal,
	unit,
	color = "#3B82F6",
	className,
}: Omit<NutritionProgressBarProps, "size" | "showPercentage">) {
	const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
	const isComplete = percentage >= 100;

	return (
		<View className={`${className || ""}`}>
			<View className="flex-row items-center justify-between mb-1">
				<Text className="text-xs font-medium text-gray-600">{label}</Text>
				<Text className="text-xs font-bold text-gray-900">
					{current}/{goal} {unit}
				</Text>
			</View>

			<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
				<View
					className={`h-full rounded-full ${
						isComplete ? "bg-green-500" : "bg-blue-500"
					}`}
					style={{ width: `${Math.max(percentage, 2)}%` }}
				/>
			</View>

			<Text
				className={`text-xs mt-1 ${
					isComplete ? "text-green-600" : "text-gray-500"
				}`}
			>
				{Math.round(percentage)}% complete
			</Text>
		</View>
	);
}

// Ring progress indicator for circular layouts
export function RingNutritionProgress({
	label,
	current,
	goal,
	unit,
	color = "#3B82F6",
	size = 80,
	className,
}: Omit<NutritionProgressBarProps, "size"> & { size?: number }) {
	const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
	const strokeWidth = 8;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<View className={`items-center ${className || ""}`}>
			<View className="relative" style={{ width: size, height: size }}>
				<svg width={size} height={size} className="transform -rotate-90">
					{/* Background circle */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="#E5E7EB"
						strokeWidth={strokeWidth}
						fill="none"
					/>

					{/* Progress circle */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke={color}
						strokeWidth={strokeWidth}
						fill="none"
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						className="transition-all duration-500"
					/>
				</svg>

				{/* Center content */}
				<View className="absolute inset-0 justify-center items-center">
					<Text className="text-lg font-bold text-gray-900">
						{Math.round(percentage)}%
					</Text>
					<Text className="text-xs text-gray-600">{label}</Text>
				</View>
			</View>

			<Text className="text-sm font-medium text-gray-700 mt-2">
				{current}/{goal} {unit}
			</Text>
		</View>
	);
}
