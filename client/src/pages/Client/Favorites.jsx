import React from "react";
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
  Star,
  MapPin,
  MessageCircle,
  Phone,
  Trash2,
} from "lucide-react";

const Favorites = () => {
  const favorites = [
    {
      id: 1,
      name: "Sophia",
      location: "New York",
      rating: 4.8,
      price: 300,
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop",
      isOnline: true,
    },
    {
      id: 2,
      name: "Bella",
      location: "Los Angeles",
      rating: 4.9,
      price: 400,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
      isOnline: false,
    },
  ];

  return (
    <>
      <Helmet>
        <title>My Favorites - Call Girls</title>
        <meta
          name="description"
          content="Manage your favorite escorts and quick access to their profiles."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Favorites
          </h1>
          <p className="text-gray-600">
            Your saved escorts and quick access to their profiles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Saved Escorts ({favorites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((escort) => (
                <div
                  key={escort.id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={escort.image}
                      alt={escort.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 hover:bg-white text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {escort.isOnline && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-green-500 text-white">
                          Online
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{escort.name}</h3>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        {escort.rating}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-3 h-3" />
                      {escort.location}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-green-600">
                        ${escort.price}/hr
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Favorites;
