import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

interface DietaryTagsBadgeProps {
	tags: string[];
	allergens?: string[];
	size?: "small" | "medium" | "large";
	layout?: "horizontal" | "vertical" | "wrap";
	showAllergenWarnings?: boolean;
	className?: string;
}

export function DietaryTagsBadge({
	tags = [],
	allergens = [],
	size = "medium",
	layout = "wrap",
	showAllergenWarnings = true,
	className,
}: DietaryTagsBadgeProps) {
	const tagStyles = getTagStyles();
	const allergenStyles = getAllergenStyles();

	const sizes = {
		small: {
			text: "text-xs",
			padding: "px-2 py-0.5",
			spacing: "space-x-1 space-y-1",
		},
		medium: {
			text: "text-sm",
			padding: "px-3 py-1",
			spacing: "space-x-2 space-y-1",
		},
		large: {
			text: "text-base",
			padding: "px-4 py-2",
			spacing: "space-x-2 space-y-2",
		},
	};

	const layoutClasses = {
		horizontal: "flex-row",
		vertical: "flex-col",
		wrap: "flex-row flex-wrap",
	};

	const currentSize = sizes[size];
	const allTags = [...tags, ...(showAllergenWarnings ? allergens : [])];

	if (allTags.length === 0) {
		return null;
	}

	return (
		<View
			className={`${layoutClasses[layout]} ${currentSize.spacing} ${className || ""}`}
		>
			{/* Dietary Tags */}
			{tags.map((tag, index) => {
				const style = tagStyles[tag] || tagStyles.default;

				return (
					<View
						key={`tag-${index}`}
						className={`rounded-full ${currentSize.padding} ${style.bg}`}
					>
						<Text className={`${currentSize.text} font-medium ${style.text}`}>
							{style.icon} {formatTagLabel(tag)}
						</Text>
					</View>
				);
			})}

			{/* Allergen Warnings */}
			{showAllergenWarnings &&
				allergens.map((allergen, index) => {
					const style = allergenStyles[allergen] || allergenStyles.default;

					return (
						<View
							key={`allergen-${index}`}
							className={`rounded-full ${currentSize.padding} ${style.bg} border border-red-200`}
						>
							<Text className={`${currentSize.text} font-bold ${style.text}`}>
								⚠️ {formatAllergenLabel(allergen)}
							</Text>
						</View>
					);
				})}
		</View>
	);
}

// Compact version for small spaces
export function CompactDietaryTags({
	tags,
	allergens,
	className,
}: Pick<DietaryTagsBadgeProps, "tags" | "allergens" | "className">) {
	const displayTags = tags.slice(0, 3);
	const remainingCount = tags.length - displayTags.length;
	const hasAllergens = allergens && allergens.length > 0;

	return (
		<View className={`flex-row items-center space-x-1 ${className || ""}`}>
			{displayTags.map((tag, index) => {
				const style = getTagStyles()[tag] || getTagStyles().default;
				return (
					<View key={index} className={`px-2 py-0.5 rounded-full ${style.bg}`}>
						<Text className={`text-xs font-medium ${style.text}`}>
							{getTagIcon(tag)}
						</Text>
					</View>
				);
			})}

			{remainingCount > 0 && (
				<View className="px-2 py-0.5 rounded-full bg-gray-200">
					<Text className="text-xs font-medium text-gray-700">
						+{remainingCount}
					</Text>
				</View>
			)}

			{hasAllergens && (
				<View className="px-2 py-0.5 rounded-full bg-red-100 border border-red-200">
					<Text className="text-xs font-bold text-red-700">
						⚠️ {allergens.length}
					</Text>
				</View>
			)}
		</View>
	);
}

// Large featured dietary badge for recipe headers
export function FeaturedDietaryBadge({
	tags,
	className,
}: Pick<DietaryTagsBadgeProps, "tags" | "className">) {
	const primaryTag = tags[0];
	if (!primaryTag) return null;

	const style = getTagStyles()[primaryTag] || getTagStyles().default;

	return (
		<LinearGradient
			colors={style.gradient || [style.bg, style.bg]}
			className={`px-6 py-3 rounded-xl ${className || ""}`}
		>
			<Text className={`text-lg font-bold ${style.text} text-center`}>
				{style.icon} {formatTagLabel(primaryTag)}
			</Text>
		</LinearGradient>
	);
}

