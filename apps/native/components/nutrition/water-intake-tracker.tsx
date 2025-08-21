import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
	Alert,
	Modal,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface WaterIntakeTrackerProps {
	current: number; // in ounces
	goal: number; // in ounces
	onAddWater: (ounces: number) => void;
	className?: string;
}

export function WaterIntakeTracker({
	current,
	goal,
	onAddWater,
	className,
}: WaterIntakeTrackerProps) {
	const [showCustomModal, setShowCustomModal] = useState(false);
	const [customAmount, setCustomAmount] = useState("");

	const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
	const remaining = Math.max(0, goal - current);
	const isComplete = current >= goal;

	// Predefined amounts
	const quickAmounts = [4, 8, 12, 16, 20]; // ounces

	const handleQuickAdd = (ounces: number) => {
		onAddWater(ounces);
	};

	const handleCustomAdd = () => {
		const amount = parseFloat(customAmount);
		if (isNaN(amount) || amount <= 0) {
			Alert.alert("Invalid Amount", "Please enter a valid amount");
			return;
		}

		onAddWater(amount);
		setCustomAmount("");
		setShowCustomModal(false);
	};

	// Water drop animation path
	const WaterDrop = ({
		filled = false,
		size = 24,
	}: {
		filled?: boolean;
		size?: number;
	}) => (
		<Svg width={size} height={size} viewBox="0 0 24 24">
			<Path
				d="M12 2c-4.5 4.5-8 8.5-8 13 0 4.4 3.6 8 8 8s8-3.6 8-8c0-4.5-3.5-8.5-8-13z"
				fill={filled ? "#3B82F6" : "none"}
				stroke={filled ? "#3B82F6" : "#D1D5DB"}
				strokeWidth="2"
			/>
		</Svg>
	);

	// Generate water drops for visual display
	const totalDrops = 8;
	const filledDrops = Math.round((percentage / 100) * totalDrops);

	return (
		<View className={`${className || ""}`}>
			{/* Header */}
			<View className="flex-row justify-between items-center mb-4">
				<Text className="text-lg font-bold text-gray-900">Water Intake</Text>
				<TouchableOpacity
					onPress={() => setShowCustomModal(true)}
					className="bg-blue-500 px-3 py-1 rounded-full"
				>
					<Text className="text-white text-sm font-medium">Custom</Text>
				</TouchableOpacity>
			</View>

			{/* Progress Display */}
			<View className="bg-blue-50 rounded-xl p-4 mb-4">
				<View className="flex-row justify-between items-center mb-3">
					<View>
						<Text className="text-2xl font-bold text-blue-900">
							{current} oz
						</Text>
						<Text className="text-sm text-blue-700">of {goal} oz goal</Text>
					</View>

					<View className="items-center">
						<Text
							className={`text-xl font-bold ${
								isComplete ? "text-green-600" : "text-blue-600"
							}`}
						>
							{Math.round(percentage)}%
						</Text>
						{!isComplete ? (
							<Text className="text-xs text-blue-700">{remaining} oz left</Text>
						) : (
							<Text className="text-xs text-green-700">Goal reached! 🎉</Text>
						)}
					</View>
				</View>

				{/* Progress Bar */}
				<View className="h-3 bg-blue-200 rounded-full overflow-hidden">
					<LinearGradient
						colors={
							isComplete ? ["#10B981", "#059669"] : ["#3B82F6", "#1D4ED8"]
						}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						className="h-full rounded-full"
						style={{ width: `${Math.max(percentage, 2)}%` }}
					/>
				</View>
			</View>

			{/* Visual Water Drops */}
			<View className="bg-white rounded-xl p-4 mb-4">
				<Text className="text-sm font-medium text-gray-700 mb-3 text-center">
					Daily Progress
				</Text>
				<View className="flex-row justify-center items-center space-x-2 flex-wrap">
					{Array.from({ length: totalDrops }, (_, index) => (
						<WaterDrop key={index} filled={index < filledDrops} size={20} />
					))}
				</View>
			</View>

			{/* Quick Add Buttons */}
			<View className="bg-white rounded-xl p-4">
				<Text className="text-sm font-medium text-gray-700 mb-3 text-center">
					Quick Add
				</Text>
				<View className="flex-row flex-wrap justify-center gap-2">
					{quickAmounts.map((amount) => (
						<TouchableOpacity
							key={amount}
							onPress={() => handleQuickAdd(amount)}
							className="bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg min-w-16"
						>
							<Text className="text-blue-700 font-medium text-center">
								+{amount} oz
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Glass size indicators */}
				<View className="mt-3 flex-row justify-around">
					<View className="items-center">
						<Text className="text-xs text-gray-500">Small Cup</Text>
						<Text className="text-xs font-medium text-gray-700">4-8 oz</Text>
					</View>
					<View className="items-center">
						<Text className="text-xs text-gray-500">Large Cup</Text>
						<Text className="text-xs font-medium text-gray-700">12-16 oz</Text>
					</View>
					<View className="items-center">
						<Text className="text-xs text-gray-500">Water Bottle</Text>
						<Text className="text-xs font-medium text-gray-700">16-20 oz</Text>
					</View>
				</View>
			</View>

			{/* Custom Amount Modal */}
			<Modal
				visible={showCustomModal}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setShowCustomModal(false)}
			>
				<View className="flex-1 bg-black/50 justify-center items-center">
					<View className="bg-white rounded-xl p-6 mx-4 w-80">
						<Text className="text-lg font-bold text-gray-900 mb-4 text-center">
							Add Custom Amount
						</Text>

						<View className="mb-4">
							<Text className="text-sm font-medium text-gray-700 mb-2">
								Amount (ounces)
							</Text>
							<TextInput
								value={customAmount}
								onChangeText={setCustomAmount}
								placeholder="Enter amount..."
								keyboardType="decimal-pad"
								className="border border-gray-300 rounded-lg px-3 py-2 text-lg"
								autoFocus
							/>
						</View>

						<View className="flex-row space-x-3">
							<TouchableOpacity
								onPress={() => setShowCustomModal(false)}
								className="flex-1 bg-gray-200 py-3 rounded-lg"
							>
								<Text className="text-gray-700 font-medium text-center">
									Cancel
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={handleCustomAdd}
								className="flex-1 bg-blue-500 py-3 rounded-lg"
							>
								<Text className="text-white font-medium text-center">
									Add Water
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

// Compact version for dashboard
export function CompactWaterTracker({
	current,
	goal,
	onAddWater,
	className,
}: WaterIntakeTrackerProps) {
	const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
	const isComplete = current >= goal;

	return (
		<View className={`bg-blue-50 rounded-lg p-3 ${className || ""}`}>
			<View className="flex-row justify-between items-center mb-2">
				<Text className="text-sm font-medium text-blue-900">💧 Water</Text>
				<Text className="text-sm font-bold text-blue-900">
					{current}/{goal} oz
				</Text>
			</View>

			<View className="h-2 bg-blue-200 rounded-full overflow-hidden mb-2">
				<View
					className={`h-full rounded-full ${
						isComplete ? "bg-green-500" : "bg-blue-500"
					}`}
					style={{ width: `${Math.max(percentage, 2)}%` }}
				/>
			</View>

			<View className="flex-row space-x-1">
				<TouchableOpacity
					onPress={() => onAddWater(8)}
					className="bg-blue-200 px-2 py-1 rounded flex-1"
				>
					<Text className="text-blue-700 text-xs font-medium text-center">
						+8oz
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => onAddWater(16)}
					className="bg-blue-200 px-2 py-1 rounded flex-1"
				>
					<Text className="text-blue-700 text-xs font-medium text-center">
						+16oz
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

// Water intake reminders component
export function WaterReminder({
	current,
	goal,
	lastIntake,
	onRemind,
}: {
	current: number;
	goal: number;
	lastIntake?: Date;
	onRemind?: () => void;
}) {
	const hoursWithoutWater = lastIntake
		? Math.floor((Date.now() - lastIntake.getTime()) / (1000 * 60 * 60))
		: 0;

	const shouldRemind = hoursWithoutWater >= 2 || current / goal < 0.3;

	if (!shouldRemind) return null;

	return (
		<View className="bg-orange-50 border border-orange-200 rounded-lg p-3 mx-4 mb-4">
			<View className="flex-row items-center">
				<Text className="text-lg mr-2">💧</Text>
				<View className="flex-1">
					<Text className="text-sm font-medium text-orange-800">
						Hydration Reminder
					</Text>
					<Text className="text-xs text-orange-700">
						{hoursWithoutWater >= 2
							? `It's been ${hoursWithoutWater} hours since your last water intake`
							: `You're only at ${Math.round((current / goal) * 100)}% of your daily goal`}
					</Text>
				</View>
				{onRemind && (
					<TouchableOpacity
						onPress={onRemind}
						className="bg-orange-500 px-3 py-1 rounded-full"
					>
						<Text className="text-white text-xs font-medium">Remind Later</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}
