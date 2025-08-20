import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function Badge({ text, variant = 'default' }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'danger':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <View className={`px-3 py-1.5 rounded-full ${getVariantStyles()}`}>
      <Text className="font-medium text-sm">{text}</Text>
    </View>
  );
}