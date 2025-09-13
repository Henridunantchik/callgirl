import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import { userAPI, statsAPI } from "../../services/api";
import { showToast } from "../../helpers/showToast";
import Loading from "../../components/Loading";

const UserManagement = () => {
  const navigate = useNavigate();
  const { countryCode } = useParams();

  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    suspendedUsers: 0,
  });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Sort states
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("👥 Fetching users data...");

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter !== "all" ? statusFilter : undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        sortBy: sortField,
        sortOrder: sortOrder,
      };

      const response = await userAPI.getAllUsers(params);

      if (response.data?.data) {
        const userData = response.data.data;
        setUsers(userData.users || []);
        setTotalPages(Math.ceil((userData.total || 0) / itemsPerPage));

        // Update stats
        setStats({
          totalUsers: userData.total || 0,
          activeUsers: userData.activeUsers || 0,
          verifiedUsers: userData.verifiedUsers || 0,
          suspendedUsers: userData.suspendedUsers || 0,
        });
      }

      console.log("👥 Users data loaded successfully");
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("error", "Failed to load users data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const response = await statsAPI.getUserStats();
      if (response.data?.data) {
        const statsData = response.data.data;
        setStats((prev) => ({
          ...prev,
          totalUsers: statsData.totalUsers || prev.totalUsers,
          activeUsers: statsData.activeUsers || prev.activeUsers,
          verifiedUsers: statsData.verifiedUsers || prev.verifiedUsers,
          suspendedUsers: statsData.suspendedUsers || prev.suspendedUsers,
        }));
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // User management actions
  const handleSuspendUser = async (userId) => {
    try {
      await userAPI.suspendUser(userId);
      showToast("success", "User suspended successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error suspending user:", error);
      showToast("error", "Failed to suspend user");
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await userAPI.activateUser(userId);
      showToast("success", "User activated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error activating user:", error);
      showToast("error", "Failed to activate user");
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await userAPI.verifyUser(userId);
      showToast("success", "User verified successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error verifying user:", error);
      showToast("error", "Failed to verify user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await userAPI.deleteUser(userId);
        showToast("success", "User deleted successfully");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        showToast("error", "Failed to delete user");
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchUserStats()]);
    setRefreshing(false);
    showToast("success", "Data refreshed");
  };

  // Handle search and filter changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Sort handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, roleFilter, sortField, sortOrder]);

  // Load stats on component mount
  useEffect(() => {
    fetchUserStats();
  }, []);

  if (loading) return <Loading />;

  const getStatusBadge = (status) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      banned: "bg-gray-100 text-gray-800",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getRoleBadge = (role) => {
    const variants = {
      escort: "bg-purple-100 text-purple-800",
      client: "bg-blue-100 text-blue-800",
      admin: "bg-orange-100 text-orange-800",
    };
    return <Badge className={variants[role]}>{role}</Badge>;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <>
      <Helmet>
        <title>User Management - Call Girls</title>
        <meta
          name="description"
          content="Manage platform users and accounts."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                User Management
              </h1>
              <p className="text-gray-600">
                Manage all platform users, escorts, clients, and administrators
              </p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <UserCheck className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">
                {stats.activeUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">
                {stats.verifiedUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Verified Users</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <UserX className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">
                {stats.suspendedUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Suspended Users</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="escort">Escorts</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        User
                        {sortField === "name" && (
                          <span className="text-xs">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center gap-2">
                        Role
                        {sortField === "role" && (
                          <span className="text-xs">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortField === "status" && (
                          <span className="text-xs">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("verified")}
                    >
                      <div className="flex items-center gap-2">
                        Verified
                        {sortField === "verified" && (
                          <span className="text-xs">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-2">
                        Joined
                        {sortField === "createdAt" && (
                          <span className="text-xs">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("lastActive")}
                    >
                      <div className="flex items-center gap-2">
                        Last Active
                        {sortField === "lastActive" && (
                          <span className="text-xs">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr
                        key={user._id || user.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-semibold">
                              {user.name || user.alias || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{getRoleBadge(user.role)}</td>
                        <td className="p-4">
                          {getStatusBadge(user.status || "active")}
                        </td>
                        <td className="p-4">
                          {user.verified ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {user.lastActive || "Never"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `/${countryCode || "ug"}/admin/users/${
                                    user._id || user.id
                                  }`
                                )
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `/${countryCode || "ug"}/admin/users/${
                                    user._id || user.id
                                  }/edit`
                                )
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {user.role !== "admin" && (
                              <>
                                {user.status === "active" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() =>
                                      handleSuspendUser(user._id || user.id)
                                    }
                                  >
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() =>
                                      handleActivateUser(user._id || user.id)
                                    }
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                )}
                                {!user.verified && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() =>
                                      handleVerifyUser(user._id || user.id)
                                    }
                                  >
                                    <Shield className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() =>
                                    handleDeleteUser(user._id || user.id)
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No users found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, users.length)} of{" "}
                  {users.length} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UserManagement;
