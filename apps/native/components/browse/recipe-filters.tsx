import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useCallback, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface IRecipeFilters {
  category?: string;
  cuisine?: string;
  difficulty?: "easy" | "medium" | "hard";
  maxCookTime?: number;
  dietaryRestrictions?: string[];
  sortBy?: "popularity" | "rating" | "newest" | "cookTime";
}

interface RecipeFiltersProps {
  filters: IRecipeFilters;
  onFiltersChange: (filters: IRecipeFilters) => void;
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Snacks",
  "Appetizers",
  "Beverages",
];

const CUISINES = [
  "All",
  "Italian",
  "Chinese",
  "Mexican",
  "Indian",
  "Japanese",
  "Thai",
  "French",
  "Greek",
  "American",
  "Mediterranean",
  "Korean",
  "Vietnamese",
];

const DIFFICULTIES = [
  { label: "All", value: undefined },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const COOK_TIMES = [
  { label: "Any time", value: undefined },
  { label: "Under 15 min", value: 15 },
  { label: "Under 30 min", value: 30 },
  { label: "Under 1 hour", value: 60 },
  { label: "Under 2 hours", value: 120 },
];

const DIETARY_RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Low-Carb",
  "Paleo",
  "Nut-Free",
  "Soy-Free",
  "Halal",
  "Kosher",
];

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popularity" },
  { label: "Highest Rated", value: "rating" },
  { label: "Newest First", value: "newest" },
  { label: "Quickest First", value: "cookTime" },
];

const { width } = Dimensions.get("window");

export default function RecipeFilter({
  filters,
  onFiltersChange,
  visible,
  onClose,
}: RecipeFiltersProps) {
  const [tempFilters, setTempFilters] = useState<IRecipeFilters>(filters);

  const handleApplyFilters = useCallback(() => {
    onFiltersChange(tempFilters);
    onClose();
  }, [tempFilters, onFiltersChange, onClose]);

  const handleClearFilters = useCallback(() => {
    const clearedFilters: IRecipeFilters = {
      category: undefined,
      cuisine: undefined,
      difficulty: undefined,
      maxCookTime: undefined,
      dietaryRestrictions: [],
      sortBy: "popularity",
    };
    setTempFilters(clearedFilters);
  }, []);

  const handleDietaryToggle = useCallback(
    (restriction: string) => {
      const current = tempFilters.dietaryRestrictions || [];
      const updated = current.includes(restriction)
        ? current.filter((r) => r !== restriction)
        : [...current, restriction];

      setTempFilters((prev) => ({ ...prev, dietaryRestrictions: updated }));
    },
    [tempFilters.dietaryRestrictions]
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category && filters.category !== "All") count++;
    if (filters.cuisine && filters.cuisine !== "All") count++;
    if (filters.difficulty) count++;
    if (filters.maxCookTime) count++;
    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0)
      count++;
    return count;
  };

  const renderFilterSection = (title: string, children: React.ReactNode) => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-3">{title}</Text>
      {children}
    </View>
  );

  const renderChips = (
    options: any[],
    selectedValue: any,
    onSelect: (value: any) => void,
    keyField = "value",
    labelField = "label"
  ) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-4"
    >
      <View className="flex-row px-4 gap-2">
        {options.map((option) => {
          const value = typeof option === "string" ? option : option[keyField];
          const label =
            typeof option === "string" ? option : option[labelField];
          const isSelected =
            selectedValue === value || (value === undefined && !selectedValue);

          return (
            <TouchableOpacity
              key={option}
              onPress={() => onSelect(value === "All" ? undefined : value)}
              className={`px-4 py-2 rounded-full border ${
                isSelected
                  ? "bg-pink-500 border-pink-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`font-medium ${
                  isSelected ? "text-white" : "text-gray-700"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800">
              Filters & Sort
            </Text>
            <TouchableOpacity onPress={handleClearFilters}>
              <Text className="text-pink-500 font-semibold">Clear All</Text>
            </TouchableOpacity>
          </View>
          {getActiveFiltersCount() > 0 && (
            <View className="mt-2">
              <Text className="text-sm text-gray-600">
                {getActiveFiltersCount()} filter
                {getActiveFiltersCount() !== 1 ? "s" : ""} applied
              </Text>
            </View>
          )}
        </View>

        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {/* Sort By */}
          {renderFilterSection(
            "Sort By",
            renderChips(SORT_OPTIONS, tempFilters.sortBy, (value) =>
              setTempFilters((prev) => ({ ...prev, sortBy: value }))
            )
          )}

          {/* Category */}
          {renderFilterSection(
            "Category",
            renderChips(CATEGORIES, tempFilters.category, (value) =>
              setTempFilters((prev) => ({ ...prev, category: value }))
            )
          )}

          {/* Cuisine */}
          {renderFilterSection(
            "Cuisine",
            renderChips(CUISINES, tempFilters.cuisine, (value) =>
              setTempFilters((prev) => ({ ...prev, cuisine: value }))
            )
          )}

          {/* Difficulty */}
          {renderFilterSection(
            "Difficulty",
            renderChips(DIFFICULTIES, tempFilters.difficulty, (value) =>
              setTempFilters((prev) => ({ ...prev, difficulty: value }))
            )
          )}

          {/* Cook Time */}
          {renderFilterSection(
            "Maximum Cook Time",
            renderChips(COOK_TIMES, tempFilters.maxCookTime, (value) =>
              setTempFilters((prev) => ({ ...prev, maxCookTime: value }))
            )
          )}

          {/* Dietary Restrictions */}
          {renderFilterSection(
            "Dietary Restrictions",
            <View className="flex-row flex-wrap gap-2">
              {DIETARY_RESTRICTIONS.map((restriction) => {
                const isSelected =
                  tempFilters.dietaryRestrictions?.includes(restriction) ||
                  false;
                return (
                  <TouchableOpacity
                    key={restriction}
                    onPress={() => handleDietaryToggle(restriction)}
                    className={`px-3 py-2 rounded-full border ${
                      isSelected
                        ? "bg-pink-500 border-pink-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {restriction}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Apply Button */}
        <View className="bg-white px-4 py-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={handleApplyFilters}
            className="bg-pink-500 rounded-xl py-4 items-center"
          >
            <Text className="text-white font-bold text-lg">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
