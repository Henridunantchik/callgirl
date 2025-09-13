import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Settings,
  FileText,
  MessageCircle,
  RefreshCw,
  Calendar,
  Eye,
  Heart,
} from "lucide-react";
import {
  statsAPI,
  userAPI,
  escortAPI,
  bookingAPI,
  upgradeAPI,
} from "../../services/api";
import { showToast } from "../../helpers/showToast";
import Loading from "../../components/Loading";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { countryCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEscorts: 0,
    totalRevenue: 0,
    pendingReports: 0,
    activeBookings: 0,
    newUsers: 0,
    uptime: 99.9,
  });

  const [recentReports, setRecentReports] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    uptime: 99.9,
    activeBookings: 0,
    newUsersToday: 0,
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("📊 Fetching admin dashboard data...");

      // Fetch all stats in parallel
      const [globalStats, userStats, escortStats, upgradeStats, bookingStats] =
        await Promise.allSettled([
          statsAPI.getGlobalStats(),
          statsAPI.getUserStats(),
          statsAPI.getEscortStats(),
          upgradeAPI.getStats(),
          bookingAPI.getStats?.() ||
            Promise.resolve({ data: { data: { activeBookings: 0 } } }),
        ]);

      // Process global stats
      if (globalStats.status === "fulfilled" && globalStats.value?.data?.data) {
        const globalData = globalStats.value.data.data;
        setStats((prev) => ({
          ...prev,
          totalUsers: globalData.totalUsers || 0,
          totalEscorts: globalData.totalEscorts || 0,
          totalRevenue: globalData.totalRevenue || 0,
          newUsers: globalData.newUsersToday || 0,
        }));
      }

      // Process user stats
      if (userStats.status === "fulfilled" && userStats.value?.data?.data) {
        const userData = userStats.value.data.data;
        setStats((prev) => ({
          ...prev,
          totalUsers: userData.totalUsers || prev.totalUsers,
          newUsers: userData.newUsersToday || prev.newUsers,
        }));
      }

      // Process escort stats
      if (escortStats.status === "fulfilled" && escortStats.value?.data?.data) {
        const escortData = escortStats.value.data.data;
        setStats((prev) => ({
          ...prev,
          totalEscorts: escortData.totalEscorts || prev.totalEscorts,
        }));
      }

      // Process upgrade stats
      if (
        upgradeStats.status === "fulfilled" &&
        upgradeStats.value?.data?.data
      ) {
        const upgradeData = upgradeStats.value.data.data;
        setStats((prev) => ({
          ...prev,
          pendingReports: upgradeData.pendingRequests || 0,
          totalRevenue: upgradeData.totalRevenue || prev.totalRevenue,
        }));
      }

      // Process booking stats
      if (
        bookingStats.status === "fulfilled" &&
        bookingStats.value?.data?.data
      ) {
        const bookingData = bookingStats.value.data.data;
        setStats((prev) => ({
          ...prev,
          activeBookings: bookingData.activeBookings || 0,
        }));
        setSystemStatus((prev) => ({
          ...prev,
          activeBookings: bookingData.activeBookings || 0,
        }));
      }

      // Fetch recent reports (upgrade requests as reports)
      try {
        const reportsResponse = await upgradeAPI.getAllRequests({
          limit: 5,
          status: "pending",
        });
        if (reportsResponse.data?.data?.requests) {
          const reports = reportsResponse.data.data.requests.map(
            (request, index) => ({
              id: request._id || index,
              type: "Upgrade Request",
              user: request.escortName || "Unknown User",
              status: request.status || "pending",
              date: request.createdAt
                ? new Date(request.createdAt).toLocaleString()
                : "Unknown",
            })
          );
          setRecentReports(reports);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        setRecentReports([]);
      }

      // Set system status
      setSystemStatus((prev) => ({
        ...prev,
        newUsersToday: stats.newUsers,
      }));

      console.log("📊 Dashboard data loaded successfully");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast("error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    showToast("success", "Dashboard refreshed");
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Call Girls</title>
        <meta
          name="description"
          content="Platform administration and management."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Platform overview and management</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.totalEscorts}</div>
              <div className="text-sm text-gray-600">Active Escorts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
              <div className="text-sm text-gray-600">Pending Reports</div>
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
                  onClick={() =>
                    navigate(`/${countryCode || "ug"}/admin/users`)
                  }
                >
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    navigate(`/${countryCode || "ug"}/admin/analytics`)
                  }
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Reports & Analytics
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    navigate(`/${countryCode || "ug"}/admin/upgrade-requests`)
                  }
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Upgrade Requests
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Reports</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/${countryCode || "ug"}/admin/upgrade-requests`)
                    }
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.length > 0 ? (
                    recentReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{report.type}</h3>
                            <p className="text-sm text-gray-600">
                              Requested by {report.user}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              report.status === "pending"
                                ? "outline"
                                : "default"
                            }
                            className={
                              report.status === "investigating"
                                ? "bg-yellow-500"
                                : report.status === "approved"
                                ? "bg-green-500"
                                : report.status === "rejected"
                                ? "bg-red-500"
                                : ""
                            }
                          >
                            {report.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {report.date}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent reports</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {systemStatus.uptime}%
                  </div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {systemStatus.activeBookings}
                  </div>
                  <div className="text-sm text-gray-600">Active Bookings</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {systemStatus.newUsersToday}
                  </div>
                  <div className="text-sm text-gray-600">New Users Today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
