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
import {
  Heart,
  Star,
  MapPin,
  MessageCircle,
  Phone,
  Trash2,
  Loader2,
  User,
} from "lucide-react";
import { favoriteAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { showToast } from "../../helpers/showToast";
import Loading from "../../components/Loading";

const Favorites = () => {
  const navigate = useNavigate();
  const { countryCode } = useParams();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      // Fast response target: 2s timeout, no batching for snappier UX
      const response = await favoriteAPI.getUserFavorites({
        timeout: 2000,
        batch: false,
      });
      if (response.data && response.data.data) {
        setFavorites(response.data.data.favorites || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      // Gracefully fallback to empty on timeout or not found
      if (error.code === "ECONNABORTED" || error?.response?.status === 404) {
        setFavorites([]);
      } else {
        showToast("error", "Failed to load favorites");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (escortId) => {
    try {
      setRemoving(escortId);
      await favoriteAPI.removeFromFavorites(escortId);
      setFavorites((prev) => prev.filter((fav) => fav.escort._id !== escortId));
      showToast("success", "Removed from favorites");
    } catch (error) {
      console.error("Error removing from favorites:", error);
      showToast("error", "Failed to remove from favorites");
    } finally {
      setRemoving(null);
    }
  };

  const handleMessage = (escortId) => {
    navigate(`/${countryCode || "ug"}/client/messages?escort=${escortId}`);
  };

  const handleViewProfile = (escortId) => {
    navigate(`/${countryCode || "ug"}/escort/${escortId}`);
  };

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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading favorites...</span>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No favorites yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start exploring and add escorts to your favorites
                </p>
                <Button onClick={() => navigate("/ug")}>Browse Escorts</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => {
                  const escort = favorite.escort;
                  return (
                    <div
                      key={escort._id}
                      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={
                            escort.avatar ||
                            escort.gallery?.[0]?.url ||
                            "/default-avatar.jpg"
                          }
                          alt={escort.name || escort.alias}
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            e.target.src = "/default-avatar.jpg";
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="bg-white/80 hover:bg-white text-red-500"
                            onClick={() => removeFromFavorites(escort._id)}
                            disabled={removing === escort._id}
                          >
                            {removing === escort._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {escort.isOnline && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-green-500 text-white">
                              Online
                            </Badge>
                          </div>
                        )}
                        {escort.isVerified && (
                          <div className="absolute top-3 left-12">
                            <Badge className="bg-blue-500 text-white">
                              Verified
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                            onClick={() => handleViewProfile(escort._id)}
                          >
                            {escort.name || escort.alias}
                          </h3>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" />
                            {escort.rating || "N/A"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <MapPin className="w-3 h-3" />
                          {escort.location?.city || "Location TBD"}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-green-600">
                            ${escort.rates?.hourly || 0}/hr
                          </span>
                          <span className="text-sm text-gray-500">
                            Age: {escort.age || "N/A"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleMessage(escort._id)}
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Message
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewProfile(escort._id)}
                          >
                            <User className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Favorites;
