import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
	Animated,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

// Note: Install use-debounce package: npm install use-debounce
// import { useDebouncedCallback } from 'use-debounce';

// Temporary debounce implementation
const useDebouncedCallback = (callback: Function, delay: number) => {
	const timeoutRef = React.useRef<NodeJS.Timeout>();

	return React.useCallback(
		(...args: any[]) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => callback(...args), delay);
		},
		[callback, delay],
	);
};

interface RecipeSearchBarProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	showSuggestions?: boolean;
	suggestions?: string[];
	onSuggestionPress?: (suggestion: string) => void;
	autoFocus?: boolean;
}

export default function RecipeSearchBar({
	value,
	onChangeText,
	placeholder = "Search recipes...",
	showSuggestions = false,
	suggestions = [],
	onSuggestionPress,
	autoFocus = false,
}: RecipeSearchBarProps) {
	const [isFocused, setIsFocused] = useState(false);
	const [showClearButton, setShowClearButton] = useState(value.length > 0);
	const inputRef = useRef<TextInput>(null);
	const focusAnim = useRef(new Animated.Value(0)).current;

	// Debounced search to reduce API calls
	const debouncedSearch = useDebouncedCallback((text: string) => {
		onChangeText(text);
	}, 300);

	const handleFocus = useCallback(() => {
		setIsFocused(true);
		Animated.timing(focusAnim, {
			toValue: 1,
			duration: 200,
			useNativeDriver: false,
		}).start();
	}, [focusAnim]);

	const handleBlur = useCallback(() => {
		setIsFocused(false);
		Animated.timing(focusAnim, {
			toValue: 0,
			duration: 200,
			useNativeDriver: false,
		}).start();
	}, [focusAnim]);

	const handleTextChange = useCallback(
		(text: string) => {
			setShowClearButton(text.length > 0);
			debouncedSearch(text);
		},
		[debouncedSearch],
	);

	const handleClear = useCallback(() => {
		onChangeText("");
		setShowClearButton(false);
		inputRef.current?.focus();
	}, [onChangeText]);

	const borderColor = focusAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ["#E5E7EB", "#EC4899"],
	});

	const shadowOpacity = focusAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 0.1],
	});

	return (
		<View className="relative">
			<Animated.View
				style={{
					borderColor,
					shadowOpacity,
					shadowOffset: { width: 0, height: 2 },
					shadowRadius: 4,
					elevation: Platform.OS === "android" ? 2 : 0,
				}}
				className="bg-white rounded-2xl border-2 px-4 py-3 flex-row items-center"
			>
				<Ionicons
					name="search"
					size={20}
					color={isFocused ? "#EC4899" : "#9CA3AF"}
				/>
				<TextInput
					ref={inputRef}
					value={value}
					onChangeText={handleTextChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder={placeholder}
					placeholderTextColor="#9CA3AF"
					autoFocus={autoFocus}
					returnKeyType="search"
					className="flex-1 ml-3 text-gray-800 text-base"
					style={{ fontSize: 16 }}
				/>
				{showClearButton && (
					<TouchableOpacity
						onPress={handleClear}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Ionicons name="close-circle" size={20} color="#9CA3AF" />
					</TouchableOpacity>
				)}
			</Animated.View>

			{/* Search Suggestions */}
			{isFocused && showSuggestions && suggestions.length > 0 && (
				<View className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 mt-2 z-10 max-h-48">
					{suggestions.slice(0, 5).map((suggestion, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => onSuggestionPress?.(suggestion)}
							className={`px-4 py-3 flex-row items-center ${
								index !== suggestions.length - 1 && index !== 4
									? "border-b border-gray-100"
									: ""
							}`}
						>
							<Ionicons name="search" size={16} color="#9CA3AF" />
							<Text className="ml-3 text-gray-700 flex-1">{suggestion}</Text>
						</TouchableOpacity>
					))}
				</View>
			)}
		</View>
	);
}
