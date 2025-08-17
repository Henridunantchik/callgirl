import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Loader2,
} from "lucide-react";
import { reviewAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../helpers/showToast";

const ReviewSystem = ({ escortId, onReviewUpdate }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userReview, setUserReview] = useState(null);

  // Fetch reviews on mount
  useEffect(() => {
    if (escortId) {
      fetchReviews();
      checkUserReview();
    }
  }, [escortId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getEscortReviews(escortId);
      if (response.data && response.data.data) {
        setReviews(response.data.data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      showToast("error", "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!user) return;

    try {
      const response = await reviewAPI.getUserReviews();
      if (response.data && response.data.data) {
        const userReview = response.data.data.reviews.find(
          (review) => review.escort._id === escortId
        );
        setUserReview(userReview);
      }
    } catch (error) {
      console.error("Error checking user review:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      showToast("error", "Please sign in to leave a review");
      return;
    }

    if (rating === 0) {
      showToast("error", "Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      const reviewData = {
        escortId,
        rating,
        comment: comment.trim(),
      };

      if (userReview) {
        // Update existing review
        await reviewAPI.updateReview(userReview._id, reviewData);
        showToast("success", "Review updated successfully");
      } else {
        // Create new review
        await reviewAPI.createReview(reviewData);
        showToast("success", "Review submitted successfully");
      }

      // Reset form
      setRating(0);
      setComment("");
      setShowForm(false);

      // Refresh reviews
      await fetchReviews();
      await checkUserReview();

      // Notify parent component
      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to submit review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewAPI.deleteReview(reviewId);
      showToast("success", "Review deleted successfully");
      await fetchReviews();
      await checkUserReview();
    } catch (error) {
      console.error("Error deleting review:", error);
      showToast("error", "Failed to delete review");
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "div"}
            onClick={interactive ? () => onStarClick(star) : undefined}
            className={`${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }`}
            disabled={!interactive}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(averageRating))}
            <div className="text-sm text-gray-600 mt-1">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {user && !userReview && (
          <Button onClick={() => setShowForm(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">
            {userReview ? "Edit Your Review" : "Write a Review"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              {renderStars(rating, true, setRating)}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comment</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <MessageSquare className="w-4 h-4 mr-2" />
                )}
                {userReview ? "Update Review" : "Submit Review"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setRating(0);
                  setComment("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Reviews</h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                                         <Avatar className="w-10 h-10">
                       <AvatarImage src="/anonymous-avatar.png" />
                       <AvatarFallback>
                         A
                       </AvatarFallback>
                     </Avatar>
                     <div>
                       <div className="font-semibold">
                         Anonymous Client
                       </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {renderStars(review.rating)}
                        <span>•</span>
                        <span>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {user && review.client._id === user._id && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRating(review.rating);
                          setComment(review.comment);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {review.comment && (
                  <div className="mt-3 text-gray-700">{review.comment}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
