import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Star, ArrowLeft, MessageSquare } from "lucide-react";
import { reviewAPI } from "../../services/api";
import Loading from "../../components/Loading";
import { showToast } from "../../helpers/showToast";

const EscortReviews = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
  });

  useEffect(() => {
    if (!user.user || user.user.role !== "escort") {
      showToast("Access denied. Escort profile required.", "error");
      navigate("/");
      return;
    }

    fetchReviews();
  }, [user, navigate]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getEscortReviews(user.user._id);

      if (response.data && response.data.data) {
        const reviewsData = response.data.data.reviews || [];
        setReviews(reviewsData);

        // Calculate stats
        const totalReviews = reviewsData.length;
        const averageRating =
          totalReviews > 0
            ? reviewsData.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            : 0;

        setStats({
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
        });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      showToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/ug/escort/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reviews & Ratings
        </h1>
        <p className="text-gray-600">
          See what clients are saying about your services
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(stats.averageRating))}
            <div className="text-sm text-gray-600 mt-2">Average Rating</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalReviews}
            </div>
            <MessageSquare className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-sm text-gray-600">Total Reviews</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.totalReviews > 0 ? "100%" : "0%"}
            </div>
            <Star className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            All Reviews ({stats.totalReviews})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Reviews Yet
              </h3>
              <p className="text-gray-600">
                Reviews from your clients will appear here once they leave
                feedback.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/anonymous-avatar.png" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Anonymous Client
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {renderStars(review.rating)}
                            <span>•</span>
                            <span>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EscortReviews;
