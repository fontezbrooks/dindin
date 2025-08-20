import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    // TODO: Implement password reset logic
    alert('Password reset link sent to your email!');
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-6 justify-center">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
            Reset Password
          </Text>
          <Text className="text-center text-gray-600">
            Enter your email and we'll send you a link to reset your password
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            className="bg-pink-500 rounded-lg p-4 items-center mt-4"
            onPress={handleResetPassword}
          >
            <Text className="text-white font-bold text-lg">Send Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="mt-4"
            onPress={() => router.back()}
          >
            <Text className="text-center text-gray-600">Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}