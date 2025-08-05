import { sanitizeInput, validateEmail, validatePassword } from '../utils/security.js';
import { ApiError } from '../utils/ApiError.js';

// Input validation middleware
export const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        throw new ApiError(400, `Validation error: ${error.details[0].message}`);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Sanitize all input fields
export const sanitizeAllInput = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeInput(req.body[key]);
        }
      });
    }

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeInput(req.query[key]);
        }
      });
    }

    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeInput(req.params[key]);
        }
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validate email format
export const validateEmailInput = (req, res, next) => {
  try {
    const { email } = req.body;
    if (email && !validateEmail(email)) {
      throw new ApiError(400, 'Invalid email format');
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Validate password strength
export const validatePasswordInput = (req, res, next) => {
  try {
    const { password } = req.body;
    if (password && !validatePassword(password)) {
      throw new ApiError(400, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Validate file upload
export const validateFileUpload = (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const fieldName in req.files) {
      const file = req.files[fieldName];
      
      if (Array.isArray(file)) {
        // Handle multiple files
        file.forEach(singleFile => {
          if (!allowedTypes.includes(singleFile.mimetype)) {
            throw new ApiError(400, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
          }
          if (singleFile.size > maxSize) {
            throw new ApiError(400, 'File size too large. Maximum size is 5MB');
          }
        });
      } else {
        // Handle single file
        if (!allowedTypes.includes(file.mimetype)) {
          throw new ApiError(400, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }
        if (file.size > maxSize) {
          throw new ApiError(400, 'File size too large. Maximum size is 5MB');
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}; 