import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useCallback, useState } from "react";
import {
	Alert,
	Dimensions,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { useDrop } from "react-native-dnd";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MealPlanCalendarProps {
	mealPlan: any;
	onDateSelect: (date: string) => void;
	onMealAssign: (date: string, mealType: string, recipeId: string) => void;
	selectedDate: string | null;
	viewMode: "week" | "month";
	onViewModeChange: (mode: "week" | "month") => void;
}

const { width: screenWidth } = Dimensions.get("window");

export const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({
	mealPlan,
	onDateSelect,
	onMealAssign,
	selectedDate,
	viewMode,
	onViewModeChange,
}) => {
	const insets = useSafeAreaInsets();
	const [currentMonth, setCurrentMonth] = useState(
		new Date().toISOString().slice(0, 7),
	);

	const getDayPlan = useCallback(
		(date: string) => {
			if (!mealPlan?.dailyPlans) return null;
			return mealPlan.dailyPlans.find(
				(plan: any) => plan.date.substring(0, 10) === date,
			);
		},
		[mealPlan],
	);

	const getMealIndicators = useCallback(
		(date: string) => {
			const dayPlan = getDayPlan(date);
			if (!dayPlan) return [];

			const indicators = [];
			const meals = dayPlan.meals;

			// Check each meal type for assignments
			if (meals.breakfast?.recipeId || meals.breakfast?.customMeal) {
				indicators.push({
					type: "breakfast",
					color: "#FF9500",
					completed: meals.breakfast.completed,
				});
			}
			if (meals.lunch?.recipeId || meals.lunch?.customMeal) {
				indicators.push({
					type: "lunch",
					color: "#34C759",
					completed: meals.lunch.completed,
				});
			}
			if (meals.dinner?.recipeId || meals.dinner?.customMeal) {
				indicators.push({
					type: "dinner",
					color: "#007AFF",
					completed: meals.dinner.completed,
				});
			}
			if (meals.snacks?.length > 0) {
				indicators.push({ type: "snacks", color: "#AF52DE", completed: false });
			}

			return indicators;
		},
		[getDayPlan],
	);

	const renderDay = (day: DateData) => {
		const indicators = getMealIndicators(day.dateString);
		const isSelected = selectedDate === day.dateString;
		const isToday = day.dateString === new Date().toISOString().slice(0, 10);

		return (
			<TouchableOpacity
				className={`w-12 h-12 items-center justify-center rounded-lg ${
					isSelected
						? "bg-blue-500"
						: isToday
							? "bg-blue-100"
							: "bg-transparent"
				}`}
				onPress={() => onDateSelect(day.dateString)}
			>
				<Text
					className={`text-base font-medium ${
						isSelected
							? "text-white"
							: isToday
								? "text-blue-600"
								: "text-gray-800"
					}`}
				>
					{day.day}
				</Text>

				{/* Meal indicators */}
				<View className="flex-row mt-0.5 space-x-0.5">
					{indicators.slice(0, 4).map((indicator, index) => (
						<View
							key={index}
							className="w-1.5 h-1.5 rounded-full"
							style={{
								backgroundColor: indicator.completed
									? indicator.color
									: `${indicator.color}80`,
								opacity: indicator.completed ? 1 : 0.6,
							}}
						/>
					))}
				</View>
			</TouchableOpacity>
		);
	};

	const renderWeekView = () => {
		if (!selectedDate || !mealPlan?.dailyPlans) return null;

		// Get the week containing the selected date
		const selectedDateObj = new Date(selectedDate);
		const startOfWeek = new Date(selectedDateObj);
		const day = startOfWeek.getDay();
		startOfWeek.setDate(startOfWeek.getDate() - day);

		const weekDays = Array.from({ length: 7 }, (_, i) => {
			const date = new Date(startOfWeek);
			date.setDate(startOfWeek.getDate() + i);
			return date.toISOString().slice(0, 10);
		});

		return (
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="flex-1"
				contentContainerStyle={{ paddingHorizontal: 16 }}
			>
				{weekDays.map((date) => (
					<WeekDayColumn
						key={date}
						date={date}
						dayPlan={getDayPlan(date)}
						onMealAssign={onMealAssign}
						isSelected={selectedDate === date}
						onDateSelect={onDateSelect}
					/>
				))}
			</ScrollView>
		);
	};

	return (
		<View className="flex-1 bg-white">
			{/* Header */}
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
				<View className="flex-row space-x-2">
					<TouchableOpacity
						className={`px-3 py-1.5 rounded-full ${
							viewMode === "week" ? "bg-blue-500" : "bg-gray-200"
						}`}
						onPress={() => onViewModeChange("week")}
					>
						<Text
							className={`text-sm font-medium ${
								viewMode === "week" ? "text-white" : "text-gray-600"
							}`}
						>
							Week
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className={`px-3 py-1.5 rounded-full ${
							viewMode === "month" ? "bg-blue-500" : "bg-gray-200"
						}`}
						onPress={() => onViewModeChange("month")}
					>
						<Text
							className={`text-sm font-medium ${
								viewMode === "month" ? "text-white" : "text-gray-600"
							}`}
						>
							Month
						</Text>
					</TouchableOpacity>
				</View>

				<Text className="text-lg font-semibold text-gray-800">
					{mealPlan?.title || "Meal Plan"}
				</Text>
			</View>

			{/* Calendar or Week View */}
			{viewMode === "month" ? (
				<Calendar
					current={currentMonth}
					onDayPress={onDateSelect}
					monthFormat={"MMMM yyyy"}
					onMonthChange={(month) =>
						setCurrentMonth(
							`${month.year}-${String(month.month).padStart(2, "0")}`,
						)
					}
					hideExtraDays={true}
					disableMonthChange={false}
					firstDay={0}
					hideDayNames={false}
					showWeekNumbers={false}
					onPressArrowLeft={(subtractMonth) => subtractMonth()}
					onPressArrowRight={(addMonth) => addMonth()}
					dayComponent={renderDay}
					theme={{
						backgroundColor: "#ffffff",
						calendarBackground: "#ffffff",
						textSectionTitleColor: "#b6c1cd",
						selectedDayBackgroundColor: "#007AFF",
						selectedDayTextColor: "#ffffff",
						todayTextColor: "#007AFF",
						dayTextColor: "#2d4150",
						textDisabledColor: "#d9e1e8",
						dotColor: "#00adf5",
						selectedDotColor: "#ffffff",
						arrowColor: "orange",
						disabledArrowColor: "#d9e1e8",
						monthTextColor: "blue",
						indicatorColor: "blue",
						textDayFontWeight: "300",
						textMonthFontWeight: "bold",
						textDayHeaderFontWeight: "300",
						textDayFontSize: 16,
						textMonthFontSize: 16,
						textDayHeaderFontSize: 13,
					}}
				/>
			) : (
				renderWeekView()
			)}

			{/* Legend */}
			<View className="px-4 py-3 border-t border-gray-200">
				<Text className="text-sm font-medium text-gray-600 mb-2">
					Meal Types
				</Text>
				<View className="flex-row flex-wrap space-x-4">
					<LegendItem color="#FF9500" label="Breakfast" />
					<LegendItem color="#34C759" label="Lunch" />
					<LegendItem color="#007AFF" label="Dinner" />
					<LegendItem color="#AF52DE" label="Snacks" />
				</View>
			</View>
		</View>
	);
};

interface WeekDayColumnProps {
	date: string;
	dayPlan: any;
	onMealAssign: (date: string, mealType: string, recipeId: string) => void;
	isSelected: boolean;
	onDateSelect: (date: string) => void;
}

const WeekDayColumn: React.FC<WeekDayColumnProps> = ({
	date,
	dayPlan,
	onMealAssign,
	isSelected,
	onDateSelect,
}) => {
	const dateObj = new Date(date);
	const dayName = dateObj.toLocaleDateString("en", { weekday: "short" });
	const dayNumber = dateObj.getDate();
	const isToday = date === new Date().toISOString().slice(0, 10);

	return (
		<View className="w-40 mx-2">
			{/* Day Header */}
			<TouchableOpacity
				className={`items-center py-2 rounded-t-lg ${
					isSelected ? "bg-blue-500" : isToday ? "bg-blue-100" : "bg-gray-50"
				}`}
				onPress={() => onDateSelect(date)}
			>
				<Text
					className={`text-sm font-medium ${
						isSelected
							? "text-white"
							: isToday
								? "text-blue-600"
								: "text-gray-600"
					}`}
				>
					{dayName}
				</Text>
				<Text
					className={`text-lg font-bold ${
						isSelected
							? "text-white"
							: isToday
								? "text-blue-600"
								: "text-gray-800"
					}`}
				>
					{dayNumber}
				</Text>
			</TouchableOpacity>

			{/* Meal Slots */}
			<View className="border border-gray-200 rounded-b-lg bg-white">
				<MealSlot
					mealType="breakfast"
					meal={dayPlan?.meals?.breakfast}
					date={date}
					onMealAssign={onMealAssign}
					color="#FF9500"
				/>
				<MealSlot
					mealType="lunch"
					meal={dayPlan?.meals?.lunch}
					date={date}
					onMealAssign={onMealAssign}
					color="#34C759"
				/>
				<MealSlot
					mealType="dinner"
					meal={dayPlan?.meals?.dinner}
					date={date}
					onMealAssign={onMealAssign}
					color="#007AFF"
				/>

				{/* Snacks */}
				{dayPlan?.meals?.snacks?.map((snack: any, index: number) => (
					<MealSlot
						key={`snack-${index}`}
						mealType="snack"
						meal={snack}
						date={date}
						onMealAssign={onMealAssign}
						color="#AF52DE"
						snackIndex={index}
					/>
				)) || (
					<MealSlot
						mealType="snack"
						meal={null}
						date={date}
						onMealAssign={onMealAssign}
						color="#AF52DE"
					/>
				)}
			</View>
		</View>
	);
};

interface MealSlotProps {
	mealType: string;
	meal: any;
	date: string;
	onMealAssign: (date: string, mealType: string, recipeId: string) => void;
	color: string;
	snackIndex?: number;
}

const MealSlot: React.FC<MealSlotProps> = ({
	mealType,
	meal,
	date,
	onMealAssign,
	color,
	snackIndex,
}) => {
	const [, drop] = useDrop(() => ({
		accept: "recipe",
		drop: (item: { recipeId: string }) => {
			onMealAssign(date, mealType, item.recipeId);
		},
	}));

	const handlePress = () => {
		Alert.alert(
			"Assign Meal",
			`Would you like to assign a recipe to ${mealType} on ${date}?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Choose Recipe",
					onPress: () => {
						// Navigate to recipe selection
					},
				},
			],
		);
	};

	return (
		<TouchableOpacity
			ref={drop}
			className="p-2 border-b border-gray-100 min-h-12"
			onPress={handlePress}
		>
			<View className="flex-row items-center space-x-2">
				<View
					className="w-3 h-3 rounded-full"
					style={{ backgroundColor: color }}
				/>

				{meal?.recipeId || meal?.customMeal ? (
					<View className="flex-1">
						<Text className="text-sm font-medium text-gray-800">
							{meal.recipeId?.title || meal.customMeal?.name || "Assigned Meal"}
						</Text>
						{meal.completed && (
							<View className="flex-row items-center mt-1">
								<Ionicons name="checkmark-circle" size={14} color="#34C759" />
								<Text className="text-xs text-green-600 ml-1">Completed</Text>
							</View>
						)}
					</View>
				) : (
					<Text className="text-sm text-gray-400 italic flex-1">
						Tap to assign {mealType}
					</Text>
				)}
			</View>
		</TouchableOpacity>
	);
};

interface LegendItemProps {
	color: string;
	label: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label }) => (
	<View className="flex-row items-center space-x-1">
		<View className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
		<Text className="text-xs text-gray-600">{label}</Text>
	</View>
);
