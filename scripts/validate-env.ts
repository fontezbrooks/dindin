#!/usr/bin/env bun

/**
 * Environment Validation Script
 * Run this script to validate environment configuration before starting the application
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: (msg: string) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n${"=".repeat(60)}`)
};

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class EnvValidator {
  private errors: string[] = [];
  private warnings: string[] = [];
  
  validateServerEnv(): ValidationResult {
    log.header("Validating Server Environment");
    
    // Get the project root (parent of scripts directory)
    const projectRoot = resolve(__dirname, "..");
    const serverEnvPath = resolve(projectRoot, "apps/server/.env");
    const serverEnvExamplePath = resolve(projectRoot, "apps/server/.env.example");
    
    if (!existsSync(serverEnvExamplePath)) {
      this.errors.push("Missing .env.example file in apps/server");
      return this.getResult();
    }
    
    if (!existsSync(serverEnvPath)) {
      this.errors.push("Missing .env file in apps/server - copy .env.example to .env and configure");
      return this.getResult();
    }
    
    const envContent = readFileSync(serverEnvPath, "utf-8");
    const exampleContent = readFileSync(serverEnvExamplePath, "utf-8");
    
    // Extract required variables from .env.example
    const requiredVars = this.extractVariables(exampleContent);
    const currentVars = this.parseEnvFile(envContent);
    
    // Check required variables
    requiredVars.forEach(varName => {
      if (!currentVars[varName]) {
        if (this.isOptionalVar(varName)) {
          this.warnings.push(`Optional variable ${varName} is not set`);
        } else {
          this.errors.push(`Required variable ${varName} is missing or empty`);
        }
      } else if (this.isPlaceholder(currentVars[varName])) {
        this.errors.push(`Variable ${varName} still has placeholder value: "${currentVars[varName]}"`);
      }
    });
    
    // Validate specific values
    this.validateDatabaseUrl(currentVars.DATABASE_URL);
    this.validateSecrets(currentVars);
    this.validatePorts(currentVars);
    
    return this.getResult();
  }
  
  validateNativeEnv(): ValidationResult {
    log.header("Validating Native App Environment");
    
    // Get the project root (parent of scripts directory)
    const projectRoot = resolve(__dirname, "..");
    const nativeEnvPath = resolve(projectRoot, "apps/native/.env");
    const nativeEnvExamplePath = resolve(projectRoot, "apps/native/.env.example");
    
    if (!existsSync(nativeEnvExamplePath)) {
      this.errors.push("Missing .env.example file in apps/native");
      return this.getResult();
    }
    
    if (!existsSync(nativeEnvPath)) {
      this.errors.push("Missing .env file in apps/native - copy .env.example to .env and configure");
      return this.getResult();
    }
    
    const envContent = readFileSync(nativeEnvPath, "utf-8");
    const exampleContent = readFileSync(nativeEnvExamplePath, "utf-8");
    
    const requiredVars = this.extractVariables(exampleContent);
    const currentVars = this.parseEnvFile(envContent);
    
    requiredVars.forEach(varName => {
      if (!currentVars[varName]) {
        if (this.isOptionalVar(varName)) {
          this.warnings.push(`Optional variable ${varName} is not set`);
        } else {
          this.errors.push(`Required variable ${varName} is missing or empty`);
        }
      }
    });
    
    // Validate URLs
    this.validateUrls(currentVars);
    
    return this.getResult();
  }
  
  private extractVariables(content: string): string[] {
    const lines = content.split("\n");
    const vars: string[] = [];
    
    lines.forEach(line => {
      if (!line.startsWith("#") && line.includes("=")) {
        const varName = line.split("=")[0].trim();
        if (varName) vars.push(varName);
      }
    });
    
    return vars;
  }
  
  private parseEnvFile(content: string): Record<string, string> {
    const vars: Record<string, string> = {};
    const lines = content.split("\n");
    
    lines.forEach(line => {
      if (!line.startsWith("#") && line.includes("=")) {
        const [key, ...valueParts] = line.split("=");
        const varName = key.trim();
        const varValue = valueParts.join("=").trim();
        if (varName) vars[varName] = varValue;
      }
    });
    
    return vars;
  }
  
  private isOptionalVar(varName: string): boolean {
    const optionalVars = [
      "SPOONACULAR_API_KEY",
      "JWT_SECRET",
      "SESSION_SECRET",
      "EMAIL_SERVICE",
      "EMAIL_USER",
      "EMAIL_PASS",
      "REDIS_URL",
      "SENTRY_DSN",
      "EXPO_PUBLIC_SENTRY_DSN",
      "EXPO_PUBLIC_ANALYTICS_ID",
      "EXPO_PUBLIC_MAPS_API_KEY"
    ];
    return optionalVars.includes(varName);
  }
  
  private isPlaceholder(value: string): boolean {
    const placeholders = [
      "your-",
      "change-in-production",
      "your@",
      "your.com",
      "here"
    ];
    return placeholders.some(p => value.toLowerCase().includes(p));
  }
  
  private validateDatabaseUrl(url?: string) {
    if (!url) {
      this.errors.push("DATABASE_URL is required");
      return;
    }
    
    if (!url.startsWith("mongodb://") && !url.startsWith("mongodb+srv://")) {
      this.errors.push("DATABASE_URL must be a valid MongoDB connection string");
    }
  }
  
  private validateSecrets(vars: Record<string, string>) {
    const secretVars = ["BETTER_AUTH_SECRET", "JWT_SECRET", "SESSION_SECRET"];
    
    secretVars.forEach(varName => {
      const value = vars[varName];
      if (value && value.length < 32) {
        this.errors.push(`${varName} should be at least 32 characters for security`);
      }
    });
  }
  
  private validatePorts(vars: Record<string, string>) {
    const portVars = ["PORT", "WS_PORT"];
    
    portVars.forEach(varName => {
      const value = vars[varName];
      if (value) {
        const port = parseInt(value);
        if (isNaN(port) || port < 1 || port > 65535) {
          this.errors.push(`${varName} must be a valid port number (1-65535)`);
        }
      }
    });
  }
  
  private validateUrls(vars: Record<string, string>) {
    const urlVars = [
      "EXPO_PUBLIC_SERVER_URL",
      "EXPO_PUBLIC_API_URL",
      "EXPO_PUBLIC_APP_URL",
      "EXPO_PUBLIC_AUTH_URL"
    ];
    
    urlVars.forEach(varName => {
      const value = vars[varName];
      if (value && !value.match(/^https?:\/\/.+/)) {
        this.errors.push(`${varName} must be a valid URL`);
      }
    });
    
    // Validate WebSocket URL
    const wsUrl = vars.EXPO_PUBLIC_WS_URL;
    if (wsUrl && !wsUrl.match(/^wss?:\/\/.+/)) {
      this.errors.push("EXPO_PUBLIC_WS_URL must be a valid WebSocket URL (ws:// or wss://)");
    }
  }
  
  private getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings]
    };
  }
  
  reset() {
    this.errors = [];
    this.warnings = [];
  }
}

// Main execution
async function main() {
  log.header("DinDin Environment Configuration Validator");
  
  const validator = new EnvValidator();
  
  // Validate server environment
  const serverResult = validator.validateServerEnv();
  
  if (serverResult.errors.length > 0) {
    log.error("Server environment validation failed:");
    serverResult.errors.forEach(error => log.error(`  • ${error}`));
  } else {
    log.success("Server environment is valid");
  }
  
  if (serverResult.warnings.length > 0) {
    log.warning("Server environment warnings:");
    serverResult.warnings.forEach(warning => log.warning(`  • ${warning}`));
  }
  
  // Reset for native validation
  validator.reset();
  
  // Validate native environment
  const nativeResult = validator.validateNativeEnv();
  
  if (nativeResult.errors.length > 0) {
    log.error("Native app environment validation failed:");
    nativeResult.errors.forEach(error => log.error(`  • ${error}`));
  } else {
    log.success("Native app environment is valid");
  }
  
  if (nativeResult.warnings.length > 0) {
    log.warning("Native app environment warnings:");
    nativeResult.warnings.forEach(warning => log.warning(`  • ${warning}`));
  }
  
  // Summary
  log.header("Validation Summary");
  
  const totalErrors = serverResult.errors.length + nativeResult.errors.length;
  const totalWarnings = serverResult.warnings.length + nativeResult.warnings.length;
  
  if (totalErrors === 0) {
    log.success("✅ Environment configuration is valid!");
    log.info("You can now start the application.");
    process.exit(0);
  } else {
    log.error(`❌ Found ${totalErrors} error(s) and ${totalWarnings} warning(s)`);
    log.info("\n📋 Next steps:");
    log.info("1. Copy .env.example to .env in both apps/server and apps/native");
    log.info("2. Configure all required variables with appropriate values");
    log.info("3. Replace placeholder values with actual configuration");
    log.info("4. Run this script again to validate");
    process.exit(1);
  }
}

// Run the validation
main().catch(error => {
  log.error("Validation script failed:");
  console.error(error);
  process.exit(1);
});