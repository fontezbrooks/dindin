import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { trpc } from '@/utils/trpc';

interface PartnerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (partner: any) => void;
}

export const PartnerConnectionModal: React.FC<PartnerConnectionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'enter' | 'generate'>('enter');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // tRPC mutations
  const generateCodeMutation = trpc.user.generatePartnerCode.useMutation({
    onSuccess: (data) => {
      setGeneratedCode(data.code);
      setMode('generate');
      if (data.alreadyExisted) {
        Alert.alert('Info', 'You already have a partner code');
      }
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to generate code');
    },
  });

  const connectPartnerMutation = trpc.user.connectPartner.useMutation({
    onSuccess: (data) => {
      // Show success
      Alert.alert(
        'Success!',
        `Connected with ${data.partner.name}`,
        [
          {
            text: 'Start Matching',
            onPress: () => {
              onSuccess(data.partner);
              onClose();
              // Navigate to swipe screen with first-time flag
              router.push({
                pathname: '/(tabs)/swipe',
                params: {
                  firstTime: 'true',
                  partnerId: data.partner.id,
                },
              });
            },
          },
        ],
      );
    },
    onError: (error) => {
      Alert.alert('Connection Failed', error.message || 'Invalid partner code');
    },
  });

  // Validate partner code format
  const isValidPartnerCode = (code: string): boolean => {
    return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
  };

  // Handle code input
  const handleCodeChange = (text: string) => {
    // Auto-uppercase and limit to 6 characters
    const formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(formatted);
  };

  // Handle connect button
  const handleConnect = () => {
    const normalizedCode = code.toUpperCase().trim();
    
    if (!isValidPartnerCode(normalizedCode)) {
      Alert.alert('Invalid Code', 'Partner code must be 6 alphanumeric characters');
      return;
    }

    connectPartnerMutation.mutate({ partnerCode: normalizedCode });
  };

  // Handle generate code
  const handleGenerateCode = () => {
    generateCodeMutation.mutate();
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    Clipboard.setString(generatedCode);
    Alert.alert('Copied!', 'Partner code copied to clipboard');
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl p-6 w-[90%] max-w-sm">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">
              Partner Connection
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {mode === 'enter' ? (
            // Enter Code Mode
            <View>
              <Text className="text-gray-600 mb-4">
                Enter your partner's code to connect and start matching recipes together
              </Text>

              {/* Code Input */}
              <View className="mb-4">
                <TextInput
                  value={code}
                  onChangeText={handleCodeChange}
                  placeholder="XXXXXX"
                  placeholderTextColor="#9ca3af"
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  className="border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-wider"
                />
                <Text className="text-xs text-gray-500 mt-1 text-center">
                  6-character code (letters and numbers)
                </Text>
              </View>

              {/* Connect Button */}
              <TouchableOpacity
                onPress={handleConnect}
                disabled={code.length !== 6 || connectPartnerMutation.isLoading}
                className={`rounded-lg py-3 mb-3 ${
                  code.length === 6 && !connectPartnerMutation.isLoading
                    ? 'bg-pink-500'
                    : 'bg-gray-300'
                }`}
              >
                {connectPartnerMutation.isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center">
                    Connect with Partner
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-[1px] bg-gray-300" />
                <Text className="mx-3 text-gray-500">OR</Text>
                <View className="flex-1 h-[1px] bg-gray-300" />
              </View>

              {/* Generate Code Button */}
              <TouchableOpacity
                onPress={handleGenerateCode}
                disabled={generateCodeMutation.isLoading}
                className="border border-pink-500 rounded-lg py-3"
              >
                {generateCodeMutation.isLoading ? (
                  <ActivityIndicator color="#ec4899" />
                ) : (
                  <Text className="text-pink-500 font-semibold text-center">
                    Generate My Code
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            // Display Generated Code Mode
            <View>
              <Text className="text-gray-600 mb-6 text-center">
                Share this code with your partner
              </Text>

              {/* Generated Code Display */}
              <TouchableOpacity
                onPress={copyToClipboard}
                className="bg-gray-100 rounded-xl p-6 mb-4"
              >
                <Text className="text-4xl font-mono font-bold text-center text-gray-800 tracking-wider">
                  {generatedCode}
                </Text>
                <View className="flex-row justify-center items-center mt-3">
                  <Ionicons name="copy-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 text-sm ml-1">Tap to copy</Text>
                </View>
              </TouchableOpacity>

              {/* Instructions */}
              <View className="bg-blue-50 rounded-lg p-3 mb-4">
                <Text className="text-blue-800 text-sm">
                  <Text className="font-semibold">How it works:</Text>
                  {'\n'}1. Share this code with your partner
                  {'\n'}2. They enter it in their app
                  {'\n'}3. You'll both be connected instantly
                  {'\n'}4. Start swiping and matching recipes!
                </Text>
              </View>

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => setMode('enter')}
                className="border border-gray-300 rounded-lg py-3"
              >
                <Text className="text-gray-700 font-semibold text-center">
                  Enter Partner's Code Instead
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};