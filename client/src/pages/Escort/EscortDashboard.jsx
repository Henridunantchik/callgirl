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
import { Badge } from "../../components/ui/badge";
import {
  User,
  MessageCircle,
  Calendar,
  Star,
  DollarSign,
  Eye,
  TrendingUp,
  Settings,
  Heart,
  MessageSquare,
} from "lucide-react";
import { escortAPI, bookingAPI } from "../../services/api";
import Loading from "../../components/Loading";
import { showToast } from "../../helpers/showToast";

const EscortDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    profileViews: 0,
    messages: 0,
    bookings: 0,
    favorites: 0,
    reviews: 0,
    rating: 0,
    earnings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [escortData, setEscortData] = useState(null);

  // Fetch escort data and stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log("=== ESCORT DASHBOARD DEBUG ===");
        console.log("User:", user);

        if (!user.user || user.user.role !== "escort") {
          showToast("Access denied. Escort profile required.", "error");
          navigate("/");
          return;
        }

        // Fetch escort stats
        console.log("Fetching stats for user ID:", user.user._id);
        let statsResponse;
        try {
          statsResponse = await escortAPI.getEscortStats(user.user._id);
          console.log("Stats response:", statsResponse.data);

          if (
            statsResponse.data &&
            statsResponse.data.data &&
            statsResponse.data.data.stats
          ) {
            const apiStats = statsResponse.data.data.stats;
            setStats({
              profileViews: apiStats.profileViews || 0,
              messages: apiStats.messages || 0,
              bookings: apiStats.bookings || 0,
              favorites: apiStats.favorites || 0,
              reviews: apiStats.reviews || 0,
              rating: apiStats.rating || 0,
              earnings: apiStats.earnings || 0,
            });
          } else {
            console.log("No stats data in response, using fallback");
            setStats({
              profileViews: user.user?.stats?.profileViews || 0,
              messages: 0,
              bookings: 0,
              favorites: 0,
              reviews: 0,
              rating: user.user?.stats?.averageRating || 0,
              earnings: 0,
            });
          }
        } catch (statsError) {
          console.error("Error fetching stats:", statsError);
          console.log("Using fallback stats from user data");
          // Use fallback stats from escort data
          setStats({
            profileViews: user.user?.stats?.profileViews || 0,
            messages: 0,
            bookings: 0,
            favorites: 0,
            reviews: 0,
            rating: user.user?.stats?.averageRating || 0,
            earnings: 0,
          });
        }

        // Fetch recent bookings
        try {
          const bookingsResponse = await bookingAPI.getEscortBookings();
          if (bookingsResponse.data && bookingsResponse.data.data) {
            // Get only recent bookings (last 5)
            const recentBookingsData = bookingsResponse.data.data.slice(0, 5);
            setRecentBookings(recentBookingsData);
          }
        } catch (bookingsError) {
          console.error("Error fetching recent bookings:", bookingsError);
          setRecentBookings([]);
        }

        setEscortData(user.user);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showToast("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  if (loading) return <Loading />;

  // Error boundary for any remaining issues
  if (!escortData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Loading Dashboard...
          </h1>
          <p className="text-gray-600">
            Please wait while we load your dashboard data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {escortData?.alias || escortData?.name || "Escort"}!
          </h1>
          <p className="text-gray-600">
            Manage your profile and track your success
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">
                {stats.profileViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Profile Views</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.messages}</div>
              <div className="text-sm text-gray-600">Messages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{stats.bookings}</div>
              <div className="text-sm text-gray-600">Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{stats.favorites}</div>
              <div className="text-sm text-gray-600">Favorites</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.reviews}</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.rating}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">${stats.earnings}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/ug/escort/profile`)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/ug/escort/availability`)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/ug/escort/messages`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View Messages
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/ug/escort/reviews`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Reviews
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/ug/escort/earnings`)}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Earnings Report
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate(`/ug/escort/settings`)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/ug/escort/bookings`)}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <div
                        key={booking._id || booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {booking.clientName
                              ? booking.clientName.charAt(0).toUpperCase()
                              : "C"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {booking.clientName || booking.client || "Client"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(
                                booking.date || booking.createdAt
                              ).toLocaleDateString()}{" "}
                              at {booking.time || "TBD"} (
                              {booking.duration || "1 hour"})
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.location || "Location TBD"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            ${booking.amount || booking.totalAmount || 0}
                          </div>
                          <Badge
                            variant={
                              booking.status === "confirmed" ||
                              booking.status === "completed"
                                ? "default"
                                : "outline"
                            }
                            className={
                              booking.status === "confirmed" ||
                              booking.status === "completed"
                                ? "bg-green-500 text-white"
                                : booking.status === "pending"
                                ? "bg-yellow-500 text-white"
                                : booking.status === "cancelled"
                                ? "bg-red-500 text-white"
                                : "bg-gray-500 text-white"
                            }
                          >
                            {booking.status || "pending"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent bookings</p>
                      <p className="text-sm">
                        Bookings will appear here when clients make reservations
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Weekly Performance */}
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    This Week
                  </h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.bookings > 0 ? Math.floor(stats.bookings / 4) : 0}
                  </div>
                  <p className="text-sm text-blue-600">Bookings</p>
                </div>

                {/* Monthly Performance */}
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    This Month
                  </h3>
                  <div className="text-2xl font-bold text-green-600">
                    ${stats.earnings}
                  </div>
                  <p className="text-sm text-green-600">Earnings</p>
                </div>

                {/* Average Rating */}
                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Rating</h3>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.rating > 0 ? stats.rating : "N/A"}
                  </div>
                  <p className="text-sm text-yellow-600">Average</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">
                    {stats.profileViews}
                  </div>
                  <p className="text-xs text-gray-500">Profile Views</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">
                    {stats.messages}
                  </div>
                  <p className="text-xs text-gray-500">Messages</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">
                    {stats.favorites}
                  </div>
                  <p className="text-xs text-gray-500">Favorites</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">
                    {stats.reviews}
                  </div>
                  <p className="text-xs text-gray-500">Reviews</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">
                    {recentBookings.length}
                  </div>
                  <p className="text-xs text-gray-500">Recent Bookings</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-700">
                    {stats.rating > 0
                      ? "⭐".repeat(Math.floor(stats.rating))
                      : "N/A"}
                  </div>
                  <p className="text-xs text-gray-500">Stars</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EscortDashboard;