// Helper functions
function getTagStyles() {
	return {
		vegan: {
			bg: "bg-green-100",
			text: "text-green-800",
			icon: "🌱",
			gradient: ["#D1FAE5", "#A7F3D0"],
		},
		vegetarian: {
			bg: "bg-green-100",
			text: "text-green-700",
			icon: "🥦",
			gradient: ["#D1FAE5", "#A7F3D0"],
		},
		"gluten-free": {
			bg: "bg-orange-100",
			text: "text-orange-800",
			icon: "🌾",
			gradient: ["#FED7AA", "#FDBA74"],
		},
		"dairy-free": {
			bg: "bg-blue-100",
			text: "text-blue-800",
			icon: "🥛",
			gradient: ["#DBEAFE", "#BFDBFE"],
		},
		"nut-free": {
			bg: "bg-yellow-100",
			text: "text-yellow-800",
			icon: "🥜",
			gradient: ["#FEF3C7", "#FDE68A"],
		},
		"soy-free": {
			bg: "bg-purple-100",
			text: "text-purple-800",
			icon: "🌱",
			gradient: ["#E9D5FF", "#DDD6FE"],
		},
		"egg-free": {
			bg: "bg-pink-100",
			text: "text-pink-800",
			icon: "🥚",
			gradient: ["#FCE7F3", "#FBCFE8"],
		},
		keto: {
			bg: "bg-indigo-100",
			text: "text-indigo-800",
			icon: "🥩",
			gradient: ["#E0E7FF", "#C7D2FE"],
		},
		"low-carb": {
			bg: "bg-teal-100",
			text: "text-teal-800",
			icon: "🍿",
			gradient: ["#CCFBF1", "#99F6E4"],
		},
		"high-protein": {
			bg: "bg-red-100",
			text: "text-red-800",
			icon: "💪",
			gradient: ["#FEE2E2", "#FECACA"],
		},
		"low-fat": {
			bg: "bg-emerald-100",
			text: "text-emerald-800",
			icon: "✨",
			gradient: ["#D1FAE5", "#A7F3D0"],
		},
		"low-sodium": {
			bg: "bg-cyan-100",
			text: "text-cyan-800",
			icon: "🧂",
			gradient: ["#CFFAFE", "#A5F3FC"],
		},
		paleo: {
			bg: "bg-amber-100",
			text: "text-amber-800",
			icon: "🦉",
			gradient: ["#FEF3C7", "#FDE68A"],
		},
		whole30: {
			bg: "bg-lime-100",
			text: "text-lime-800",
			icon: "🍏",
			gradient: ["#ECFCCB", "#D9F99D"],
		},
		mediterranean: {
			bg: "bg-blue-100",
			text: "text-blue-800",
			icon: "🌊",
			gradient: ["#DBEAFE", "#BFDBFE"],
		},
		dash: {
			bg: "bg-violet-100",
			text: "text-violet-800",
			icon: "❤️",
			gradient: ["#EDE9FE", "#DDD6FE"],
		},
		"anti-inflammatory": {
			bg: "bg-rose-100",
			text: "text-rose-800",
			icon: "🌿",
			gradient: ["#FFE4E6", "#FECDD3"],
		},
		"diabetic-friendly": {
			bg: "bg-green-100",
			text: "text-green-800",
			icon: "🩺",
			gradient: ["#D1FAE5", "#A7F3D0"],
		},
		"heart-healthy": {
			bg: "bg-red-100",
			text: "text-red-800",
			icon: "❤️",
			gradient: ["#FEE2E2", "#FECACA"],
		},
		completed: {
			bg: "bg-green-500",
			text: "text-white",
			icon: "✓",
			gradient: ["#10B981", "#059669"],
		},
		default: {
			bg: "bg-gray-100",
			text: "text-gray-800",
			icon: "🍽️",
			gradient: ["#F3F4F6", "#E5E7EB"],
		},
	};
}

function getAllergenStyles() {
	return {
		milk: {
			bg: "bg-red-50",
			text: "text-red-700",
			icon: "🥛",
		},
		eggs: {
			bg: "bg-red-50",
			text: "text-red-700",
			icon: "🥚",
		},
		fish: {
			bg: "bg-red-50",
			text: "text-red-700",
			icon: "🐠",
		},
		crustacean_shellfish: {
			bg: "bg-red-50",
			text: "text-red-700",
			icon: "🦐",
		},
		tree_nuts: {
			bg: "bg-red-50",
			text: "text-red-700",
			icon: "🥜",
		},
		peanuts: {
			bg: "bg-red-50",
			text: "text-red-700",
			icon: "🥜",
		},
		wheat: {
			bg: "bg-red-50",
			text: "text-red-700",
			icon: "🌾",
		},
		soybeans: {
			bg: "bg-red-50",
			text: "text-red-700",
			icon: "🌱",
		},
		sesame: {
			bg: "bg-red-50",
			text: "text-red-700",
			icon: "🥬",
		},
		default: {
			bg: "bg-red-50",
			text: "text-red-700",
			icon: "⚠️",
		},
	};
}

function formatTagLabel(tag: string): string {
	return tag
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function formatAllergenLabel(allergen: string): string {
	return allergen
		.replace("_", " ")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function getTagIcon(tag: string): string {
	const styles = getTagStyles();
	return styles[tag]?.icon || styles.default.icon;
}

// Hook for dietary filtering
export function useDietaryFilter(
	recipes: any[],
	selectedTags: string[],
	excludeAllergens: string[] = [],
) {
	return React.useMemo(() => {
		return recipes.filter((recipe) => {
			const recipeTags = recipe.nutrition?.dietaryTags || [];
			const recipeAllergens = recipe.nutrition?.allergens || [];

			// Check if recipe has all selected dietary tags
			const hasRequiredTags =
				selectedTags.length === 0 ||
				selectedTags.every((tag) => recipeTags.includes(tag));

			// Check if recipe has any excluded allergens
			const hasExcludedAllergens =
				excludeAllergens.length > 0 &&
				excludeAllergens.some((allergen) => recipeAllergens.includes(allergen));

			return hasRequiredTags && !hasExcludedAllergens;
		});
	}, [recipes, selectedTags, excludeAllergens]);
}
