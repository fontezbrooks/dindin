/**
 * Logger utility tests
 * Validates that logger works correctly in different environments
 */

import { Logger } from '../apps/server/src/lib/logger';

describe('Logger Utility', () => {
  let originalEnv: string | undefined;
  let consoleSpy: {
    log: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeAll(() => {
    originalEnv = process.env.NODE_ENV;
  });

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('Development Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    test('should log messages in development', () => {
      const logger = new Logger();
      
      logger.info('Test info message');
      expect(consoleSpy.info).toHaveBeenCalled();
      
      logger.warn('Test warning');
      expect(consoleSpy.warn).toHaveBeenCalled();
      
      logger.error('Test error');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    test('should include timestamp and prefix', () => {
      const logger = new Logger({ prefix: '[Test]' });
      
      logger.info('Test message');
      
      const call = consoleSpy.info.mock.calls[0];
      expect(call[0]).toContain('[Test]');
      expect(call[0]).toContain('[INFO]');
      expect(call[1]).toBe('Test message');
    });

    test('should respect log level', () => {
      process.env.LOG_LEVEL = 'warn';
      const logger = new Logger();
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
      
      delete process.env.LOG_LEVEL;
    });
  });

  describe('Production Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    test('should NOT log in production', () => {
      const logger = new Logger();
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    test('should not log even with explicit config', () => {
      const logger = new Logger({ isDevelopment: false });
      
      logger.info('Should not appear');
      
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });

  describe('Sensitive Data Sanitization', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    test('should redact sensitive fields', () => {
      const logger = new Logger();
      
      const sensitiveData = {
        username: 'john',
        password: 'secret123',
        apiKey: 'abc123',
        token: 'jwt-token',
        data: {
          secret: 'hidden',
          public: 'visible'
        }
      };
      
      logger.logSafe('User data:', sensitiveData);
      
      const call = consoleSpy.info.mock.calls[0];
      const loggedData = call[2];
      
      expect(loggedData.username).toBe('john');
      expect(loggedData.password).toBe('[REDACTED]');
      expect(loggedData.apiKey).toBe('[REDACTED]');
      expect(loggedData.token).toBe('[REDACTED]');
      expect(loggedData.data.secret).toBe('[REDACTED]');
      expect(loggedData.data.public).toBe('visible');
    });

    test('should handle arrays with sensitive data', () => {
      const logger = new Logger();
      
      const data = {
        users: [
          { id: 1, password: 'secret1' },
          { id: 2, password: 'secret2' }
        ]
      };
      
      logger.logSafe('Users:', data);
      
      const call = consoleSpy.info.mock.calls[0];
      const loggedData = call[2];
      
      expect(loggedData.users[0].id).toBe(1);
      expect(loggedData.users[0].password).toBe('[REDACTED]');
      expect(loggedData.users[1].password).toBe('[REDACTED]');
    });
  });

  describe('Child Loggers', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    test('should create child logger with additional prefix', () => {
      const parentLogger = new Logger({ prefix: '[Parent]' });
      const childLogger = parentLogger.child('[Child]');
      
      childLogger.info('Test message');
      
      const call = consoleSpy.info.mock.calls[0];
      expect(call[0]).toContain('[Parent] [Child]');
    });

    test('should inherit parent configuration', () => {
      process.env.NODE_ENV = 'production';
      const parentLogger = new Logger();
      const childLogger = parentLogger.child('[Child]');
      
      childLogger.info('Should not log');
      
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });
});

// Run tests
if (process.argv.includes('--run')) {
  console.log('Running logger tests...');
  // In a real scenario, you'd use Jest runner
  // This is just for demonstration
}