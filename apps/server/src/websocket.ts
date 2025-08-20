import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { appRouter } from './routers';
import { createContext } from './lib/context';

export function createWebSocketServer(port: number = 3001) {
  const wss = new WebSocketServer({
    port,
  });

  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: async (opts) => {
      // For WebSocket connections, we need to handle auth differently
      // You might need to pass auth tokens via connection params
      return createContext({ 
        context: {
          // Add any WebSocket-specific context here
          req: opts.req,
          connectionParams: opts.connectionParams,
        } as any 
      });
    },
  });

  wss.on('connection', (ws) => {
    console.log(`➕ WebSocket connection (${wss.clients.size} total clients)`);
    
    ws.on('close', () => {
      console.log(`➖ WebSocket disconnected (${wss.clients.size} total clients)`);
    });
  });

  console.log(`✅ WebSocket Server listening on ws://localhost:${port}`);

  return {
    wss,
    handler,
  };
}