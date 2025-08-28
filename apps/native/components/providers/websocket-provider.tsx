import type React from "react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { Alert } from "react-native";
import { ConnectionState, wsManager } from "@/utils/websocket-manager";
import logger from '@/utils/logger';

interface WebSocketContextType {
	connectionState: ConnectionState;
	isConnected: boolean;
	connect: () => Promise<void>;
	disconnect: () => void;
	sendMessage: (type: string, payload?: any) => boolean;
	sendPartnerActivity: (activity: string, data?: any) => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocket must be used within WebSocketProvider");
	}
	return context;
};

interface WebSocketProviderProps {
	children: ReactNode;
	autoConnect?: boolean;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
	children,
	autoConnect = true,
}) => {
	const [connectionState, setConnectionState] = useState<ConnectionState>(
		wsManager.getState(),
	);
	const [isConnected, setIsConnected] = useState(wsManager.isConnected());

	useEffect(() => {
		// Setup event listeners
		const handleStateChange = ({ newState }: { newState: ConnectionState }) => {
			setConnectionState(newState);
			setIsConnected(newState === ConnectionState.CONNECTED);
		};

		const handleConnected = () => {
			logger.log("WebSocket connected in provider");
			setIsConnected(true);
		};

		const handleDisconnected = () => {
			logger.log("WebSocket disconnected in provider");
			setIsConnected(false);
		};

		const handleError = (error: any) => {
			logger.error("WebSocket error in provider:", error);
		};

		const handleMaxReconnectAttempts = () => {
			Alert.alert(
				"Connection Lost",
				"Unable to connect to the server. Please check your internet connection and try again.",
				[
					{
						text: "Retry",
						onPress: () => {
							wsManager.resetReconnectAttempts();
							wsManager.connect();
						},
					},
					{ text: "OK", style: "cancel" },
				],
			);
		};

		const handleNewMatch = (matchData: any) => {
			logger.log("New match received in provider:", matchData);
			// This will be handled by components that listen to wsManager events
		};

		const handlePartnerOnline = (data: any) => {
			logger.log("Partner online in provider:", data);
			// This will be handled by components that listen to wsManager events
		};

		const handlePartnerOffline = (data: any) => {
			logger.log("Partner offline in provider:", data);
			// This will be handled by components that listen to wsManager events
		};

		// Subscribe to events
		wsManager.on("stateChange", handleStateChange);
		wsManager.on("connected", handleConnected);
		wsManager.on("disconnected", handleDisconnected);
		wsManager.on("error", handleError);
		wsManager.on("maxReconnectAttemptsReached", handleMaxReconnectAttempts);
		wsManager.on("newMatch", handleNewMatch);
		wsManager.on("partnerOnline", handlePartnerOnline);
		wsManager.on("partnerOffline", handlePartnerOffline);

		// Auto-connect if enabled
		if (autoConnect) {
			wsManager.connect().catch((error) => {
				logger.error("Initial WebSocket connection failed:", error);
			});
		}

		// Cleanup
		return () => {
			wsManager.off("stateChange", handleStateChange);
			wsManager.off("connected", handleConnected);
			wsManager.off("disconnected", handleDisconnected);
			wsManager.off("error", handleError);
			wsManager.off("maxReconnectAttemptsReached", handleMaxReconnectAttempts);
			wsManager.off("newMatch", handleNewMatch);
			wsManager.off("partnerOnline", handlePartnerOnline);
			wsManager.off("partnerOffline", handlePartnerOffline);
		};
	}, [autoConnect]);

	const connect = useCallback(async () => {
		try {
			await wsManager.connect();
		} catch (error) {
			logger.error("Failed to connect WebSocket:", error);
			throw error;
		}
	}, []);

	const disconnect = useCallback(() => {
		wsManager.disconnect();
	}, []);

	const sendMessage = useCallback((type: string, payload?: any) => {
		return wsManager.send({ type, payload });
	}, []);

	const sendPartnerActivity = useCallback((activity: string, data?: any) => {
		return wsManager.sendPartnerActivity(activity, data);
	}, []);

	const value: WebSocketContextType = {
		connectionState,
		isConnected,
		connect,
		disconnect,
		sendMessage,
		sendPartnerActivity,
	};

	return (
		<WebSocketContext.Provider value={value}>
			{children}
		</WebSocketContext.Provider>
	);
};

// Hook for match-specific WebSocket events
export const useMatchWebSocket = (onNewMatch?: (match: any) => void) => {
	const { isConnected } = useWebSocket();

	useEffect(() => {
		if (!onNewMatch) return;

		const handleNewMatch = (matchData: any) => {
			onNewMatch(matchData);
		};

		wsManager.on("newMatch", handleNewMatch);

		return () => {
			wsManager.off("newMatch", handleNewMatch);
		};
	}, [onNewMatch]);

	return { isConnected };
};

// Hook for partner activity WebSocket events
export const usePartnerActivity = (
	partnerId?: string,
	callbacks?: {
		onPartnerOnline?: (data: any) => void;
		onPartnerOffline?: (data: any) => void;
		onPartnerActivity?: (data: any) => void;
	},
) => {
	const { isConnected } = useWebSocket();
	const [partnerOnline, setPartnerOnline] = useState(false);

	useEffect(() => {
		if (!partnerId) return;

		const handlePartnerOnline = (data: any) => {
			if (data.userId === partnerId || data.partnerId === partnerId) {
				setPartnerOnline(true);
				callbacks?.onPartnerOnline?.(data);
			}
		};

		const handlePartnerOffline = (data: any) => {
			if (data.userId === partnerId || data.partnerId === partnerId) {
				setPartnerOnline(false);
				callbacks?.onPartnerOffline?.(data);
			}
		};

		const handlePartnerActivity = (data: any) => {
			if (data.userId === partnerId) {
				callbacks?.onPartnerActivity?.(data);
			}
		};

		wsManager.on("partnerOnline", handlePartnerOnline);
		wsManager.on("partnerOffline", handlePartnerOffline);
		wsManager.on("partnerActivity", handlePartnerActivity);

		return () => {
			wsManager.off("partnerOnline", handlePartnerOnline);
			wsManager.off("partnerOffline", handlePartnerOffline);
			wsManager.off("partnerActivity", handlePartnerActivity);
		};
	}, [partnerId, callbacks]);

	return { isConnected, partnerOnline };
};
