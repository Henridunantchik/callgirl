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
} from "lucide-react";
import { escortAPI } from "../../services/api";
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
          console.log("Stats response success:", statsResponse.data.success);
          console.log("Stats data:", statsResponse.data.stats);
        } catch (statsError) {
          console.error("Error fetching stats:", statsError);
          console.log("Using fallback stats from user data");
          // Use fallback stats from escort data
          setStats({
            profileViews: user.user?.stats?.profileViews || 0,
            messages: 0,
            bookings: 0,
            rating: user.user?.stats?.averageRating || 0,
            earnings: 0,
          });
          setEscortData(user.user);
          setLoading(false);
          return;
        }

        // Fetch recent bookings (placeholder for now)
        const bookingsResponse = await fetch("/api/booking/escort", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setRecentBookings(bookingsData.bookings || []);
        }

        // Set stats from API response
        if (statsResponse && statsResponse.data.success) {
          const apiStats = statsResponse.data.stats;
          setStats({
            profileViews: apiStats.profileViews || 0,
            messages: apiStats.messages || 0,
            bookings: apiStats.bookings || 0,
            rating: apiStats.averageRating || 0,
            earnings: apiStats.earnings || 0,
          });
        } else {
          console.log("Using fallback stats");
          // Use fallback stats from escort data
          setStats({
            profileViews: user.user?.stats?.profileViews || 0,
            messages: 0,
            bookings: 0,
            rating: user.user?.stats?.averageRating || 0,
            earnings: 0,
          });
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
                  onClick={() => navigate("/profile")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate("/escort/availability")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate("/messages")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View Messages
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate("/escort/earnings")}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Earnings Report
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => navigate("/settings")}
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
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <div
                        key={booking._id || booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {booking.clientName || booking.client}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.date).toLocaleDateString()} at{" "}
                              {booking.time} ({booking.duration})
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            ${booking.amount}
                          </div>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : "outline"
                            }
                            className={
                              booking.status === "confirmed"
                                ? "bg-green-500"
                                : ""
                            }
                          >
                            {booking.status}
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

        {/* Performance Chart */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  Performance chart will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EscortDashboard;
