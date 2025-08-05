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
  Heart,
  MessageCircle,
  Calendar,
  Star,
  MapPin,
  Search,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";

const ClientDashboard = () => {
  const [recentActivity] = useState([
    {
      id: 1,
      type: "favorite",
      escort: "Sophia",
      time: "2 hours ago",
      action: "Added to favorites",
    },
    {
      id: 2,
      type: "message",
      escort: "Bella",
      time: "1 day ago",
      action: "Sent a message",
    },
    {
      id: 3,
      type: "view",
      escort: "Emma",
      time: "2 days ago",
      action: "Viewed profile",
    },
  ]);

  const [favorites] = useState([
    {
      id: 1,
      name: "Sophia",
      location: "New York",
      rating: 4.8,
      price: 300,
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop",
    },
    {
      id: 2,
      name: "Bella",
      location: "Los Angeles",
      rating: 4.9,
      price: 400,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    },
  ]);

  return (
    <>
      <Helmet>
        <title>Client Dashboard - Call Girls</title>
        <meta
          name="description"
          content="Manage your escort directory experience and preferences."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600">
            Manage your preferences and track your activity
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{favorites.length}</div>
              <div className="text-sm text-gray-600">Favorites</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-gray-600">Messages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-gray-600">Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">8</div>
              <div className="text-sm text-gray-600">Reviews</div>
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
                <Button className="w-full" variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Escorts
                </Button>
                <Button className="w-full" variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  View Favorites
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  My Bookings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {activity.type === "favorite" && (
                          <Heart className="w-4 h-4 text-red-500" />
                        )}
                        {activity.type === "message" && (
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                        )}
                        {activity.type === "view" && (
                          <Users className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600">
                          {activity.escort}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((escort) => (
                  <div
                    key={escort.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <img
                      src={escort.image}
                      alt={escort.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{escort.name}</h3>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Star className="w-3 h-3" />
                          {escort.rating}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        {escort.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-green-600">
                          ${escort.price}/hr
                        </span>
                        <Button size="sm">Contact</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Based on your preferences and recent activity, here are some
                escorts you might like:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <h4 className="font-semibold">
                          Recommended Escort {i}
                        </h4>
                        <p className="text-sm text-gray-600">New York</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">$300/hr</span>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ClientDashboard;
