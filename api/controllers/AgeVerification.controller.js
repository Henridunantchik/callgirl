import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadAgeVerificationDocument, getAgeVerificationStatus, VERIFICATION_STATUS } from '../utils/ageVerification.js';
import User from '../models/user.model.js';

/**
 * Upload age verification document
 * POST /api/auth/age-verification
 */
export const uploadAgeVerification = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { documentType } = req.body;

    // Check if file was uploaded
    if (!req.files || !req.files.document) {
      throw new ApiError(400, 'Age verification document is required');
    }

    const document = req.files.document;

    // Validate document type
    const validDocumentTypes = ['passport', 'drivers_license', 'national_id', 'birth_certificate', 'other'];
    if (documentType && !validDocumentTypes.includes(documentType)) {
      throw new ApiError(400, 'Invalid document type');
    }

    console.log(`Processing age verification for user ${userId}`);
    console.log(`Document type: ${documentType || 'not specified'}`);
    console.log(`File size: ${document.size} bytes`);

    // Process the document
    const verificationResult = await uploadAgeVerificationDocument(document, userId);

    // Update user's age verification status
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Update user with verification result
    user.ageVerification = {
      status: verificationResult.status,
      age: verificationResult.age,
      birthDate: verificationResult.birthDate,
      confidence: verificationResult.confidence,
      documentUrl: verificationResult.documentUrl,
      documentId: verificationResult.documentId,
      documentType: documentType || 'other',
      verifiedAt: verificationResult.status === VERIFICATION_STATUS.APPROVED ? new Date() : null,
      lastAttempt: new Date(),
      attempts: (user.ageVerification?.attempts || 0) + 1
    };

    // If age verification is approved, update user's age
    if (verificationResult.status === VERIFICATION_STATUS.APPROVED && verificationResult.age) {
      user.age = verificationResult.age;
      user.isAgeVerified = true;
    }

    await user.save();

    // Log the verification attempt
    console.log(`Age verification completed for user ${userId}:`, {
      status: verificationResult.status,
      age: verificationResult.age,
      confidence: verificationResult.confidence,
      reason: verificationResult.reason
    });

    return res.status(200).json(
      new ApiResponse(200, {
        status: verificationResult.status,
        age: verificationResult.age,
        confidence: verificationResult.confidence,
        message: verificationResult.reason,
        documentUrl: verificationResult.documentUrl
      }, 'Age verification processed successfully')
    );

  } catch (error) {
    console.error('Age verification upload failed:', error);
    next(error);
  }
});

/**
 * Get age verification status
 * GET /api/auth/age-verification/status
 */
export const getAgeVerificationStatusController = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).select('+ageVerification +age +isAgeVerified');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const status = {
      isAgeVerified: user.isAgeVerified || false,
      age: user.age || null,
      verificationStatus: user.ageVerification?.status || VERIFICATION_STATUS.PENDING,
      confidence: user.ageVerification?.confidence || 0,
      lastAttempt: user.ageVerification?.lastAttempt || null,
      attempts: user.ageVerification?.attempts || 0,
      documentUrl: user.ageVerification?.documentUrl || null,
      documentType: user.ageVerification?.documentType || null
    };

    return res.status(200).json(
      new ApiResponse(200, status, 'Age verification status retrieved')
    );

  } catch (error) {
    console.error('Failed to get age verification status:', error);
    next(error);
  }
});

/**
 * Resubmit age verification (for failed attempts)
 * POST /api/auth/age-verification/resubmit
 */
export const resubmitAgeVerification = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { documentType } = req.body;

    // Check if user has exceeded maximum attempts
    const user = await User.findById(userId).select('+ageVerification');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const maxAttempts = 5;
    if (user.ageVerification?.attempts >= maxAttempts) {
      throw new ApiError(429, `Maximum age verification attempts exceeded (${maxAttempts}). Please contact support.`);
    }

    // Check if file was uploaded
    if (!req.files || !req.files.document) {
      throw new ApiError(400, 'Age verification document is required');
    }

    const document = req.files.document;

    console.log(`Resubmitting age verification for user ${userId} (attempt ${(user.ageVerification?.attempts || 0) + 1})`);

    // Process the document
    const verificationResult = await uploadAgeVerificationDocument(document, userId);

    // Update user's age verification status
    user.ageVerification = {
      status: verificationResult.status,
      age: verificationResult.age,
      birthDate: verificationResult.birthDate,
      confidence: verificationResult.confidence,
      documentUrl: verificationResult.documentUrl,
      documentId: verificationResult.documentId,
      documentType: documentType || 'other',
      verifiedAt: verificationResult.status === VERIFICATION_STATUS.APPROVED ? new Date() : null,
      lastAttempt: new Date(),
      attempts: (user.ageVerification?.attempts || 0) + 1
    };

    // If age verification is approved, update user's age
    if (verificationResult.status === VERIFICATION_STATUS.APPROVED && verificationResult.age) {
      user.age = verificationResult.age;
      user.isAgeVerified = true;
    }

    await user.save();

    return res.status(200).json(
      new ApiResponse(200, {
        status: verificationResult.status,
        age: verificationResult.age,
        confidence: verificationResult.confidence,
        message: verificationResult.reason,
        attemptsRemaining: maxAttempts - user.ageVerification.attempts
      }, 'Age verification resubmitted successfully')
    );

  } catch (error) {
    console.error('Age verification resubmission failed:', error);
    next(error);
  }
});

/**
 * Admin: Review age verification documents
 * GET /api/admin/age-verifications
 */
export const getPendingAgeVerifications = asyncHandler(async (req, res, next) => {
  try {
    // Only admins can access this
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }

    const pendingVerifications = await User.find({
      'ageVerification.status': { $in: [VERIFICATION_STATUS.PENDING, VERIFICATION_STATUS.FAILED] },
      'ageVerification.attempts': { $gt: 0 }
    }).select('name email ageVerification createdAt');

    return res.status(200).json(
      new ApiResponse(200, pendingVerifications, 'Pending age verifications retrieved')
    );

  } catch (error) {
    console.error('Failed to get pending age verifications:', error);
    next(error);
  }
});

/**
 * Admin: Approve/reject age verification manually
 * PUT /api/admin/age-verification/:userId
 */
export const updateAgeVerificationStatus = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    // Only admins can access this
    if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }

    // Validate status
    const validStatuses = [VERIFICATION_STATUS.APPROVED, VERIFICATION_STATUS.REJECTED];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status. Must be "approved" or "rejected"');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.ageVerification) {
      throw new ApiError(400, 'No age verification document found for this user');
    }

    // Update verification status
    user.ageVerification.status = status;
    user.ageVerification.verifiedAt = status === VERIFICATION_STATUS.APPROVED ? new Date() : null;
    user.ageVerification.adminReason = reason;

    if (status === VERIFICATION_STATUS.APPROVED) {
      user.isAgeVerified = true;
      if (user.ageVerification.age) {
        user.age = user.ageVerification.age;
      }
    }

    await user.save();

    // Log admin action
    console.log(`Admin ${req.user._id} ${status} age verification for user ${userId}`, {
      reason,
      adminId: req.user._id,
      userId,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json(
      new ApiResponse(200, {
        status,
        message: `Age verification ${status} by admin`,
        reason
      }, 'Age verification status updated')
    );

  } catch (error) {
    console.error('Failed to update age verification status:', error);
    next(error);
  }
}); 