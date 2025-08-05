import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/env.js";

/**
 * Password validation utility
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Hash password with salt
 */
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcryptjs.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return await bcryptjs.compare(password, hash);
};

/**
 * Generate JWT token
 */
export const generateToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

/**
 * Generate secure random string
 */
export const generateSecureString = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate secure random number
 */
export const generateSecureNumber = (min = 100000, max = 999999) => {
  return crypto.randomInt(min, max + 1);
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Check if string contains sensitive data
 */
export const containsSensitiveData = (text) => {
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /key/i,
    /token/i,
    /api[_-]?key/i,
    /private[_-]?key/i
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(text));
};

/**
 * Rate limiting helper
 */
export const createRateLimitKey = (identifier, action) => {
  return `${identifier}:${action}:${Math.floor(Date.now() / 60000)}`;
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Strict transport security (HTTPS only)
  if (config.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  
  // Content security policy
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  
  next();
};

/**
 * Log security events
 */
export const logSecurityEvent = (event, details) => {
  const timestamp = new Date().toISOString();
  console.log(`🔒 SECURITY EVENT [${timestamp}]: ${event}`, details);
  
  // In production, you would send this to a security monitoring service
  if (config.NODE_ENV === "production") {
    // TODO: Implement security event logging to external service
  }
};

export default {
  validatePassword,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  generateSecureString,
  generateSecureNumber,
  sanitizeInput,
  validateEmail,
  validatePhone,
  containsSensitiveData,
  createRateLimitKey,
  securityHeaders,
  logSecurityEvent
}; 