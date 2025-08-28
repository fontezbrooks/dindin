import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";
import { PartnerConnectionModal } from "@/components/profile/PartnerConnectionModal";
import { PartnerStatusIndicator } from "@/components/profile/PartnerStatusIndicator";
import { usePartnerConnection } from "@/hooks/usePartnerConnection";
import logger from '@/utils/logger';

export default function ProfileScreen() {
	const [showConnectionModal, setShowConnectionModal] = useState(false);
	const [session, setSession] = useState<any>(null);
	const [isLoadingAuth, setIsLoadingAuth] = useState(true);

	// Get user profile
	const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = 
		trpc.user.getProfile.useQuery(undefined, {
			enabled: !!session,
		});

	// Get user stats
	const { data: stats } = trpc.user.getStats.useQuery(undefined, {
		enabled: !!session,
	});

	// Partner connection hook
	const {
		isConnected,
		partner,
		partnerCode,
		isOnline,
		disconnectPartner,
	} = usePartnerConnection();

	// Check auth session on mount
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const currentSession = await authClient.getSession();
				setSession(currentSession);
			} catch (error) {
				logger.error('Auth check failed:', error);
			} finally {
				setIsLoadingAuth(false);
			}
		};

		checkAuth();

		// Subscribe to auth changes
		const unsubscribe = authClient.subscribe((newSession) => {
			setSession(newSession);
			if (newSession) {
				refetchProfile();
			}
		});

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, []);

	// Handle partner connection success
	const handlePartnerConnected = (partner: any) => {
		refetchProfile();
		// The modal component handles navigation to swipe screen
	};

	// Handle disconnect partner
	const handleDisconnectPartner = async () => {
		const success = await disconnectPartner();
		if (success) {
			refetchProfile();
		}
	};

	// Loading state
	if (isLoadingAuth || isLoadingProfile) {
		return (
			<SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
				<ActivityIndicator size="large" color="#ec4899" />
				<Text className="mt-2 text-gray-600">Loading profile...</Text>
			</SafeAreaView>
		);
	}

	// Not authenticated
	if (!session) {
		return (
			<SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-6">
				<Ionicons name="lock-closed" size={64} color="#9ca3af" />
				<Text className="text-xl font-semibold text-gray-800 mt-4">Sign In Required</Text>
				<Text className="text-gray-600 text-center mt-2">
					Please sign in to access your profile and connect with a partner
				</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<ScrollView className="flex-1">
				<View className="p-4">
					<Text className="text-2xl font-bold text-gray-800 mb-6">Profile</Text>

					{/* User Info */}
					<View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
						<View className="flex-row items-center mb-3">
							<View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center overflow-hidden">
								{profile?.profileImage ? (
									<Image 
										source={{ uri: profile.profileImage }}
										className="w-full h-full"
									/>
								) : (
									<Ionicons name="person" size={32} color="#6b7280" />
								)}
							</View>
							<View className="ml-4 flex-1">
								<Text className="text-lg font-semibold text-gray-800">
									{profile?.name || session?.user?.name || 'User'}
								</Text>
								<Text className="text-gray-600">
									{profile?.email || session?.user?.email}
								</Text>
							</View>
						</View>
					</View>

					{/* Partner Connection */}
					<View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
						<View className="flex-row justify-between items-center mb-3">
							<Text className="text-lg font-semibold text-gray-800">
								Partner Connection
							</Text>
							{isConnected && partner && (
								<PartnerStatusIndicator 
									partnerId={partner.id}
									partnerName={partner.name}
								/>
							)}
						</View>
						
						{isConnected && partner ? (
							<View>
								<View className="bg-green-50 rounded-lg p-3 mb-3">
									<Text className="text-green-800 font-medium">
										Connected with {partner.name}
									</Text>
									{partnerCode && (
										<Text className="text-green-600 text-sm mt-1">
											Your code: {partnerCode}
										</Text>
									)}
								</View>
								<TouchableOpacity 
									onPress={handleDisconnectPartner}
									className="border border-red-500 rounded-lg p-3 items-center"
								>
									<Text className="text-red-500 font-semibold">
										Disconnect Partner
									</Text>
								</TouchableOpacity>
							</View>
						) : (
							<TouchableOpacity 
								onPress={() => setShowConnectionModal(true)}
								className="bg-pink-500 rounded-lg p-3 items-center"
							>
								<Text className="text-white font-semibold">
									Connect with Partner
								</Text>
							</TouchableOpacity>
						)}
					</View>

					{/* Preferences */}
					<View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
						<Text className="text-lg font-semibold text-gray-800 mb-3">
							Preferences
						</Text>
						<TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-gray-100">
							<Text className="text-gray-700">Dietary Restrictions</Text>
							<Ionicons name="chevron-forward" size={20} color="#6b7280" />
						</TouchableOpacity>
						<TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-gray-100">
							<Text className="text-gray-700">Cooking Skill Level</Text>
							<Ionicons name="chevron-forward" size={20} color="#6b7280" />
						</TouchableOpacity>
						<TouchableOpacity className="flex-row justify-between items-center py-3">
							<Text className="text-gray-700">Favorite Cuisines</Text>
							<Ionicons name="chevron-forward" size={20} color="#6b7280" />
						</TouchableOpacity>
					</View>

					{/* Stats */}
					<View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
						<Text className="text-lg font-semibold text-gray-800 mb-3">
							Your Stats
						</Text>
						<View className="flex-row justify-around">
							<View className="items-center">
								<Text className="text-2xl font-bold text-pink-500">
									{stats?.totalSwipes || 0}
								</Text>
								<Text className="text-gray-600 text-sm">Swipes</Text>
							</View>
							<View className="items-center">
								<Text className="text-2xl font-bold text-pink-500">
									{stats?.totalMatches || 0}
								</Text>
								<Text className="text-gray-600 text-sm">Matches</Text>
							</View>
							<View className="items-center">
								<Text className="text-2xl font-bold text-pink-500">
									{stats?.recipesCooked || 0}
								</Text>
								<Text className="text-gray-600 text-sm">Cooked</Text>
							</View>
						</View>
					</View>

					{/* Sign Out */}
					<TouchableOpacity 
						onPress={() => authClient.signOut()}
						className="bg-gray-200 rounded-lg p-3 items-center"
					>
						<Text className="text-gray-700 font-semibold">Sign Out</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>

			{/* Partner Connection Modal */}
			<PartnerConnectionModal
				isOpen={showConnectionModal}
				onClose={() => setShowConnectionModal(false)}
				onSuccess={handlePartnerConnected}
			/>
		</SafeAreaView>
	);
}
