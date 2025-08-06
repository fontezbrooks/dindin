import winston from "winston";
import path from "path";

// Create logs directory if it doesn't exist
import fs from "fs";
const logDir = path.join("./", "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: "dindin-backend" },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console logging for development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Helper functions for common logging patterns
const logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

const logRequest = (req, res, duration) => {
  logger.info({
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    duration: `${duration}ms`,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: req.user?.userId,
  });
};

const logDatabaseError = (error, query, params) => {
  logger.error({
    message: "Database query failed",
    error: error.message,
    query: query?.substring(0, 200), // Limit query length in logs
    params,
    stack: error.stack,
  });
};

const logSecurityEvent = (event, req, details = {}) => {
  logger.warn({
    event: "security",
    type: event,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    url: req.originalUrl,
    userId: req.user?.userId,
    ...details,
  });
};

export {
  logger as default,
  logger,
  logError,
  logRequest,
  logDatabaseError,
  logSecurityEvent,
};
