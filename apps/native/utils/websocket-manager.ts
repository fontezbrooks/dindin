import { authClient } from "@/lib/auth-client";
import { EventEmitter } from "./event-emitter";

export enum ConnectionState {
	CONNECTING = "CONNECTING",
	CONNECTED = "CONNECTED",
	DISCONNECTED = "DISCONNECTED",
	RECONNECTING = "RECONNECTING",
	ERROR = "ERROR",
}

interface WebSocketMessage {
	type: string;
	payload?: any;
	timestamp?: number;
}

export class WebSocketManager extends EventEmitter {
	private ws: WebSocket | null = null;
	private url: string;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
	private state: ConnectionState = ConnectionState.DISCONNECTED;
	private messageQueue: WebSocketMessage[] = [];
	private connectionPromise: Promise<void> | null = null;

	constructor(url?: string) {
		super();
		// Use environment variable EXPO_PUBLIC_WS_URL as the primary source
		// Falls back to localhost for development if not set
		this.url = url || process.env.EXPO_PUBLIC_WS_URL || "ws://localhost:3001";
		console.log("WebSocketManager initialized with URL:", this.url);
	}

	public async connect(): Promise<void> {
		if (this.state === ConnectionState.CONNECTED) {
			console.log("Already connected");
			return;
		}

		if (this.state === ConnectionState.CONNECTING) {
			console.log("Connection already in progress");
			return this.connectionPromise || Promise.resolve();
		}

		this.setState(ConnectionState.CONNECTING);

		this.connectionPromise = new Promise<void>((resolve, reject) => {
			this.performConnection(resolve, reject);
		});

		return this.connectionPromise;
	}

	private async performConnection(resolve: Function, reject: Function) {
		try {
			const token = await this.getAuthToken();

			if (!token) {
				console.warn(
					"No auth token available, attempting connection without authentication",
				);
			}

			const wsUrl = token
				? `${this.url}?token=${encodeURIComponent(token)}`
				: this.url;

			console.log("Attempting WebSocket connection...");
			this.ws = new WebSocket(wsUrl);

			this.setupEventHandlers(resolve, reject);
		} catch (error) {
			console.error("Failed to initialize WebSocket connection:", error);
			this.setState(ConnectionState.ERROR);
			this.scheduleReconnect();
			reject(error);
		}
	}

