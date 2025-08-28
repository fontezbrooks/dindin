# Environment Configuration Setup Guide

## Overview

The DinDin app now uses a secure, validated environment configuration system with proper secret management and validation on startup. This ensures all sensitive data is protected and configuration errors are caught early.

## Quick Start

1. **Copy environment templates:**
   ```bash
   # Server environment
   cp apps/server/.env.example apps/server/.env
   
   # Native app environment
   cp apps/native/.env.example apps/native/.env
   ```

2. **Configure required variables** in both `.env` files (see sections below)

3. **Validate configuration:**
   ```bash
   bun run scripts/validate-env.ts
   ```

4. **Start the application:**
   ```bash
   # Start server
   cd apps/server
   bun run dev
   
   # Start native app
   cd apps/native
   bun run start
   ```

## Server Configuration (apps/server/.env)

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/dindin-app` |
| `BETTER_AUTH_SECRET` | Authentication secret (min 32 chars) | Generate with: `openssl rand -base64 32` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:8081,http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `WS_PORT` | WebSocket server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Logging level | `debug` |
| `ENABLE_WEBSOCKET` | Enable WebSocket server | `true` |
| `SPOONACULAR_API_KEY` | Spoonacular API key for recipes | - |
| `SENTRY_DSN` | Sentry error tracking | - |

## Native App Configuration (apps/native/.env)

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_SERVER_URL` | Backend server URL | `http://localhost:3000` |
| `EXPO_PUBLIC_WS_URL` | WebSocket server URL | `ws://localhost:3001` |
| `EXPO_PUBLIC_APP_URL` | App URL for auth callbacks | `http://localhost:8081` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_DEBUG_MODE` | Enable debug logging | `true` |
| `EXPO_PUBLIC_ENABLE_WEBSOCKET` | Enable real-time features | `true` |
| `EXPO_PUBLIC_ENABLE_OFFLINE_MODE` | Enable offline support | `true` |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry error tracking | - |

## Environment-Specific Configurations

### Development
```bash
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/dindin-dev
CORS_ORIGIN=http://localhost:8081
LOG_LEVEL=debug
```

### Staging
```bash
NODE_ENV=staging
DATABASE_URL=mongodb://username:password@staging.mongodb.net/dindin
CORS_ORIGIN=https://staging.dindin.app
LOG_LEVEL=info
```

### Production
```bash
NODE_ENV=production
DATABASE_URL=mongodb://username:password@prod.mongodb.net/dindin
CORS_ORIGIN=https://dindin.app
LOG_LEVEL=error
BETTER_AUTH_COOKIE_SECURE=true
```

## Security Best Practices

### 1. Never commit `.env` files
Ensure `.env` files are in `.gitignore`:
```gitignore
# Environment files
.env
.env.local
.env.*.local
```

### 2. Generate Strong Secrets
```bash
# Generate 32-character secret
openssl rand -base64 32

# Generate 64-character secret (extra secure)
openssl rand -base64 64
```

### 3. Rotate Secrets Regularly
- Development: Monthly
- Staging: Bi-weekly
- Production: Weekly or on any security incident

### 4. Use Different Secrets per Environment
Never reuse secrets between development, staging, and production.

## Validation Features

The new environment configuration system provides:

### Automatic Validation on Startup
- Server validates all required variables before starting
- Missing or invalid variables prevent startup in production
- Clear error messages guide configuration fixes

### Type Safety
- Environment variables are parsed and typed using Zod
- Runtime type checking prevents configuration errors
- TypeScript integration for compile-time safety

### Configuration Helper Functions
```typescript
// Server helpers
import config, { isProduction, isDevelopment, getCorsOrigins } from './config/env.config';

// Native app helpers
import appConfig, { isDebugMode, getServerUrl, isWebSocketEnabled } from './config/env.config';
```

## Troubleshooting

### Common Issues

#### 1. "Environment validation failed"
- Run: `bun run scripts/validate-env.ts`
- Check which variables are missing or invalid
- Update your `.env` file accordingly

#### 2. "DATABASE_URL is required"
- Ensure MongoDB is installed and running
- For Docker: `docker-compose up -d mongodb`
- For local: `brew services start mongodb-community`

#### 3. "BETTER_AUTH_SECRET must be at least 32 characters"
- Generate a new secret: `openssl rand -base64 32`
- Replace the placeholder in `.env`

#### 4. WebSocket connection failures
- Check if `WS_PORT` is available: `lsof -i :3001`
- Ensure `ENABLE_WEBSOCKET=true` in server `.env`
- Verify `EXPO_PUBLIC_WS_URL` matches server configuration

### Validation Script

Run the validation script to check your configuration:
```bash
bun run scripts/validate-env.ts
```

This will:
- Check for missing `.env` files
- Validate all required variables
- Identify placeholder values that need replacement
- Verify URL formats and port numbers
- Provide clear instructions for fixes

## Migration from Old Configuration

If you're upgrading from the old configuration:

1. **Backup existing `.env` files**
2. **Copy new `.env.example` templates**
3. **Transfer your existing values**
4. **Add new required variables**
5. **Run validation script**
6. **Test in development before deploying**

## Environment Variable Reference

### Complete Variable List

#### Server Variables
```env
# Required
DATABASE_URL=mongodb://localhost:27017/dindin-app
BETTER_AUTH_SECRET=your-32-char-min-secret
CORS_ORIGIN=http://localhost:8081

# Optional
PORT=3000
NODE_ENV=development
WS_PORT=3001
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_COOKIE_SECURE=false
SPOONACULAR_API_KEY=
LOG_LEVEL=debug
LOG_FORMAT=json
JWT_SECRET=
SESSION_SECRET=
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EMAIL_SERVICE=
EMAIL_USER=
EMAIL_PASS=
REDIS_URL=
SENTRY_DSN=
ENABLE_WEBSOCKET=true
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_PUSH_NOTIFICATIONS=false
```

#### Native App Variables
```env
# Required
EXPO_PUBLIC_SERVER_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3001
EXPO_PUBLIC_APP_URL=http://localhost:8081

# Optional
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_AUTH_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=DinDin
EXPO_PUBLIC_APP_SCHEME=dindin
EXPO_PUBLIC_BUNDLE_IDENTIFIER=com.dindin.app
EXPO_PUBLIC_ENABLE_WEBSOCKET=true
EXPO_PUBLIC_ENABLE_OFFLINE_MODE=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=false
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_ANALYTICS_ID=
EXPO_PUBLIC_MAPS_API_KEY=
```

## Support

If you encounter issues with environment configuration:

1. Check this documentation
2. Run the validation script
3. Review error messages in console
4. Check the example files for reference
5. Contact the development team if issues persist

---

*Last Updated: December 2024*
*Configuration Version: 2.0.0*