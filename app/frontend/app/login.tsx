import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Login functionality would go here
    console.log('Login with:', { email, password });
  };

  return (
    <ScrollView className="flex-1 bg-[#fef7f2]">
      <View className="flex-1 justify-center px-6 py-12">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-[#f97316] rounded-full items-center justify-center mb-6">
            <Text className="text-white text-3xl font-bold">D</Text>
          </View>
          <Text className="text-3xl font-bold text-[#1f2937] mb-2">Welcome Back</Text>
          <Text className="text-[#9ca3af] text-base">Sign in to continue your food journey</Text>
        </View>

        {/* Login Form */}
        <View className="mb-8">
          <View className="mb-6">
            <Text className="text-[#1f2937] text-lg font-medium mb-2">Email</Text>
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-[#e5e7eb]">
              <Mail color="#9ca3af" size={20} />
              <TextInput
                className="flex-1 ml-3 text-[#1f2937] text-base"
                placeholder="your@email.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-[#1f2937] text-lg font-medium mb-2">Password</Text>
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-[#e5e7eb]">
              <Lock color="#9ca3af" size={20} />
              <TextInput
                className="flex-1 ml-3 text-[#1f2937] text-base"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color="#9ca3af" size={20} />
                ) : (
                  <Eye color="#9ca3af" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#f97316] rounded-xl py-4 items-center mb-6"
            onPress={handleLogin}
          >
            <Text className="text-white text-lg font-bold">Sign In</Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center mb-8">
            <View className="flex-1 h-px bg-[#e5e7eb]" />
            <Text className="text-[#9ca3af] mx-4">OR</Text>
            <View className="flex-1 h-px bg-[#e5e7eb]" />
          </View>

          <TouchableOpacity className="flex-row items-center justify-center bg-white rounded-xl py-4 border border-[#e5e7eb] mb-8">
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
              className="w-6 h-6 mr-3"
            />
            <Text className="text-[#1f2937] text-lg font-medium">Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center">
          <Text className="text-[#9ca3af] text-base">Don't have an account? </Text>
          <TouchableOpacity>
            <Text className="text-[#f97316] text-base font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
