import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';

export const onlyAdmin = asyncHandler(async (req, res, next) => {
  try {
    // Check if user exists in request (set by authenticate middleware)
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      // Log unauthorized access attempt
      console.warn(`Unauthorized admin access attempt by user ${req.user._id} (${req.user.email})`);
      
      throw new ApiError(403, 'Admin access required');
    }

    // Verify user still exists in database and is active
    const user = await User.findById(req.user._id).select('+isActive +role');
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated');
    }

    if (user.role !== 'admin') {
      throw new ApiError(403, 'Admin privileges required');
    }

    // Log successful admin access
    console.log(`Admin access granted to user ${req.user._id} (${req.user.email})`);

    next();
  } catch (error) {
    // Log security events
    console.error(`Admin authorization failed: ${error.message}`, {
      userId: req.user?._id,
      userEmail: req.user?.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    next(error);
  }
});

// Enhanced admin middleware with specific permissions
export const adminWithPermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    try {
      // First check if user is admin
      if (!req.user || req.user.role !== 'admin') {
        throw new ApiError(403, 'Admin access required');
      }

      // Check for specific permission (you can expand this based on your needs)
      const adminPermissions = {
        'user_management': ['user_management', 'all'],
        'content_moderation': ['content_moderation', 'all'],
        'payment_management': ['payment_management', 'all'],
        'analytics': ['analytics', 'all'],
        'system_settings': ['system_settings', 'all']
      };

      // For now, all admins have all permissions
      // You can implement more granular permission checking here
      const userPermissions = adminPermissions[permission] || ['all'];

      if (!userPermissions.includes('all')) {
        throw new ApiError(403, `Permission '${permission}' required`);
      }

      // Log permission check
      console.log(`Admin permission check: ${permission} granted to user ${req.user._id}`);

      next();
    } catch (error) {
      console.error(`Admin permission check failed: ${error.message}`, {
        userId: req.user?._id,
        permission,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      next(error);
    }
  });
};












