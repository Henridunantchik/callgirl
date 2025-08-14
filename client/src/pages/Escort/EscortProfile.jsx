import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  Clock,
  Heart,
  MessageCircle,
  Star,
  Camera,
  Eye,
  Users,
  Clock as ClockIcon,
  Globe,
  Award,
  Zap,
} from "lucide-react";
import { escortAPI } from "../../services/api";
import { showToast } from "../../helpers/showToast";
import { useAuth } from "../../contexts/AuthContext";
import { RouteSignIn } from "../../helpers/RouteName";

const EscortProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [escort, setEscort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("photos");

  useEffect(() => {
    fetchEscortProfile();
  }, [slug]);

  const fetchEscortProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!slug || slug === "undefined") {
        throw new Error("Invalid escort identifier");
      }

      console.log("🔍 Fetching escort profile for slug:", slug);

      // Decode URL if needed
      const decodedSlug = decodeURIComponent(slug);
      console.log("🔍 Decoded slug:", decodedSlug);

      const response = await escortAPI.getEscortProfile(decodedSlug);
      console.log("✅ Escort profile fetched:", response.data);
      console.log("🔍 Response structure:", {
        hasData: !!response.data,
        hasEscort: !!response.data?.escort,
        hasDataData: !!response.data?.data,
        hasDataDataEscort: !!response.data?.data?.escort,
        escortData:
          response.data?.escort || response.data?.data?.escort || response.data,
      });

      if (response.data && response.data.escort) {
        console.log("✅ Setting escort from response.data.escort");
        setEscort(response.data.escort);
      } else if (
        response.data &&
        response.data.data &&
        response.data.data.escort
      ) {
        console.log("✅ Setting escort from response.data.data.escort");
        setEscort(response.data.data.escort);
      } else if (response.data) {
        console.log("✅ Setting escort from response.data");
        setEscort(response.data);
      } else {
        console.log("❌ No valid data found in response");
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Failed to fetch escort profile:", error);

      let errorMessage = "Failed to load escort profile";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes("Cast to ObjectId failed")) {
        errorMessage = "Invalid escort profile identifier";
      } else if (error.message.includes("Invalid escort identifier")) {
        errorMessage = "Invalid escort profile identifier";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      showToast("error", "Please log in to contact this escort");
      navigate(RouteSignIn);
      return;
    }

    showToast("success", "Contact feature coming soon!");
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    showToast(
      "success",
      isFavorite ? "Removed from favorites" : "Added to favorites"
    );
  };

  const handleCall = () => {
    if (escort.phone) {
      window.open(`tel:${escort.phone}`, "_blank");
    }
  };

  // Debug log
  console.log("🔍 EscortProfile render state:", {
    loading,
    error,
    escort: escort ? "Present" : "Null",
    escortName: escort?.name,
    escortAlias: escort?.alias,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!escort) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">
              This escort profile could not be found.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simple debug - show escort data if available
  console.log("🎯 RENDERING PROFILE - Escort data:", escort);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* DEBUG INFO - Remove this later */}
      {escort && (
        <div className="bg-red-100 p-4 text-red-800 text-sm">
          <strong>DEBUG:</strong> Escort loaded: {escort.name} ({escort.alias})
          - Age: {escort.age} - Phone: {escort.phone}
        </div>
      )}

      {/* Cover Photo */}
      <div className="relative h-80 bg-gradient-to-r from-purple-500 to-pink-500">
        {escort.gallery && escort.gallery.length > 0 ? (
          <img
            src={escort.gallery[0].url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Camera className="h-16 w-16 text-white/50" />
          </div>
        )}

        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
        >
          ← Back
        </Button>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFavorite}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </Button>
      </div>

      {/* Profile Info Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        {/* Avatar and Basic Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={
                  escort.avatar ||
                  escort.gallery?.[0]?.url ||
                  "/default-escort.jpg"
                }
                alt={escort.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {escort.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {escort.name}
                    {escort.alias && escort.alias !== escort.name && (
                      <span className="text-xl text-gray-600 ml-2 font-normal">
                        ({escort.alias})
                      </span>
                    )}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    {escort.location?.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{escort.location.city}</span>
                      </div>
                    )}

                    {escort.age && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{escort.age} years old</span>
                      </div>
                    )}

                    {escort.stats?.views && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{escort.stats.views} views</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {escort.subscriptionTier &&
                      escort.subscriptionTier !== "free" && (
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {escort.subscriptionTier}
                        </Badge>
                      )}

                    {escort.isVerified && (
                      <Badge
                        variant="secondary"
                        className="bg-green-500 text-white"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}

                    {escort.isAgeVerified && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-500 text-white"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Age Verified
                      </Badge>
                    )}

                    {escort.isAvailable && (
                      <Badge
                        variant="secondary"
                        className="bg-green-500 text-white"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    )}

                    {escort.subscriptionStatus && (
                      <Badge
                        variant="secondary"
                        className="bg-purple-500 text-white"
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {escort.subscriptionStatus}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleCall}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    size="lg"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {escort.phone || "Call"}
                  </Button>

                  <Button onClick={handleContact} variant="outline" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {["photos", "about", "services", "rates"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Photos Tab */}
            {activeTab === "photos" && (
              <div className="space-y-8">
                {/* Gallery Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Photos</h3>
                  {escort.gallery && escort.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {escort.gallery.map((photo, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer"
                        >
                          <img
                            src={photo.url}
                            alt={`${escort.name} - Photo ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Eye className="h-8 w-8 text-white" />
                          </div>
                          {photo.caption && (
                            <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-1 rounded">
                              {photo.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No photos available</p>
                    </div>
                  )}
                </div>

                {/* Videos Section */}
                {escort.videos && escort.videos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Videos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {escort.videos.map((video, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer"
                        >
                          <video
                            src={video.url}
                            className="w-full h-48 object-cover rounded-lg"
                            poster={video.thumbnail}
                            controls
                          />
                          {video.caption && (
                            <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-1 rounded">
                              {video.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === "about" && (
              <div className="space-y-6">
                {/* Bio Section */}
                {escort.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {escort.bio}
                    </p>
                  </div>
                )}

                {/* Physical Characteristics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {escort.bodyType && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Body Type
                      </h4>
                      <p className="text-gray-600">{escort.bodyType}</p>
                    </div>
                  )}

                  {escort.ethnicity && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Ethnicity
                      </h4>
                      <p className="text-gray-600">{escort.ethnicity}</p>
                    </div>
                  )}

                  {escort.height && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Height</h4>
                      <p className="text-gray-600">{escort.height}cm</p>
                    </div>
                  )}

                  {escort.weight && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Weight</h4>
                      <p className="text-gray-600">{escort.weight}kg</p>
                    </div>
                  )}

                  {escort.hairColor && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Hair Color
                      </h4>
                      <p className="text-gray-600">{escort.hairColor}</p>
                    </div>
                  )}

                  {escort.eyeColor && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Eye Color
                      </h4>
                      <p className="text-gray-600">{escort.eyeColor}</p>
                    </div>
                  )}

                  {escort.experience && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Experience
                      </h4>
                      <p className="text-gray-600">{escort.experience}</p>
                    </div>
                  )}

                  {escort.gender && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Gender</h4>
                      <p className="text-gray-600 capitalize">
                        {escort.gender}
                      </p>
                    </div>
                  )}
                </div>

                {/* Languages */}
                {escort.languages && escort.languages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {escort.languages.map((lang, index) => (
                        <Badge key={index} variant="outline">
                          <Globe className="h-3 w-3 mr-1" />
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Working Hours */}
                {escort.workingHours && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Working Hours
                    </h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {escort.workingHours.start} - {escort.workingHours.end}
                      </span>
                    </div>
                  </div>
                )}

                {/* Availability */}
                {escort.availability && escort.availability.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Available Days
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {escort.availability.map((day, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="capitalize"
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                {escort.stats && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Profile Stats
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {escort.stats.views !== undefined && (
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {escort.stats.views}
                          </div>
                          <div className="text-sm text-gray-600">Views</div>
                        </div>
                      )}
                      {escort.stats.favorites !== undefined && (
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {escort.stats.favorites}
                          </div>
                          <div className="text-sm text-gray-600">Favorites</div>
                        </div>
                      )}
                      {escort.stats.reviews !== undefined && (
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {escort.stats.reviews}
                          </div>
                          <div className="text-sm text-gray-600">Reviews</div>
                        </div>
                      )}
                      {escort.stats.rating !== undefined &&
                        escort.stats.rating > 0 && (
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">
                              {escort.stats.rating}
                            </div>
                            <div className="text-sm text-gray-600">Rating</div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Last Seen */}
                {escort.lastSeen && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Last Active
                    </h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        {new Date(escort.lastSeen).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Profile Completion */}
                {escort.profileCompletion !== undefined && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Profile Completion
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${escort.profileCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {escort.profileCompletion}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Subscription Benefits */}
                {escort.benefits && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Subscription Benefits
                    </h4>
                    <div className="space-y-3">
                      {escort.benefits.photos && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Photos Limit</span>
                          <span className="font-semibold text-blue-600">
                            {escort.benefits.photos}
                          </span>
                        </div>
                      )}
                      {escort.benefits.videos && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">Videos Limit</span>
                          <span className="font-semibold text-blue-600">
                            {escort.benefits.videos}
                          </span>
                        </div>
                      )}
                      {escort.benefits.features &&
                        escort.benefits.features.length > 0 && (
                          <div>
                            <span className="text-gray-700 mb-2 block">
                              Features:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {escort.benefits.features.map(
                                (feature, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {feature}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div>
                {escort.services && escort.services.length > 0 ? (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Available Services
                      </h3>
                      <p className="text-gray-600">
                        Total: {escort.services.length} services
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {escort.services.map((service, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-500 rounded-full p-2">
                              <Zap className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-800">
                              {service}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No services listed</p>
                  </div>
                )}
              </div>
            )}

            {/* Rates Tab */}
            {activeTab === "rates" && (
              <div>
                {escort.rates ? (
                  <div className="space-y-4">
                    {escort.rates.hourly && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Hourly Rate
                            </h4>
                            <p className="text-gray-600">Per hour</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              ${escort.rates.hourly}
                            </div>
                            <div className="text-sm text-gray-500">
                              {escort.rates.currency || "USD"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {escort.rates.overnight && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Overnight
                            </h4>
                            <p className="text-gray-600">Full night</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              ${escort.rates.overnight}
                            </div>
                            <div className="text-sm text-gray-500">
                              {escort.rates.currency || "USD"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Rates not specified</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Info Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {escort.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-green-500" />
                <span className="font-medium">{escort.phone}</span>
                <Button
                  onClick={handleCall}
                  size="sm"
                  className="ml-auto bg-green-500 hover:bg-green-600"
                >
                  Call Now
                </Button>
              </div>
            )}

            {escort.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{escort.email}</span>
              </div>
            )}

            <Button onClick={handleContact} className="w-full" size="lg">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EscortProfile;
