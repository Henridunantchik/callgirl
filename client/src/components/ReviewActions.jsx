import React, { useState } from "react";
import { Button } from "./ui/button";
import { Trash2, Edit, Star } from "lucide-react";
import { reviewAPI } from "../services/api";
import { showToast } from "../helpers/showToast";

const ReviewActions = ({ review, onReviewDeleted, onReviewUpdated }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    rating: review.rating,
    comment: review.comment,
    categories: review.categories || [],
  });

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      setIsDeleting(true);
      console.log("Deleting review:", review._id);

      const response = await reviewAPI.deleteReview(review._id);
      console.log("Delete response:", response);

      if (response.data && response.data.success) {
        showToast("success", "Review deleted successfully");
        onReviewDeleted && onReviewDeleted(review._id);
        
        // Trigger global event for real-time stats updates
        window.dispatchEvent(new CustomEvent("reviewDeleted", {
          detail: { escortId: review.escort, reviewId: review._id }
        }));
      } else {
        showToast("error", "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      showToast(
        "error",
        "Failed to delete review: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async () => {
    try {
      setIsEditing(true);
      console.log("Updating review:", review._id, editData);

      const response = await reviewAPI.updateReview(review._id, editData);
      console.log("Update response:", response);

      if (response.data && response.data.success) {
        showToast("success", "Review updated successfully");
        onReviewUpdated && onReviewUpdated(response.data.data);
        setIsEditing(false);
        
        // Trigger global event for real-time stats updates
        window.dispatchEvent(new CustomEvent("reviewUpdated", {
          detail: { escortId: review.escort, reviewId: review._id }
        }));
      } else {
        showToast("error", "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      showToast(
        "error",
        "Failed to update review: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4 mr-1" />
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        disabled={isEditing}
        className="text-blue-600 hover:text-blue-700"
      >
        <Edit className="w-4 h-4 mr-1" />
        {isEditing ? "Updating..." : "Edit"}
      </Button>
    </div>
  );
};

export default ReviewActions;
