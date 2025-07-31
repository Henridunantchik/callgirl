import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  User,
  Calendar,
  Flag,
  Check,
  X,
} from "lucide-react";

const RatingSystem = ({
  escortId,
  currentRating = 0,
  totalReviews = 0,
  reviews = [],
  onReviewSubmit,
  canReview = false,
}) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const ratingCategories = [
    { id: "appearance", label: "Appearance", icon: "👩" },
    { id: "service", label: "Service Quality", icon: "⭐" },
    { id: "communication", label: "Communication", icon: "💬" },
    { id: "punctuality", label: "Punctuality", icon: "⏰" },
    { id: "value", label: "Value for Money", icon: "💰" },
  ];

  const ratingBreakdown = [
    { stars: 5, count: 45, percentage: 60 },
    { stars: 4, count: 20, percentage: 27 },
    { stars: 3, count: 5, percentage: 7 },
    { stars: 2, count: 3, percentage: 4 },
    { stars: 1, count: 2, percentage: 2 },
  ];

  const handleStarClick = (star) => {
    setSelectedRating(star);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleReviewSubmit = () => {
    if (selectedRating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!reviewText.trim()) {
      alert("Please write a review");
      return;
    }

    const review = {
      rating: selectedRating,
      text: reviewText,
      categories: selectedCategories,
      escortId,
      date: new Date().toISOString(),
    };

    onReviewSubmit?.(review);

    // Reset form
    setSelectedRating(0);
    setReviewText("");
    setSelectedCategories([]);
    setShowReviewForm(false);
  };

  const renderStars = (rating, interactive = false, size = "w-5 h-5") => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = interactive
        ? starValue <= (hoveredStar || selectedRating)
        : starValue <= rating;

      return (
        <button
          key={index}
          type={interactive ? "button" : undefined}
          className={`${interactive ? "cursor-pointer" : ""} transition-colors`}
          onClick={interactive ? () => handleStarClick(starValue) : undefined}
          onMouseEnter={
            interactive ? () => setHoveredStar(starValue) : undefined
          }
          onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
        >
          <Star
            className={`${size} ${
              isFilled ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        </button>
      );
    });
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.5) return "Good";
    if (rating >= 3.0) return "Average";
    if (rating >= 2.0) return "Below Average";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {currentRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 my-2">
                {renderStars(currentRating)}
              </div>
              <div className="text-sm text-gray-600">
                {getRatingText(currentRating)}
              </div>
              <div className="text-sm text-gray-500">
                {totalReviews} reviews
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-2">
                {ratingBreakdown.map((item) => (
                  <div key={item.stars} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm">{item.stars}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {canReview && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            {!showReviewForm ? (
              <Button onClick={() => setShowReviewForm(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Rating Selection */}
                <div>
                  <Label>Overall Rating</Label>
                  <div className="flex items-center gap-1 mt-2">
                    {renderStars(selectedRating, true, "w-6 h-6")}
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedRating > 0 && `${selectedRating} stars`}
                    </span>
                  </div>
                </div>

                {/* Category Ratings */}
                <div>
                  <Label>Rate by Category</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {ratingCategories.map((category) => (
                      <div
                        key={category.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedCategories.includes(category.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleCategoryToggle(category.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="text-sm font-medium">
                            {category.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <Label htmlFor="review">Your Review</Label>
                  <Textarea
                    id="review"
                    placeholder="Share your experience with this escort..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button onClick={handleReviewSubmit}>
                    <Check className="w-4 h-4 mr-2" />
                    Submit Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            ) : (
              reviews.map((review, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {review.userName || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating, false, "w-3 h-3")}
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-gray-700 mb-3">{review.text}</p>

                  {review.categories && review.categories.length > 0 && (
                    <div className="flex items-center gap-2">
                      {review.categories.map((categoryId) => {
                        const category = ratingCategories.find(
                          (c) => c.id === categoryId
                        );
                        return category ? (
                          <Badge
                            key={categoryId}
                            variant="outline"
                            className="text-xs"
                          >
                            {category.icon} {category.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpfulCount || 0})
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 hover:text-red-600">
                      <ThumbsDown className="w-4 h-4" />
                      Not Helpful ({review.notHelpfulCount || 0})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RatingSystem;
