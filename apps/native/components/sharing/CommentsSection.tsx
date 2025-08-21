import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useEffect, useState } from "react";
import {
	Alert,
	FlatList,
	Modal,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { trpc } from "../../lib/trpc";

interface Comment {
	_id: string;
	content: string;
	commentType: string;
	rating?: number;
	user: {
		_id: string;
		name: string;
		username: string;
		avatar?: string;
	};
	createdAt: string;
	netHelpfulVotes: number;
	replies: number;
	userVote?: "helpful" | "not_helpful" | null;
}

interface CommentsSectionProps {
	recipeId: string;
	currentUserId?: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
	recipeId,
	currentUserId,
}) => {
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState("");
	const [commentType, setCommentType] = useState<
		"comment" | "tip" | "question"
	>("comment");
	const [rating, setRating] = useState<number | undefined>(undefined);
	const [showCommentModal, setShowCommentModal] = useState(false);
	const [sortBy, setSortBy] = useState<"newest" | "oldest" | "helpful">(
		"newest",
	);
	const [filterType, setFilterType] = useState<string | undefined>(undefined);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const getCommentsQuery = trpc.comments.getComments.useQuery({
		recipeId,
		page,
		limit: 20,
		sortBy,
		type: filterType as any,
	});

	const addCommentMutation = trpc.comments.addComment.useMutation();
	const voteCommentMutation = trpc.comments.voteComment.useMutation();
	const commentStatsQuery = trpc.comments.getCommentStats.useQuery({
		recipeId,
	});

	useEffect(() => {
		if (getCommentsQuery.data) {
			if (page === 1) {
				setComments(getCommentsQuery.data.comments);
			} else {
				setComments((prev) => [...prev, ...getCommentsQuery.data.comments]);
			}
			setHasMore(
				getCommentsQuery.data.pagination.page <
					getCommentsQuery.data.pagination.pages,
			);
		}
	}, [getCommentsQuery.data, page]);

	const handleAddComment = async () => {
		if (!newComment.trim()) {
			Alert.alert("Error", "Please enter a comment");
			return;
		}

		if (!currentUserId) {
			Alert.alert("Error", "You must be logged in to comment");
			return;
		}

		try {
			const comment = await addCommentMutation.mutateAsync({
				recipeId,
				content: newComment.trim(),
				commentType,
				rating: commentType === "comment" ? rating : undefined,
			});

			// Add new comment to the beginning of the list
			setComments((prev) => [comment, ...prev]);

			// Reset form
			setNewComment("");
			setRating(undefined);
			setCommentType("comment");
			setShowCommentModal(false);

			// Refetch stats
			commentStatsQuery.refetch();
		} catch (error) {
			Alert.alert("Error", "Failed to add comment");
		}
	};

	const handleVote = async (
		commentId: string,
		vote: "helpful" | "not_helpful",
	) => {
		if (!currentUserId) {
			Alert.alert("Error", "You must be logged in to vote");
			return;
		}

		try {
			await voteCommentMutation.mutateAsync({
				commentId,
				vote,
			});

			// Update comment in the list
			setComments((prev) =>
				prev.map((comment) =>
					comment._id === commentId
						? {
								...comment,
								userVote: comment.userVote === vote ? null : vote,
								netHelpfulVotes:
									comment.userVote === vote
										? comment.netHelpfulVotes - (vote === "helpful" ? 1 : -1)
										: comment.userVote
											? comment.netHelpfulVotes + (vote === "helpful" ? 2 : -2)
											: comment.netHelpfulVotes + (vote === "helpful" ? 1 : -1),
							}
						: comment,
				),
			);
		} catch (error) {
			Alert.alert("Error", "Failed to vote on comment");
		}
	};

	const loadMore = () => {
		if (hasMore && !getCommentsQuery.isFetching) {
			setPage((prev) => prev + 1);
		}
	};

	const renderStars = (
		currentRating: number,
		onPress?: (rating: number) => void,
	) => {
		return (
			<View style={styles.starsContainer}>
				{[1, 2, 3, 4, 5].map((star) => (
					<TouchableOpacity
						key={star}
						onPress={() => onPress?.(star)}
						disabled={!onPress}
					>
						<Ionicons
							name={star <= currentRating ? "star" : "star-outline"}
							size={20}
							color="#FFD700"
						/>
					</TouchableOpacity>
				))}
			</View>
		);
	};

	const renderComment = ({ item: comment }: { item: Comment }) => {
		const timeAgo = new Date(comment.createdAt).toLocaleDateString();

		return (
			<View style={styles.commentItem}>
				<View style={styles.commentHeader}>
					<View style={styles.userInfo}>
						<Text style={styles.userName}>{comment.user.name}</Text>
						<Text style={styles.username}>@{comment.user.username}</Text>
						{comment.rating && (
							<View style={styles.commentRating}>
								{renderStars(comment.rating)}
							</View>
						)}
					</View>
					<Text style={styles.commentTime}>{timeAgo}</Text>
				</View>

				<View style={styles.commentTypeContainer}>
					<View
						style={[
							styles.commentTypeBadge,
							comment.commentType === "tip" && styles.tipBadge,
							comment.commentType === "question" && styles.questionBadge,
						]}
					>
						<Text
							style={[
								styles.commentTypeText,
								comment.commentType === "tip" && styles.tipText,
								comment.commentType === "question" && styles.questionText,
							]}
						>
							{comment.commentType.toUpperCase()}
						</Text>
					</View>
				</View>

				<Text style={styles.commentContent}>{comment.content}</Text>

				<View style={styles.commentActions}>
					{/* Helpful votes */}
					<View style={styles.voteContainer}>
						<TouchableOpacity
							style={[
								styles.voteButton,
								comment.userVote === "helpful" && styles.voteButtonActive,
							]}
							onPress={() => handleVote(comment._id, "helpful")}
						>
							<Ionicons
								name="thumbs-up"
								size={16}
								color={comment.userVote === "helpful" ? "#007AFF" : "#666"}
							/>
						</TouchableOpacity>

						<Text style={styles.voteCount}>{comment.netHelpfulVotes}</Text>

						<TouchableOpacity
							style={[
								styles.voteButton,
								comment.userVote === "not_helpful" && styles.voteButtonActive,
							]}
							onPress={() => handleVote(comment._id, "not_helpful")}
						>
							<Ionicons
								name="thumbs-down"
								size={16}
								color={comment.userVote === "not_helpful" ? "#FF3B30" : "#666"}
							/>
						</TouchableOpacity>
					</View>

					{/* Reply button */}
					{comment.replies > 0 && (
						<TouchableOpacity style={styles.replyButton}>
							<Ionicons name="chatbox-outline" size={16} color="#666" />
							<Text style={styles.replyText}>{comment.replies} replies</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			{/* Stats Header */}
			{commentStatsQuery.data && (
				<View style={styles.statsHeader}>
					<Text style={styles.statsTitle}>
						{commentStatsQuery.data.totalComments} Comments
					</Text>
					{commentStatsQuery.data.avgRating > 0 && (
						<View style={styles.avgRatingContainer}>
							<Text style={styles.avgRating}>
								{commentStatsQuery.data.avgRating.toFixed(1)}
							</Text>
							<Ionicons name="star" size={16} color="#FFD700" />
						</View>
					)}
				</View>
			)}

			{/* Filters and Sort */}
			<View style={styles.filtersContainer}>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.filtersScrollView}
				>
					<TouchableOpacity
						style={[
							styles.filterButton,
							!filterType && styles.filterButtonActive,
						]}
						onPress={() => setFilterType(undefined)}
					>
						<Text
							style={[
								styles.filterButtonText,
								!filterType && styles.filterButtonTextActive,
							]}
						>
							All
						</Text>
					</TouchableOpacity>

					{["comment", "tip", "question"].map((type) => (
						<TouchableOpacity
							key={type}
							style={[
								styles.filterButton,
								filterType === type && styles.filterButtonActive,
							]}
							onPress={() => setFilterType(type)}
						>
							<Text
								style={[
									styles.filterButtonText,
									filterType === type && styles.filterButtonTextActive,
								]}
							>
								{type.charAt(0).toUpperCase() + type.slice(1)}s
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				{/* Sort Options */}
				<TouchableOpacity
					style={styles.sortButton}
					onPress={() => {
						const sortOptions = ["newest", "oldest", "helpful"];
						const currentIndex = sortOptions.indexOf(sortBy);
						const nextIndex = (currentIndex + 1) % sortOptions.length;
						setSortBy(sortOptions[nextIndex] as any);
					}}
				>
					<Ionicons name="funnel-outline" size={16} color="#666" />
					<Text style={styles.sortButtonText}>
						{sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
					</Text>
				</TouchableOpacity>
			</View>

			{/* Comments List */}
			<FlatList
				data={comments}
				renderItem={renderComment}
				keyExtractor={(item) => item._id}
				showsVerticalScrollIndicator={false}
				onEndReached={loadMore}
				onEndReachedThreshold={0.5}
				refreshing={getCommentsQuery.isFetching && page === 1}
				onRefresh={() => {
					setPage(1);
					getCommentsQuery.refetch();
				}}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Ionicons name="chatbubbles-outline" size={48} color="#C7C7CC" />
						<Text style={styles.emptyStateText}>No comments yet</Text>
						<Text style={styles.emptyStateSubtext}>
							Be the first to share your thoughts!
						</Text>
					</View>
				}
			/>

			{/* Add Comment Button */}
			{currentUserId && (
				<TouchableOpacity
					style={styles.addCommentButton}
					onPress={() => setShowCommentModal(true)}
				>
					<Ionicons name="add" size={24} color="white" />
				</TouchableOpacity>
			)}

			{/* Add Comment Modal */}
			<Modal
				visible={showCommentModal}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setShowCommentModal(false)}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setShowCommentModal(false)}>
							<Text style={styles.cancelButton}>Cancel</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>Add Comment</Text>
						<TouchableOpacity onPress={handleAddComment}>
							<Text style={styles.submitButton}>Post</Text>
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.modalContent}>
						{/* Comment Type */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Type</Text>
							<View style={styles.typeButtons}>
								{[
									{ value: "comment", label: "Comment", icon: "chatbubble" },
									{ value: "tip", label: "Tip", icon: "bulb" },
									{ value: "question", label: "Question", icon: "help-circle" },
								].map((type) => (
									<TouchableOpacity
										key={type.value}
										style={[
											styles.typeButton,
											commentType === type.value && styles.typeButtonActive,
										]}
										onPress={() => setCommentType(type.value as any)}
									>
										<Ionicons
											name={type.icon as any}
											size={20}
											color={commentType === type.value ? "#007AFF" : "#666"}
										/>
										<Text
											style={[
												styles.typeButtonText,
												commentType === type.value &&
													styles.typeButtonTextActive,
											]}
										>
											{type.label}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Rating (for comments) */}
						{commentType === "comment" && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>Rating (optional)</Text>
								{renderStars(rating || 0, setRating)}
							</View>
						)}

						{/* Comment Content */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Your {commentType}</Text>
							<TextInput
								style={styles.commentInput}
								multiline
								numberOfLines={4}
								placeholder={`Share your ${commentType}...`}
								value={newComment}
								onChangeText={setNewComment}
								maxLength={2000}
							/>
							<Text style={styles.characterCount}>
								{newComment.length}/2000
							</Text>
						</View>
					</ScrollView>
				</View>
			</Modal>
		</View>
	);
};

const styles = {
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	statsHeader: {
		flexDirection: "row" as const,
		justifyContent: "space-between" as const,
		alignItems: "center" as const,
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E7",
	},
	statsTitle: {
		fontSize: 18,
		fontWeight: "600" as const,
		color: "#1C1C1E",
	},
	avgRatingContainer: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		gap: 4,
	},
	avgRating: {
		fontSize: 16,
		fontWeight: "500" as const,
		color: "#1C1C1E",
	},
	filtersContainer: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E7",
	},
	filtersScrollView: {
		paddingRight: 16,
	},
	filterButton: {
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 16,
		backgroundColor: "#F2F2F7",
		marginRight: 8,
	},
	filterButtonActive: {
		backgroundColor: "#007AFF",
	},
	filterButtonText: {
		fontSize: 14,
		color: "#666",
	},
	filterButtonTextActive: {
		color: "white",
	},
	sortButton: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
		backgroundColor: "#F2F2F7",
		marginLeft: "auto" as const,
		gap: 4,
	},
	sortButtonText: {
		fontSize: 12,
		color: "#666",
	},
	commentItem: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E5E7",
	},
	commentHeader: {
		flexDirection: "row" as const,
		justifyContent: "space-between" as const,
		alignItems: "flex-start" as const,
		marginBottom: 8,
	},
	userInfo: {
		flex: 1,
	},
	userName: {
		fontSize: 16,
		fontWeight: "600" as const,
		color: "#1C1C1E",
	},
	username: {
		fontSize: 14,
		color: "#666",
		marginTop: 2,
	},
	commentTime: {
		fontSize: 12,
		color: "#999",
	},
	commentRating: {
		marginTop: 4,
	},
	starsContainer: {
		flexDirection: "row" as const,
		gap: 2,
	},
	commentTypeContainer: {
		marginBottom: 8,
	},
	commentTypeBadge: {
		alignSelf: "flex-start" as const,
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 12,
		backgroundColor: "#F2F2F7",
	},
	tipBadge: {
		backgroundColor: "#E8F5E8",
	},
	questionBadge: {
		backgroundColor: "#E8F0FF",
	},
	commentTypeText: {
		fontSize: 10,
		fontWeight: "600" as const,
		color: "#666",
	},
	tipText: {
		color: "#34C759",
	},
	questionText: {
		color: "#007AFF",
	},
	commentContent: {
		fontSize: 16,
		lineHeight: 24,
		color: "#1C1C1E",
		marginBottom: 12,
	},
	commentActions: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		gap: 16,
	},
	voteContainer: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		gap: 8,
	},
	voteButton: {
		padding: 4,
	},
	voteButtonActive: {
		backgroundColor: "#F0F8FF",
		borderRadius: 4,
	},
	voteCount: {
		fontSize: 14,
		fontWeight: "500" as const,
		color: "#1C1C1E",
		minWidth: 20,
		textAlign: "center" as const,
	},
	replyButton: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		gap: 4,
	},
	replyText: {
		fontSize: 12,
		color: "#666",
	},
	emptyState: {
		alignItems: "center" as const,
		justifyContent: "center" as const,
		paddingVertical: 60,
		paddingHorizontal: 40,
	},
	emptyStateText: {
		fontSize: 18,
		fontWeight: "600" as const,
		color: "#8E8E93",
		marginTop: 16,
	},
	emptyStateSubtext: {
		fontSize: 14,
		color: "#8E8E93",
		textAlign: "center" as const,
		marginTop: 8,
	},
	addCommentButton: {
		position: "absolute" as const,
		bottom: 20,
		right: 20,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "#007AFF",
		alignItems: "center" as const,
		justifyContent: "center" as const,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
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
		color: "#666",
		fontSize: 16,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600" as const,
		color: "#1C1C1E",
	},
	submitButton: {
		color: "#007AFF",
		fontSize: 16,
		fontWeight: "600" as const,
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
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
	typeButtons: {
		flexDirection: "row" as const,
		gap: 12,
	},
	typeButton: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: "#F2F2F7",
		gap: 8,
	},
	typeButtonActive: {
		backgroundColor: "#E8F0FF",
	},
	typeButtonText: {
		fontSize: 14,
		color: "#666",
	},
	typeButtonTextActive: {
		color: "#007AFF",
	},
	commentInput: {
		borderWidth: 1,
		borderColor: "#C7C7CC",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		fontSize: 16,
		minHeight: 100,
		textAlignVertical: "top" as const,
	},
	characterCount: {
		fontSize: 12,
		color: "#999",
		textAlign: "right" as const,
		marginTop: 8,
	},
};
