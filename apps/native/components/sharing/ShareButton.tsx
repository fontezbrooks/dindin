import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useState } from "react";
import {
	Alert,
	Linking,
	Modal,
	ScrollView,
	Share,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { trpc } from "../../lib/trpc";

interface ShareButtonProps {
	recipeId: string;
	recipeTitle: string;
	recipeImage?: string;
	style?: object;
}

interface SocialPlatform {
	name: string;
	icon: keyof typeof Ionicons.glyphMap;
	color: string;
	action: (url: string) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
	recipeId,
	recipeTitle,
	recipeImage,
	style,
}) => {
	const [showShareModal, setShowShareModal] = useState(false);
	const [shareType, setShareType] = useState<
		"public" | "friends_only" | "private"
	>("public");
	const [customMessage, setCustomMessage] = useState("");
	const [shareUrl, setShareUrl] = useState("");

	const createShareMutation = trpc.sharing.createShare.useMutation();
	const trackShareMutation = trpc.sharing.trackShare.useMutation();

	const socialPlatforms: SocialPlatform[] = [
		{
			name: "WhatsApp",
			icon: "logo-whatsapp",
			color: "#25D366",
			action: (url: string) => {
				const message = encodeURIComponent(
					`Check out this recipe: ${recipeTitle}`,
				);
				Linking.openURL(
					`whatsapp://send?text=${message}%20${encodeURIComponent(url)}`,
				);
				trackShare("whatsapp");
			},
		},
		{
			name: "Facebook",
			icon: "logo-facebook",
			color: "#1877F2",
			action: (url: string) => {
				Linking.openURL(
					`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
				);
				trackShare("facebook");
			},
		},
		{
			name: "Twitter",
			icon: "logo-twitter",
			color: "#1DA1F2",
			action: (url: string) => {
				const text = encodeURIComponent(
					`Check out this amazing recipe: ${recipeTitle}`,
				);
				Linking.openURL(
					`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
				);
				trackShare("twitter");
			},
		},
		{
			name: "Email",
			icon: "mail",
			color: "#EA4335",
			action: (url: string) => {
				const subject = encodeURIComponent(`Recipe: ${recipeTitle}`);
				const body = encodeURIComponent(
					`Check out this recipe: ${recipeTitle}\n\n${url}`,
				);
				Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
				trackShare("email");
			},
		},
	];

	const handleCreateShare = async () => {
		try {
			const result = await createShareMutation.mutateAsync({
				recipeId,
				shareType,
				metadata: {
					title: recipeTitle,
					description:
						customMessage || `Check out this delicious recipe: ${recipeTitle}`,
					imageUrl: recipeImage,
				},
			});

			setShareUrl(result.shareUrl);
		} catch (error) {
			Alert.alert("Error", "Failed to create shareable link");
		}
	};

	const trackShare = async (platform: string) => {
		if (shareUrl) {
			const token = shareUrl.split("/").pop();
			if (token) {
				await trackShareMutation.mutateAsync({
					shareToken: token,
					platform: platform as any,
				});
			}
		}
	};

	const handleNativeShare = async () => {
		if (!shareUrl) {
			await handleCreateShare();
		}

		try {
			await Share.share({
				message: `Check out this recipe: ${recipeTitle}\n\n${shareUrl}`,
				url: shareUrl,
				title: recipeTitle,
			});
			trackShare("direct");
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	const copyToClipboard = async () => {
		if (!shareUrl) {
			await handleCreateShare();
		}

		// Note: You might want to use @react-native-clipboard/clipboard
		// For now, we'll show the URL in an alert
		Alert.alert("Share URL", shareUrl, [
			{ text: "OK" },
			{
				text: "Copy",
				onPress: () => {
					// Clipboard.setString(shareUrl);
					trackShare("direct");
				},
			},
		]);
	};

	return (
		<>
			<TouchableOpacity
				style={[styles.shareButton, style]}
				onPress={() => setShowShareModal(true)}
				activeOpacity={0.7}
			>
				<Ionicons name="share-outline" size={24} color="#007AFF" />
				<Text style={styles.shareButtonText}>Share</Text>
			</TouchableOpacity>

			<Modal
				visible={showShareModal}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setShowShareModal(false)}
			>
				<View style={styles.modalContainer}>
					{/* Header */}
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setShowShareModal(false)}>
							<Text style={styles.cancelButton}>Cancel</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>Share Recipe</Text>
						<View style={styles.placeholder} />
					</View>

					<ScrollView style={styles.modalContent}>
						{/* Recipe Info */}
						<View style={styles.recipeInfo}>
							<Text style={styles.recipeTitle}>{recipeTitle}</Text>
						</View>

						{/* Privacy Settings */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Privacy</Text>
							<View style={styles.privacyOptions}>
								{[
									{ value: "public", label: "Public - Anyone can view" },
									{ value: "friends_only", label: "Friends only" },
									{ value: "private", label: "Private - Only you" },
								].map((option) => (
									<TouchableOpacity
										key={option.value}
										style={[
											styles.privacyOption,
											shareType === option.value &&
												styles.privacyOptionSelected,
										]}
										onPress={() => setShareType(option.value as any)}
									>
										<View
											style={[
												styles.radio,
												shareType === option.value && styles.radioSelected,
											]}
										/>
										<Text style={styles.privacyOptionText}>{option.label}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Custom Message */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Add a message (optional)</Text>
							<TextInput
								style={styles.messageInput}
								multiline
								numberOfLines={3}
								placeholder="Add a personal message..."
								value={customMessage}
								onChangeText={setCustomMessage}
								maxLength={200}
							/>
						</View>

						{/* Share Actions */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Share via</Text>

							{/* Native Share */}
							<TouchableOpacity
								style={styles.shareAction}
								onPress={handleNativeShare}
							>
								<Ionicons name="share" size={24} color="#007AFF" />
								<Text style={styles.shareActionText}>More options</Text>
							</TouchableOpacity>

							{/* Copy Link */}
							<TouchableOpacity
								style={styles.shareAction}
								onPress={copyToClipboard}
							>
								<Ionicons name="copy" size={24} color="#666" />
								<Text style={styles.shareActionText}>Copy link</Text>
							</TouchableOpacity>

							{/* Social Platforms */}
							<View style={styles.socialPlatforms}>
								{socialPlatforms.map((platform) => (
									<TouchableOpacity
										key={platform.name}
										style={styles.socialButton}
										onPress={async () => {
											if (!shareUrl) {
												await handleCreateShare();
											}
											platform.action(shareUrl);
										}}
									>
										<Ionicons
											name={platform.icon}
											size={32}
											color={platform.color}
										/>
										<Text style={styles.socialButtonText}>{platform.name}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</ScrollView>
				</View>
			</Modal>
		</>
	);
};

const styles = {
	shareButton: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#F0F8FF",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#007AFF",
	},
	shareButtonText: {
		color: "#007AFF",
		fontSize: 16,
		fontWeight: "500" as const,
		marginLeft: 8,
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "#fff",
	},
	modalHeader: {
		flexDirection: "row" as const,
		justifyContent: "space-between" as const,
		alignItems: "center" as const,
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E7",
	},
	cancelButton: {
		color: "#007AFF",
		fontSize: 16,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600" as const,
		color: "#1C1C1E",
	},
	placeholder: {
		width: 50,
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
	},
	recipeInfo: {
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E7",
	},
	recipeTitle: {
		fontSize: 20,
		fontWeight: "600" as const,
		color: "#1C1C1E",
	},
	section: {
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E7",
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600" as const,
		color: "#1C1C1E",
		marginBottom: 12,
	},
	privacyOptions: {
		gap: 12,
	},
	privacyOption: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		paddingVertical: 8,
	},
	privacyOptionSelected: {
		// Add selected styling if needed
	},
	radio: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: "#C7C7CC",
		marginRight: 12,
	},
	radioSelected: {
		borderColor: "#007AFF",
		backgroundColor: "#007AFF",
	},
	privacyOptionText: {
		fontSize: 16,
		color: "#1C1C1E",
	},
	messageInput: {
		borderWidth: 1,
		borderColor: "#C7C7CC",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 16,
		minHeight: 80,
		textAlignVertical: "top" as const,
	},
	shareAction: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		paddingVertical: 12,
	},
	shareActionText: {
		fontSize: 16,
		color: "#1C1C1E",
		marginLeft: 12,
	},
	socialPlatforms: {
		flexDirection: "row" as const,
		justifyContent: "space-around" as const,
		marginTop: 16,
	},
	socialButton: {
		alignItems: "center" as const,
		gap: 8,
	},
	socialButtonText: {
		fontSize: 12,
		color: "#666",
	},
};
