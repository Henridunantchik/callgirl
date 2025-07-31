import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7d");

  const stats = {
    totalUsers: 15420,
    activeEscorts: 892,
    totalBookings: 3456,
    totalRevenue: 125000,
    avgRating: 4.6,
    conversionRate: 12.5,
    avgSessionTime: 8.5,
    bounceRate: 23.4,
  };

  const topLocations = [
    { city: "New York", users: 1250, bookings: 456, revenue: 45000 },
    { city: "Los Angeles", users: 980, bookings: 342, revenue: 32000 },
    { city: "Chicago", users: 750, bookings: 234, revenue: 18000 },
    { city: "Miami", users: 620, bookings: 189, revenue: 15000 },
    { city: "Las Vegas", users: 580, bookings: 167, revenue: 12000 },
  ];

  const userGrowth = [
    { month: "Jan", users: 1200, escorts: 80 },
    { month: "Feb", users: 1350, escorts: 95 },
    { month: "Mar", users: 1520, escorts: 110 },
    { month: "Apr", users: 1680, escorts: 125 },
    { month: "May", users: 1820, escorts: 140 },
    { month: "Jun", users: 1980, escorts: 155 },
  ];

  const topEscorts = [
    {
      name: "Sarah Johnson",
      views: 1250,
      bookings: 45,
      rating: 4.9,
      revenue: 8500,
    },
    {
      name: "Emma Davis",
      views: 980,
      bookings: 38,
      rating: 4.8,
      revenue: 7200,
    },
    {
      name: "Jessica Smith",
      views: 890,
      bookings: 32,
      rating: 4.7,
      revenue: 6500,
    },
    {
      name: "Amanda Wilson",
      views: 750,
      bookings: 28,
      rating: 4.6,
      revenue: 5200,
    },
    {
      name: "Rachel Brown",
      views: 680,
      bookings: 25,
      rating: 4.5,
      revenue: 4800,
    },
  ];

  const getGrowthIndicator = (current, previous) => {
    const growth = ((current - previous) / previous) * 100;
    return {
      value: growth,
      isPositive: growth > 0,
      icon:
        growth > 0 ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        ),
    };
  };

  return (
    <>
      <Helmet>
        <title>Analytics - Call Girls</title>
        <meta
          name="description"
          content="Platform analytics and performance metrics."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analytics
              </h1>
              <p className="text-gray-600">
                Platform performance and user behavior insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    +12.5%
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Escorts</p>
                  <p className="text-2xl font-bold">{stats.activeEscorts}</p>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    +8.3%
                  </div>
                </div>
                <Heart className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    +15.2%
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avgRating}</p>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    +0.2
                  </div>
                </div>
                <Eye className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      User growth chart will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topLocations.map((location, index) => (
                      <div
                        key={location.city}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{location.city}</p>
                            <p className="text-sm text-gray-600">
                              {location.users} users
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${location.revenue.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {location.bookings} bookings
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      User demographics chart will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Escorts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topEscorts.map((escort, index) => (
                      <div
                        key={escort.name}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-purple-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{escort.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{escort.views} views</span>
                              <span>•</span>
                              <span>{escort.bookings} bookings</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">
                              {escort.rating}
                            </span>
                            <span className="text-yellow-500">★</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            ${escort.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      Revenue trends chart will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">Bookings</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        $98,500
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">Subscriptions</span>
                      </div>
                      <span className="font-semibold text-blue-600">
                        $18,200
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold">Featured Listings</span>
                      </div>
                      <span className="font-semibold text-purple-600">
                        $8,300
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span>Conversion Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {stats.conversionRate}%
                        </span>
                        <Badge className="bg-green-100 text-green-800">
                          +2.1%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Session Time</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {stats.avgSessionTime}m
                        </span>
                        <Badge className="bg-green-100 text-green-800">
                          +0.5m
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Bounce Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {stats.bounceRate}%
                        </span>
                        <Badge className="bg-red-100 text-red-800">-1.2%</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Page Load Time</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">1.8s</span>
                        <Badge className="bg-green-100 text-green-800">
                          -0.3s
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">
                      Real-time activity chart will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Analytics;