	private setupEventHandlers(resolve?: Function, reject?: Function) {
		if (!this.ws) return;

		this.ws.onopen = () => {
			console.log("✅ WebSocket connected successfully");
			this.setState(ConnectionState.CONNECTED);
			this.reconnectAttempts = 0;
			this.connectionPromise = null;

			// Flush any queued messages
			this.flushMessageQueue();

			// Start heartbeat
			this.startHeartbeat();

			// Emit connected event
			this.emit("connected");

			if (resolve) resolve();
		};

		this.ws.onclose = (event) => {
			console.log(
				`WebSocket closed - Code: ${event.code}, Reason: ${event.reason || "No reason provided"}`,
			);
			this.setState(ConnectionState.DISCONNECTED);
			this.stopHeartbeat();
			this.emit("disconnected", { code: event.code, reason: event.reason });

			// Reconnect on abnormal closure
			if (event.code !== 1000 && event.code !== 1001) {
				this.scheduleReconnect();
			}

			if (reject && this.state === ConnectionState.CONNECTING) {
				reject(new Error(`Connection closed: ${event.reason}`));
			}
		};

		this.ws.onerror = (error) => {
			console.error("WebSocket error:", error);
			this.setState(ConnectionState.ERROR);
			this.emit("error", error);

			if (reject && this.state === ConnectionState.CONNECTING) {
				reject(error);
			}
		};

		this.ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				console.log("Parsed WebSocket message:", data);
				this.handleMessage(data);
			} catch (error) {
				console.error(
					"Failed to parse WebSocket message:",
					error,
					"Raw data:",
					event.data,
				);
			}
		};
	}

	private handleMessage(data: WebSocketMessage) {
		console.log("Received WebSocket message:", data.type);

		switch (data.type) {
			case "connected":
				console.log("Server confirmed connection:", data);
				this.emit("serverConnected", data);
				break;

			case "newMatch":
				console.log("New match received:", data.payload);
				this.emit("newMatch", data.payload);
				break;

			case "matchUpdate":
				this.emit("matchUpdate", data.payload);
				break;

			case "partnerOnline":
				console.log("Partner came online:", data);
				this.emit("partnerOnline", data);
				break;

			case "partnerOffline":
				console.log("Partner went offline:", data);
				this.emit("partnerOffline", data);
				break;

			case "partnerActivity":
				this.emit("partnerActivity", data);
				break;

			case "partnerSwiping":
				this.emit("partnerSwiping", data.payload);
				break;

			case "pong":
				// Handle pong response
				this.emit("pong", data.timestamp);
				break;

			default:
				// Emit generic message event for unhandled types
				this.emit("message", data);
		}
	}

	public send(data: WebSocketMessage): boolean {
		if (
			this.state === ConnectionState.CONNECTED &&
			this.ws?.readyState === WebSocket.OPEN
		) {
			try {
				this.ws.send(JSON.stringify(data));
				return true;
			} catch (error) {
				console.error("Failed to send message:", error);
				this.messageQueue.push(data);
				return false;
			}
		} else {
			// Queue message for sending when connected
			console.log("Queueing message (not connected):", data.type);
			this.messageQueue.push(data);

			// Attempt to connect if disconnected
			if (this.state === ConnectionState.DISCONNECTED) {
				this.connect();
			}

			return false;
		}
	}

	private flushMessageQueue() {
		console.log(`Flushing ${this.messageQueue.length} queued messages`);

		while (
			this.messageQueue.length > 0 &&
			this.ws?.readyState === WebSocket.OPEN
		) {
			const message = this.messageQueue.shift();
			if (message) {
				try {
					this.ws.send(JSON.stringify(message));
				} catch (error) {
					console.error("Failed to send queued message:", error);
					// Put it back in the queue
					this.messageQueue.unshift(message);
					break;
				}
			}
		}
	}

	private scheduleReconnect() {
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error("Max reconnection attempts reached");
			this.emit("maxReconnectAttemptsReached");
			this.setState(ConnectionState.ERROR);
			return;
		}

		this.setState(ConnectionState.RECONNECTING);
		this.reconnectAttempts++;

		// Exponential backoff with max delay of 30 seconds
		const delay = Math.min(
			this.reconnectDelay * 2 ** (this.reconnectAttempts - 1),
			30000,
		);

		console.log(
			`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
		);

		setTimeout(() => {
			this.connect();
		}, delay);
	}

	private startHeartbeat() {
		this.stopHeartbeat(); // Clear any existing interval

		this.heartbeatInterval = setInterval(() => {
			if (this.ws?.readyState === WebSocket.OPEN) {
				this.send({ type: "ping", timestamp: Date.now() });
			}
		}, 30000); // 30 seconds
	}

	private stopHeartbeat() {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
	}

	private async getAuthToken(): Promise<string | null> {
		try {
			// Get cookies from auth client
			const cookies = authClient.getCookie();

			if (cookies) {
				// Extract the session token from cookies
				const sessionMatch = cookies.match(
					/better-auth\.session_token=([^;]+)/,
				);
				if (sessionMatch) {
					return sessionMatch[1];
				}

				// Fallback to auth-token
				const authMatch = cookies.match(/auth-token=([^;]+)/);
				if (authMatch) {
					return authMatch[1];
				}
			}

			// Try to get token directly from auth client session
			const session = await authClient.getSession();
			if (session?.data?.session?.token) {
				return session.data.session.token;
			}

			return null;
		} catch (error) {
			console.error("Failed to get auth token:", error);
			return null;
		}
	}

	private setState(state: ConnectionState) {
		if (this.state !== state) {
			const oldState = this.state;
			this.state = state;
			console.log(`WebSocket state changed: ${oldState} -> ${state}`);
			this.emit("stateChange", { oldState, newState: state });
		}
	}

	public getState(): ConnectionState {
		return this.state;
	}

	public disconnect() {
		console.log("Manually disconnecting WebSocket");

		this.stopHeartbeat();
		this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect

		if (this.ws) {
			this.ws.close(1000, "Client disconnect");
			this.ws = null;
		}

		this.setState(ConnectionState.DISCONNECTED);
		this.messageQueue = [];
	}

	public isConnected(): boolean {
		return (
			this.state === ConnectionState.CONNECTED &&
			this.ws?.readyState === WebSocket.OPEN
		);
	}

	public resetReconnectAttempts() {
		this.reconnectAttempts = 0;
	}

	public setMaxReconnectAttempts(max: number) {
		this.maxReconnectAttempts = max;
	}

	public sendPartnerActivity(activity: string, data?: any) {
		return this.send({
			type: "partnerActivity",
			payload: { activity, data, timestamp: Date.now() },
		});
	}
}

// Export singleton instance
let wsManagerInstance: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
	if (!wsManagerInstance) {
		wsManagerInstance = new WebSocketManager();
	}
	return wsManagerInstance;
}

export const wsManager = getWebSocketManager();
