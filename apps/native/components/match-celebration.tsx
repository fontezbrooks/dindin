import { router } from "expo-router";
import type React from "react";
import { useEffect, useRef } from "react";
import {
	Animated,
	Dimensions,
	Image,
	Modal,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface MatchCelebrationProps {
	visible: boolean;
	match: {
		recipe: {
			title: string;
			imageUrl: string;
			cookTime?: number;
			difficulty?: string;
			cuisine?: string;
		};
		partner?: {
			name: string;
			avatar?: string;
		};
	} | null;
	onClose: () => void;
}

export const MatchCelebration: React.FC<MatchCelebrationProps> = ({
	visible,
	match,
	onClose,
}) => {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.8)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;
	const { width, height } = Dimensions.get("window");

	useEffect(() => {
		if (visible && match) {
			// Entrance animation
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.spring(scaleAnim, {
					toValue: 1,
					friction: 4,
					tension: 40,
					useNativeDriver: true,
				}),
				Animated.timing(slideAnim, {
					toValue: 0,
					duration: 400,
					useNativeDriver: true,
				}),
			]).start();

			// Auto dismiss after 5 seconds
			const timer = setTimeout(() => {
				handleClose();
			}, 5000);

			return () => clearTimeout(timer);
		} else {
			// Reset animations
			fadeAnim.setValue(0);
			scaleAnim.setValue(0.8);
			slideAnim.setValue(50);
		}
	}, [visible, match]);

	const handleClose = () => {
		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true,
		}).start(() => {
			onClose();
		});
	};

	const handleViewMatch = () => {
		handleClose();
		router.push("/(tabs)/matches");
	};

	if (!visible || !match) return null;

	return (
		<Modal
			transparent
			visible={visible}
			animationType="none"
			statusBarTranslucent
			onRequestClose={handleClose}
		>
			<Animated.View
				style={{
					flex: 1,
					backgroundColor: "rgba(0,0,0,0.8)",
					opacity: fadeAnim,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Animated.View
					style={{
						transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
						width: width * 0.85,
						maxWidth: 400,
					}}
					className="bg-white rounded-3xl overflow-hidden"
				>
					{/* Confetti or celebration image background */}
					<View className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-red-500 to-pink-500 opacity-20" />

					{/* Content */}
					<View className="p-6 items-center">
						{/* Title */}
						<Text className="text-3xl font-bold text-red-500 mb-2">
							It's a Match! 🎉
						</Text>

						{/* Partner info */}
						{match.partner && (
							<Text className="text-lg text-gray-700 mb-4 text-center">
								You and {match.partner.name} both liked
							</Text>
						)}

						{/* Recipe image */}
						{match.recipe.imageUrl && (
							<View className="w-full h-48 mb-4 rounded-2xl overflow-hidden shadow-lg">
								<Image
									source={{ uri: match.recipe.imageUrl }}
									className="w-full h-full"
									resizeMode="cover"
								/>
							</View>
						)}

						{/* Recipe title */}
						<Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
							{match.recipe.title}
						</Text>

						{/* Recipe details */}
						<View className="flex-row gap-3 mb-6">
							{match.recipe.cookTime && (
								<View className="bg-gray-100 px-3 py-1 rounded-full">
									<Text className="text-sm text-gray-600">
										🕐 {match.recipe.cookTime} min
									</Text>
								</View>
							)}
							{match.recipe.difficulty && (
								<View className="bg-gray-100 px-3 py-1 rounded-full">
									<Text className="text-sm text-gray-600">
										📊 {match.recipe.difficulty}
									</Text>
								</View>
							)}
							{match.recipe.cuisine && (
								<View className="bg-gray-100 px-3 py-1 rounded-full">
									<Text className="text-sm text-gray-600">
										🍴 {match.recipe.cuisine}
									</Text>
								</View>
							)}
						</View>

						{/* Action buttons */}
						<View className="flex-row gap-3 w-full">
							<TouchableOpacity
								className="flex-1 bg-red-500 py-3 rounded-full"
								onPress={handleViewMatch}
								activeOpacity={0.8}
							>
								<Text className="text-white font-semibold text-center">
									View Match
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								className="flex-1 bg-gray-200 py-3 rounded-full"
								onPress={handleClose}
								activeOpacity={0.8}
							>
								<Text className="text-gray-700 font-semibold text-center">
									Keep Swiping
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Animated.View>
			</Animated.View>
		</Modal>
	);
};
