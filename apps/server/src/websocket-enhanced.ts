import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer, WebSocket } from 'ws';
import { appRouter } from './routers';
import { createContext } from './lib/context';
import { auth } from './lib/auth';
import { DindinUser } from './db';
import { IncomingMessage } from 'http';
import * as http from 'http';
import { EventEmitter } from 'events';

interface WSClient extends WebSocket {
  userId?: string;
  partnerId?: string;
  isAlive?: boolean;
  authUserId?: string;
}

interface AuthenticatedUser {
  _id: string;
  authUserId: string;
  partnerId?: string;
  name: string;
}

export class EnhancedWebSocketServer extends EventEmitter {
  private wss: WebSocketServer;
  private clients: Map<string, WSClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private handler: any;

  constructor(port: number = 3001) {
    super();

    this.wss = new WebSocketServer({
      port,
      verifyClient: async (info, cb) => {
        try {
          const token = this.extractToken(info.req);

          // Allow connection without token for initial auth operations
          // The actual authentication will happen after connection
          if (!token) {
            console.log('WebSocket connection allowed without token (for auth operations)');
            cb(true);
            return;
          }

          // If token is provided, verify it
          const session = await this.verifySession(token);

          if (!session) {
            console.log('WebSocket connection rejected: Invalid token');
            cb(false, 401, 'Invalid token');
            return;
          }

          console.log('WebSocket connection authenticated for session:', session?.user?.id);
          cb(true);
        } catch (error) {
          console.error('WebSocket verification error:', error);
          cb(false, 500, 'Internal server error');
        }
      }
    });

    this.setupHandlers();
    this.startHeartbeat();

    console.log(`✅ Enhanced WebSocket Server listening on ws://localhost:${port}`);
  }

  private extractToken(req: IncomingMessage): string | null {
    // Try URL params first
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (token) return token;

    // Try Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try cookie (better-auth format)
    const cookies = req.headers.cookie?.split(';') || [];
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === 'better-auth.session_token' || key === 'auth-token') {
        return value;
      }
    }

    return null;
  }

  private async verifySession(token: string): Promise<any> {
    try {
      // Use better-auth to verify session
      const headers = new Headers();
      headers.set('Cookie', `better-auth.session_token=${token}`);

      const session = await auth.api.getSession({ headers });
      return session;
    } catch (error) {
      console.error('Session verification error:', error);
      return null;
    }
  }

  private setupHandlers() {
    // Setup tRPC handler
    this.handler = applyWSSHandler({
      wss: this.wss,
      router: appRouter,
      createContext: async (opts) => {
        const token = this.extractToken(opts.req);
        const session = token ? await this.verifySession(token) : null;

        // Return the context directly without calling createContext
        // since we already have the session
        return {
          session: session ? { user: session.user } : null,
        };
      },
    });

    this.wss.on('connection', async (ws: WSClient, req) => {
      console.log(`➕ WebSocket connection attempt`);

      try {
        // Setup connection metadata
        const token = this.extractToken(req);
        const session = token ? await this.verifySession(token) : null;

        if (session?.user) {
          // Find DindinUser from auth user
          const user = await DindinUser.findOne({
            authUserId: session.user.id
          }).lean() as AuthenticatedUser | null;

          if (user) {
            ws.userId = user._id.toString();
            ws.authUserId = user.authUserId;
            ws.partnerId = user.partnerId?.toString();
            ws.isAlive = true;

            // Store client connection
            this.clients.set(ws.userId, ws);

            console.log(`✅ User ${user.name} (${ws.userId}) connected via WebSocket`);

            // Notify partner of online status if they're connected
            if (ws.partnerId && this.clients.has(ws.partnerId)) {
              this.sendToUser(ws.partnerId, {
                type: 'partnerOnline',
                userId: ws.userId,
                userName: user.name
              });
              console.log(`📢 Notified partner ${ws.partnerId} that user is online`);
            }

            // Send connection success message
            ws.send(JSON.stringify({
              type: 'connected',
              userId: ws.userId,
              message: 'WebSocket connection established'
            }));
          } else {
            console.log('⚠️ DindinUser not found for auth user:', session.user.id);
            // Still send a connected message for auth users without DindinUser
            ws.send(JSON.stringify({
              type: 'connected',
              message: 'WebSocket connection established (pending user creation)'
            }));
          }
        } else {
          // Send connection message for unauthenticated connections
          console.log('ℹ️ Unauthenticated WebSocket connection');
          ws.send(JSON.stringify({
            type: 'connected',
            message: 'WebSocket connection established (unauthenticated)'
          }));
        }
      } catch (error) {
        console.error('Connection setup error:', error);
      }

      // Setup ping/pong for connection health
      ws.on('pong', () => {
        if (ws.isAlive !== undefined) {
          ws.isAlive = true;
        }
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(ws, message);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      });

      ws.on('close', () => {
        console.log(`➖ WebSocket disconnected`);

        if (ws.userId) {
          this.clients.delete(ws.userId);

          // Notify partner of offline status
          if (ws.partnerId && this.clients.has(ws.partnerId)) {
            this.sendToUser(ws.partnerId, {
              type: 'partnerOffline',
              userId: ws.userId
            });
            console.log(`📢 Notified partner ${ws.partnerId} that user is offline`);
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handleClientMessage(ws: WSClient, message: any) {
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;

      case 'partnerActivity':
        // Forward activity to partner
        if (ws.partnerId && this.clients.has(ws.partnerId)) {
          this.sendToUser(ws.partnerId, {
            type: 'partnerActivity',
            activity: message.activity,
            userId: ws.userId
          });
        }
        break;

      default:
        // Handle other message types
        this.emit('clientMessage', { client: ws, message });
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WSClient) => {
        if (ws.isAlive === false) {
          console.log('💔 Terminating inactive connection');
          ws.terminate();
          if (ws.userId) {
            this.clients.delete(ws.userId);
          }
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  public sendToUser(userId: string, data: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  public sendToPartners(userId1: string, userId2: string, data: any) {
    const sent1 = this.sendToUser(userId1, data);
    const sent2 = this.sendToUser(userId2, data);
    return sent1 || sent2;
  }

  public broadcastToAll(data: any) {
    let count = 0;
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
        count++;
      }
    });
    return count;
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.clients.keys());
  }

  public isUserConnected(userId: string): boolean {
    return this.clients.has(userId) &&
           this.clients.get(userId)?.readyState === WebSocket.OPEN;
  }

  public shutdown() {
    console.log('🛑 Shutting down WebSocket server');

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Close all client connections
    this.wss.clients.forEach((client) => {
      client.close(1000, 'Server shutting down');
    });

    this.wss.close();
    this.clients.clear();
  }
}

// Export singleton instance
let wsServerInstance: EnhancedWebSocketServer | null = null;

export function createEnhancedWebSocketServer(port?: number): EnhancedWebSocketServer {
  if (!wsServerInstance) {
    wsServerInstance = new EnhancedWebSocketServer(port);
  }
  return wsServerInstance;
}

export function getWebSocketServer(): EnhancedWebSocketServer | null {
  return wsServerInstance;
}
