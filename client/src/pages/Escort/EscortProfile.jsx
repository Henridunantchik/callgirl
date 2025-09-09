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
import { FirebasePremiumAvatar } from "../../components/firebase";
import {
  MapPin,
  Phone,
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
import { useRealTimeStats } from "../../hooks/useRealTimeStats";
import { useAuth } from "../../contexts/AuthContext";
import { RouteSignIn } from "../../helpers/RouteName";
import RealTimeMessenger from "../../components/RealTimeMessenger";
import ReviewSystem from "../../components/ReviewSystem";
import FavoriteButton from "../../components/FavoriteButton";
import { FirebaseGallery } from "../../components/firebase";
import {
  hasPremiumAccess,
  canShowContactInfo,
  canShowDetailedInfo,
  canShowReviews,
  canShowRates,
  canShowServices,
  canShowAbout,
  canShowStats,
  getEscortAccessLevel,
  getAccessLevelBadgeColor,
  getAccessLevelLabel,
} from "../../utils/escortAccess";
import { fixUserUrls } from "../../utils/urlHelper";

const EscortProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, getUserId } = useAuth();

  const [escort, setEscort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("photos");
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [selectedEscort, setSelectedEscort] = useState(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Real-time stats hook
  const { updateStats } = useRealTimeStats(escort?._id, (updatedStats) => {
    setEscort((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        favorites: updatedStats.favorites,
        reviews: updatedStats.reviews,
        rating: updatedStats.rating,
      },
    }));
  });

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
      const decoded = decodeURIComponent(slug);
      console.log("🔍 Decoded slug:", decoded);

      // Our API expects an ObjectId; if we get a non-Id slug, try fallback search
      const looksLikeId = /^[a-f\d]{24}$/i.test(decoded);
      const response = looksLikeId
        ? await escortAPI.getEscortProfile(decoded)
        : await escortAPI.searchEscorts({ q: decoded, limit: 1 });
      console.log("✅ Escort profile fetched:", response.data);
      console.log(
        "🔍 Full response structure:",
        JSON.stringify(response.data, null, 2)
      );
      console.log("🔍 Response structure:", {
        hasData: !!response.data,
        hasEscort: !!response.data?.escort,
        hasDataData: !!response.data?.data,
        hasDataDataEscort: !!response.data?.data?.escort,
        escortData:
          response.data?.escort || response.data?.data?.escort || response.data,
      });

      // Try different response structures
      let escortData = null;

      if (looksLikeId && response.data && response.data.escort) {
        console.log("✅ Found escort in response.data.escort");
        escortData = response.data.escort;
      } else if (
        response.data &&
        response.data.data &&
        response.data.data.escort
      ) {
        console.log("✅ Found escort in response.data.data.escort");
        escortData = response.data.data.escort;
      } else if (!looksLikeId && response.data && response.data.data) {
        console.log("✅ Found escort in response.data.data");
        const arr = response.data.data.escorts || response.data.data;
        escortData = Array.isArray(arr) ? arr[0] : arr;
      } else if (response.data) {
        console.log("✅ Found escort in response.data");
        escortData = response.data;
      }

      if (escortData) {
        console.log("✅ Setting escort data:", escortData);
        // Fix URLs in escort data
        const escortWithFixedUrls = fixUserUrls(escortData);
        setEscort(escortWithFixedUrls);

        // Update stats dynamically after setting initial data
        // Call updateEscortStats directly with the escort data
        if (escortData._id) {
          updateEscortStatsWithId(escortData._id);
        }
      } else {
        console.log("❌ No valid escort data found in response");
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
    // Use the helper function to check authentication
    const userId = getUserId(user);

    if (!userId) {
      showToast("error", "Please log in to contact this escort");
      navigate(RouteSignIn);
      return;
    }

    // Pass the escort data to the messenger
    setSelectedEscort(escort);
    setIsMessengerOpen(true);
  };

  // Function to update escort stats in real-time
  const updateEscortStats = async () => {
    if (!escort?._id) return;
    await updateEscortStatsWithId(escort._id);
  };

  // Function to update escort stats with specific ID
  const updateEscortStatsWithId = async (escortId) => {
    if (!escortId) return;

    try {
      console.log("🔄 Updating escort stats for ID:", escortId);
      // Fetch updated escort stats (public API - no auth required)
      const response = await escortAPI.getPublicEscortStats(escortId);
      if (response.data && response.data.data && response.data.data.stats) {
        const apiStats = response.data.data.stats;

        // Map API stats to frontend format
        const updatedStats = {
          views: apiStats.profileViews || 0,
          favorites: apiStats.favorites || 0,
          reviews: apiStats.reviews || 0,
          rating: apiStats.rating || 0,
        };

        // Update escort stats locally
        setEscort((prevEscort) => ({
          ...prevEscort,
          stats: {
            ...prevEscort.stats,
            ...updatedStats,
          },
        }));

        console.log("✅ Escort stats updated:", updatedStats);
      }
    } catch (error) {
      console.error("❌ Failed to update escort stats:", error);
    }
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

  const handleWhatsApp = () => {
    if (escort.whatsapp) {
      const phone = escort.whatsapp.replace(/\D/g, ""); // Remove non-digits
      window.open(`https://wa.me/${phone}`, "_blank");
    }
  };

  const handleTelegram = () => {
    if (escort.telegram) {
      const username = escort.telegram.replace("@", ""); // Remove @ if present
      window.open(`https://t.me/${username}`, "_blank");
    }
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  // Get currency symbol based on country
  const getCurrencySymbol = (countryCode) => {
    const currencyMap = {
      ug: "UGX",
      ke: "KES",
      tz: "TZS",
      rw: "RWF",
      bi: "BIF",
      cd: "CDF",
    };
    return currencyMap[countryCode?.toLowerCase()] || "USD";
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="relative h-80 bg-gradient-to-r from-purple-500 to-pink-500">
        {escort.gallery && escort.gallery.length > 0 ? (
          <FirebaseGallery
            images={escort.gallery}
            videos={escort.videos || []}
            className=""
            maxDisplay={1}
            showLightbox={false}
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
        <FavoriteButton
          escortId={escort._id}
          size="sm"
          variant="ghost"
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
          onFavoriteToggle={updateEscortStats}
        />
      </div>

      {/* Profile Info Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        {/* Avatar and Basic Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <FirebasePremiumAvatar
              src={
                escort.avatar ||
                escort.gallery?.[0]?.url ||
                "/default-escort.jpg"
              }
              alt={escort.alias || escort.name}
              size="w-32 h-32"
              showBadge={true}
              subscriptionTier={escort.subscriptionTier}
              isVerified={escort.isVerified}
            />

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {escort.alias || escort.name}
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

                  {/* 3 Badges Only */}
                  <div className="flex flex-wrap gap-2">
                    {/* 1. Available Badge */}
                    {escort.isAvailable && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    )}

                    {/* 2. Age Verified Badge */}
                    {escort.isAgeVerified && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Age Verified
                      </Badge>
                    )}

                    {/* 3. Tier Badge (Featured/Premium) */}
                    {escort.subscriptionTier &&
                      escort.subscriptionTier !== "basic" && (
                        <Badge
                          variant="secondary"
                          className={`${
                            escort.subscriptionTier === "premium"
                              ? "bg-gradient-to-r from-purple-500 to-pink-500"
                              : "bg-gradient-to-r from-yellow-500 to-orange-500"
                          } text-white shadow-md`}
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {escort.subscriptionTier === "premium"
                            ? "Premium"
                            : "Featured"}
                        </Badge>
                      )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {canShowContactInfo(escort) ? (
                    <>
                      <Button
                        onClick={handleCall}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        size="lg"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {escort.phone || "Call"}
                      </Button>

                      <Button
                        onClick={handleContact}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                        size="lg"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </>
                  ) : // Only show premium access message to escorts (not clients)
                  user?.user?.role === "escort" ? (
                    <div className="w-full p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                      <div className="text-center">
                        <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                        <h3 className="font-semibold text-orange-800 mb-1">
                          Premium Access Required
                        </h3>
                        <p className="text-orange-600 text-sm">
                          Upgrade to Premium to view contact information and
                          send messages
                        </p>
                      </div>
                    </div>
                  ) : (
                    // For clients, just show message button
                    <Button
                      onClick={handleContact}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 w-full"
                      size="lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100">
            <nav className="flex space-x-1 px-6">
              {[
                "photos",
                ...(canShowAbout(escort) ? ["about"] : []),
                ...(canShowServices(escort) ? ["services"] : []),
                ...(canShowRates(escort) ? ["rates"] : []),
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 font-medium text-sm capitalize transition-all duration-300 rounded-t-lg ${
                    activeTab === tab
                      ? "bg-white text-purple-600 shadow-lg border-b-2 border-purple-500"
                      : "text-gray-600 hover:text-purple-600 hover:bg-white/50"
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
                          onClick={() => handleImageClick(index)}
                        >
                          <FirebaseImageDisplay
                            src={photo.url || photo.filePath || photo.src}
                            alt={`${escort.alias || escort.name} - Photo ${
                              index + 1
                            }`}
                            className="w-full h-48 object-contain rounded-lg bg-gray-50"
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
                            className="w-full h-48 object-contain rounded-lg bg-gray-50"
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
                {canShowAbout(escort) ? (
                  <>
                    {/* Bio Section */}
                    {escort.bio && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">About</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {escort.bio}
                        </p>
                      </div>
                    )}
                  </>
                ) : // Only show premium access message to escorts (not clients)
                user?.user?.role === "escort" ? (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">
                      Premium Access Required
                    </h3>
                    <p className="text-orange-600">
                      Upgrade to Premium to view detailed information about this
                      escort
                    </p>
                  </div>
                ) : (
                  // For clients, show a simple message
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Detailed information is not available for this escort.
                    </p>
                  </div>
                )}

                {/* Experience Section - Moved to top */}
                {escort.experience && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Experience</h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {escort.experience}
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
                      <span>24h/24h</span>
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
                {canShowStats(escort) && escort.stats && (
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
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div>
                {canShowServices(escort) ? (
                  escort.services && escort.services.length > 0 ? (
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
                  )
                ) : // Only show premium access message to escorts (not clients)
                user?.user?.role === "escort" ? (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">
                      Premium Access Required
                    </h3>
                    <p className="text-orange-600">
                      Upgrade to Premium to view available services
                    </p>
                  </div>
                ) : (
                  // For clients, show a simple message
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Services information is not available for this escort.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Rates Tab */}
            {activeTab === "rates" && (
              <div>
                {canShowRates(escort) ? (
                  escort.rates ? (
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
                                {escort.rates.hourly}{" "}
                                {getCurrencySymbol(escort.location?.country)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {getCurrencySymbol(escort.location?.country)}
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
                                {escort.rates.overnight}{" "}
                                {getCurrencySymbol(escort.location?.country)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {getCurrencySymbol(escort.location?.country)}
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
                  )
                ) : // Only show premium access message to escorts (not clients)
                user?.user?.role === "escort" ? (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-orange-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">
                      Premium Access Required
                    </h3>
                    <p className="text-orange-600">
                      Upgrade to Premium to view rates
                    </p>
                  </div>
                ) : (
                  // For clients, show a simple message
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Rate information is not available for this escort.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {canShowReviews(escort) && (
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Star className="h-5 w-5" />
                Reviews & Ratings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ReviewSystem
                escortId={escort._id}
                onReviewUpdate={() => {
                  // Update escort stats after review update
                  updateEscortStats();
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Contact Info Card */}
        {canShowContactInfo(escort) ? (
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageCircle className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {escort.phone && (
                <div className="group relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-full shadow-md">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Phone
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {escort.phone}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleCall}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md"
                    >
                      Call Now
                    </Button>
                  </div>
                </div>
              )}

              {escort.whatsapp && (
                <div className="group relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 p-2 rounded-full shadow-md">
                        <Phone className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          WhatsApp
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {escort.whatsapp}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleWhatsApp}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md"
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              )}

              {escort.telegram && (
                <div className="group relative overflow-hidden bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-2 rounded-full shadow-md">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          Telegram
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {escort.telegram}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleTelegram}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md"
                    >
                      Telegram
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleContact}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Message {escort.alias || escort.name}
              </Button>
            </CardContent>
          </Card>
        ) : // Only show premium access message to escorts (not clients)
        user?.user?.role === "escort" ? (
          <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="h-5 w-5" />
                Premium Access Required
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Award className="h-16 w-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Contact Information Hidden
              </h3>
              <p className="text-orange-600 mb-4">
                This escort's contact information is only available to Premium
                members.
              </p>
              <Button
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                size="lg"
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        ) : (
          // For clients, show a simple contact card with just message button
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageCircle className="h-5 w-5" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Button
                onClick={handleContact}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Message {escort.alias || escort.name}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Real-time Messenger */}
      <RealTimeMessenger
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        selectedEscort={escort}
      />

      {/* Firebase Gallery */}
      {escort.gallery && escort.gallery.length > 0 && (
        <FirebaseGallery
          images={escort.gallery}
          maxDisplay={6}
          showLightbox={true}
          onImageClick={(media, index) => setSelectedImageIndex(index)}
        />
      )}
    </div>
  );
};

export default EscortProfile;
