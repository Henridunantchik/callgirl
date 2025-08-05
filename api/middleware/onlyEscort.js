import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';

export const onlyEscort = asyncHandler(async (req, res, next) => {
  try {
    // Check if user exists in request (set by authenticate middleware)
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Check if user has escort role
    if (req.user.role !== 'escort') {
      // Log unauthorized access attempt
      console.warn(`Unauthorized escort access attempt by user ${req.user._id} (${req.user.email}) - Role: ${req.user.role}`);
      
      throw new ApiError(403, 'Escort access required');
    }

    // Verify user still exists in database and is active
    const user = await User.findById(req.user._id).select('+isActive +role +isVerified');
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated');
    }

    if (user.role !== 'escort') {
      throw new ApiError(403, 'Escort privileges required');
    }

    // Optional: Check if escort profile is verified (you can make this configurable)
    // if (!user.isVerified) {
    //   throw new ApiError(403, 'Profile verification required');
    // }

    // Log successful escort access
    console.log(`Escort access granted to user ${req.user._id} (${req.user.email})`);

    next();
  } catch (error) {
    // Log security events
    console.error(`Escort authorization failed: ${error.message}`, {
      userId: req.user?._id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    next(error);
  }
});

// Enhanced escort middleware with profile completion check
export const escortWithCompleteProfile = asyncHandler(async (req, res, next) => {
  try {
    // First check if user is escort
    if (!req.user || req.user.role !== 'escort') {
      throw new ApiError(403, 'Escort access required');
    }

    // Get full escort profile
    const escort = await User.findById(req.user._id).select('+bio +rates +services +gallery +location');
    
    if (!escort) {
      throw new ApiError(401, 'User not found');
    }

    // Check if profile is complete (you can customize these requirements)
    const requiredFields = ['bio', 'rates', 'location'];
    const missingFields = requiredFields.filter(field => !escort[field]);

    if (missingFields.length > 0) {
      throw new ApiError(400, `Profile incomplete. Missing: ${missingFields.join(', ')}`);
    }

    // Check if escort has at least one service
    if (!escort.services || escort.services.length === 0) {
      throw new ApiError(400, 'At least one service must be added to your profile');
    }

    // Check if escort has at least one gallery image
    if (!escort.gallery || escort.gallery.length === 0) {
      throw new ApiError(400, 'At least one gallery image must be uploaded');
    }

    // Log profile completion check
    console.log(`Escort profile completion check passed for user ${req.user._id}`);

    next();
  } catch (error) {
    console.error(`Escort profile completion check failed: ${error.message}`, {
      userId: req.user?._id,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    next(error);
  }
});

// Escort middleware for verified profiles only
export const onlyVerifiedEscort = asyncHandler(async (req, res, next) => {
  try {
    // First check if user is escort
    if (!req.user || req.user.role !== 'escort') {
      throw new ApiError(403, 'Escort access required');
    }

    // Check if escort is verified
    const escort = await User.findById(req.user._id).select('+isVerified');
    
    if (!escort) {
      throw new ApiError(401, 'User not found');
    }

    if (!escort.isVerified) {
      throw new ApiError(403, 'Profile verification required. Please contact support.');
    }

    // Log verified escort access
    console.log(`Verified escort access granted to user ${req.user._id}`);

    next();
  } catch (error) {
    console.error(`Verified escort authorization failed: ${error.message}`, {
      userId: req.user?._id,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    next(error);
  }
});
