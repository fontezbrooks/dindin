import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
	interpolate,
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { MatchCelebration } from "@/components/match-celebration";
import {
	useMatchWebSocket,
	useWebSocket,
} from "@/components/providers/websocket-provider";
import { RecipeCard } from "@/components/recipe-card";
import { trpc } from "@/utils/trpc";
import { wsManager } from "@/utils/websocket-manager";

export default function SwipeScreen() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [matchCelebration, setMatchCelebration] = useState<any>(null);
	const [showMatchModal, setShowMatchModal] = useState(false);
	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);
	// Shared values for next card (always create to maintain hooks order)
	const nextTranslateX = useSharedValue(0);
	const nextTranslateY = useSharedValue(0);

	// WebSocket connection
	const { isConnected, sendPartnerActivity } = useWebSocket();

	// Fetch recipe stack
	const {
		data: recipes,
		isLoading,
		refetch,
	} = trpc.recipe.getRecipeStack.useQuery(
		{ limit: 10 },
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	);

	// Like recipe mutation
	const likeMutation = trpc.recipe.likeRecipe.useMutation({
		onSuccess: (data) => {
			if (data.matched && data.recipe) {
				// Show match celebration modal
				setMatchCelebration({
					recipe: data.recipe,
					partner: { name: "Your Partner" }, // You can fetch partner info if needed
				});
				setShowMatchModal(true);
			}
		},
		onError: (error) => {
			Alert.alert("Error", error.message);
		},
	});

	// Listen for real-time match notifications
	useMatchWebSocket((matchData) => {
		console.log("Received match notification:", matchData);
		// Show celebration for matches created by partner
		if (matchData && matchData.recipe) {
			setMatchCelebration({
				recipe: matchData.recipe,
				partner: { name: "Your Partner" },
			});
			setShowMatchModal(true);
		}
	});

	// Listen for partner activity
	useEffect(() => {
		const handlePartnerSwiping = (data: any) => {
			console.log("Partner is swiping:", data);
			// You can show a subtle indicator that partner is active
		};

		wsManager.on("partnerSwiping", handlePartnerSwiping);

		return () => {
			wsManager.off("partnerSwiping", handlePartnerSwiping);
		};
	}, []);

	const currentRecipe = recipes?.[currentIndex];
	const nextRecipe = recipes?.[currentIndex + 1];

	const handleSwipe = useCallback(
		(isLike: boolean) => {
			if (!currentRecipe) return;

			// Send partner activity notification if connected
			if (isConnected) {
				sendPartnerActivity("swiping", {
					recipeId: currentRecipe._id,
					recipeTitle: currentRecipe.title,
					action: isLike ? "liked" : "passed",
				});
			}

			// Trigger the like/dislike mutation
			likeMutation.mutate({
				recipeId: currentRecipe._id,
				isLike,
			});

			// Move to next recipe
			setCurrentIndex((prev) => prev + 1);

			// Reset animation values
			translateX.value = 0;
			translateY.value = 0;

			// Refetch if we're running low on recipes
			if (recipes && currentIndex >= recipes.length - 3) {
				refetch();
			}
		},
		[
			currentRecipe,
			currentIndex,
			recipes,
			likeMutation,
			refetch,
			translateX,
			translateY,
			isConnected,
			sendPartnerActivity,
		],
	);

	const gestureHandler = useAnimatedGestureHandler({
		onStart: () => {
			"worklet";
		},
		onActive: (event) => {
			"worklet";
			translateX.value = event.translationX;
			translateY.value = event.translationY;
		},
		onEnd: () => {
			"worklet";
			const swipeThreshold = 120;

			if (Math.abs(translateX.value) > swipeThreshold) {
				const isLike = translateX.value > 0;

				// Animate card off screen
				translateX.value = withSpring(
					isLike ? 500 : -500,
					{ damping: 20, stiffness: 200 },
					() => {
						runOnJS(handleSwipe)(isLike);
					},
				);
			} else {
				// Spring back to center
				translateX.value = withSpring(0);
				translateY.value = withSpring(0);
			}
		},
	});

	const handleButtonPress = (isLike: boolean) => {
		if (!currentRecipe) return;

		// Animate card off screen
		translateX.value = withSpring(
			isLike ? 500 : -500,
			{ damping: 20, stiffness: 200 },
			() => {
				runOnJS(handleSwipe)(isLike);
			},
		);
	};

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-gray-50">
				<ActivityIndicator size="large" color="#FF6B6B" />
				<Text className="text-gray-600 mt-4">Loading recipes...</Text>
			</View>
		);
	}

	if (!recipes || recipes.length === 0) {
		return (
			<View className="flex-1 items-center justify-center bg-gray-50 px-8">
				<Ionicons name="restaurant-outline" size={80} color="#9CA3AF" />
				<Text className="text-xl font-bold text-gray-900 mt-4">
					No Recipes Available
				</Text>
				<Text className="text-gray-600 text-center mt-2">
					Check back later for new recipes to swipe through!
				</Text>
				<Pressable
					onPress={() => refetch()}
					className="mt-6 px-6 py-3 bg-pink-500 rounded-full"
				>
					<Text className="text-white font-semibold">Refresh</Text>
				</Pressable>
			</View>
		);
	}

	if (currentIndex >= recipes.length) {
		return (
			<View className="flex-1 items-center justify-center bg-gray-50 px-8">
				<Ionicons name="checkmark-circle-outline" size={80} color="#10B981" />
				<Text className="text-xl font-bold text-gray-900 mt-4">
					All Caught Up!
				</Text>
				<Text className="text-gray-600 text-center mt-2">
					You've seen all available recipes. Check your matches or come back
					later!
				</Text>
				<Pressable
					onPress={() => {
						setCurrentIndex(0);
						refetch();
					}}
					className="mt-6 px-6 py-3 bg-pink-500 rounded-full"
				>
					<Text className="text-white font-semibold">Start Over</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<View className="flex-1">
				{/* Header */}
				<View className="px-6 py-4">
					<Text className="text-3xl font-bold text-gray-900">Discover</Text>
					<Text className="text-gray-600 mt-1">
						Swipe to find recipes you both love
					</Text>
				</View>

				{/* Cards Container */}
				<View className="flex-1 items-center justify-center">
					{/* Next card (underneath) */}
					{nextRecipe && (
						<View className="absolute w-[90vw] h-[70vh]">
							<RecipeCard
								recipe={nextRecipe}
								translateX={nextTranslateX}
								translateY={nextTranslateY}
								isTop={false}
							/>
						</View>
					)}

					{/* Current card (on top) */}
					{currentRecipe && (
						<PanGestureHandler onGestureEvent={gestureHandler}>
							<Animated.View className="absolute w-[90vw] h-[70vh]">
								<RecipeCard
									recipe={currentRecipe}
									translateX={translateX}
									translateY={translateY}
									isTop={true}
								/>
							</Animated.View>
						</PanGestureHandler>
					)}
				</View>

				{/* Action Buttons */}
				<View className="flex-row justify-center gap-8 pb-8">
					<Pressable
						onPress={() => handleButtonPress(false)}
						className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg"
					>
						<Ionicons name="close" size={32} color="#EF4444" />
					</Pressable>

					<Pressable
						onPress={() => handleButtonPress(true)}
						className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg"
					>
						<Ionicons name="heart" size={32} color="#10B981" />
					</Pressable>
				</View>
			</View>

			{/* Match Celebration Modal */}
			<MatchCelebration
				visible={showMatchModal}
				match={matchCelebration}
				onClose={() => {
					setShowMatchModal(false);
					setMatchCelebration(null);
				}}
			/>
		</SafeAreaView>
	);
}
