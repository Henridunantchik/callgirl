import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import {
  Heart,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  Shield,
  Crown,
  Eye,
  Calendar,
  DollarSign,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Share2,
  Flag,
  Camera,
  Video,
  Info,
  Languages,
  Ruler,
  Scale,
  Palette,
  Eye as EyeIcon,
  ThumbsUp,
  MessageSquare,
  BookOpen,
  Settings,
  User,
  Map,
  Clock as ClockIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MessageCircle as MessageCircleIcon,
  Heart as HeartIcon,
  Share as ShareIcon,
  Flag as FlagIcon,
  MoreHorizontal,
  Camera as CameraIcon,
  Video as VideoIcon,
  Music,
  FileText,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  Users as UsersIcon,
  Award as AwardIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Shield as ShieldIcon,
  Crown as CrownIcon,
  Eye as EyeIcon2,
  Star as StarIcon,
  MapPin as MapPinIcon,
  Clock as ClockIcon2,
  Phone as PhoneIcon2,
  MessageCircle as MessageCircleIcon2,
  Mail as MailIcon2,
  Shield as ShieldIcon2,
  Crown as CrownIcon2,
  Eye as EyeIcon3,
  Calendar as CalendarIcon2,
  DollarSign as DollarSignIcon2,
  Users as UsersIcon2,
  Award as AwardIcon2,
  CheckCircle as CheckCircleIcon2,
  AlertCircle as AlertCircleIcon2,
  Share2 as Share2Icon,
  Flag as FlagIcon2,
  Camera as CameraIcon2,
  Video as VideoIcon2,
  Info as InfoIcon,
  Languages as LanguagesIcon,
  Ruler as RulerIcon,
  Scale as ScaleIcon,
  Palette as PaletteIcon,
  Eye as EyeIcon4,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EscortProfile = () => {
  const { slug, countryCode } = useParams();
  const [escort, setEscort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMethod, setContactMethod] = useState("");

  // Create slug from alias/name
  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Fetch escort data by slug
  useEffect(() => {
    const fetchEscortBySlug = async () => {
      try {
        setLoading(true);
        console.log("=== FETCHING ESCORT BY SLUG ===");
        console.log("Slug:", slug);

        // Fetch escort by slug
        const response = await fetch(`/api/escort/slug/${slug}`);
        const data = await response.json();

        console.log("API Response:", data);

        if (!response.ok) {
          console.error("❌ API Error:", data);
          if (data.debug) {
            console.log("🔍 Debug Info:", data.debug);
          }
          setEscort(null);
          return;
        }

        if (data.success && data.escort) {
          console.log("✅ Escort found:", data.escort);
          setEscort(data.escort);
        } else {
          console.error("❌ No escort data in response");
          setEscort(null);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
        setEscort(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEscortBySlug();
    }
  }, [slug]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleContact = (method) => {
    setContactMethod(method);
    setShowContactModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getVerificationBadge = () => {
    if (
      escort?.verification?.idVerified &&
      escort?.verification?.selfieVerified
    ) {
      return (
        <Badge variant="default" className="bg-green-500 text-white">
          <Shield className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return null;
  };

  const getPremiumBadge = () => {
    if (
      escort?.subscriptionPlan === "premium" ||
      escort?.subscriptionPlan === "vip"
    ) {
      return (
        <Badge variant="secondary" className="bg-yellow-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-96 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 rounded w-1/3"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!escort) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Escort Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The escort profile you're looking for doesn't exist or has been
            removed.
          </p>
          <Link to={`/${countryCode}/escorts`}>
            <Button>Browse All Escorts</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Escort Profile | Call Girls</title>
        <meta
          name="description"
          content="View escort profiles, photos, and contact information."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Cover Photo */}
        <div className="relative h-96 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container mx-auto">
              <div className="flex items-end space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden">
                    <img
                      src={escort.avatar || "/default-avatar.png"}
                      alt={escort.alias}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    {escort.isOnline ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-white">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold">{escort.alias}</h1>
                    {getVerificationBadge()}
                    {getPremiumBadge()}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>{escort.age} years old</span>
                    <span>•</span>
                    <span>{escort.location?.city || "Location"}</span>
                    <span>•</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>{escort.rating || "New"}</span>
                      {escort.reviewCount && (
                        <span className="ml-1">({escort.reviewCount})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={handleFavorite}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${
                        isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    {isFavorite ? "Favorited" : "Favorite"}
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={() => handleContact("message")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Info Card */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge
                        variant={escort.isOnline ? "default" : "secondary"}
                      >
                        {escort.isOnline ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Location</span>
                      <span className="text-sm font-medium">
                        {escort.location?.city || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Age</span>
                      <span className="text-sm font-medium">
                        {escort.age || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Height</span>
                      <span className="text-sm font-medium">
                        {escort.height || "N/A"} cm
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Body Type</span>
                      <span className="text-sm font-medium">
                        {escort.bodyType || "N/A"}
                      </span>
                    </div>
                    {escort.weight && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Weight</span>
                        <span className="text-sm font-medium">
                          {escort.weight} kg
                        </span>
                      </div>
                    )}
                    {escort.ethnicity && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ethnicity</span>
                        <span className="text-sm font-medium capitalize">
                          {escort.ethnicity}
                        </span>
                      </div>
                    )}
                    {escort.hairColor && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Hair Color
                        </span>
                        <span className="text-sm font-medium capitalize">
                          {escort.hairColor}
                        </span>
                      </div>
                    )}
                    {escort.eyeColor && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Eye Color</span>
                        <span className="text-sm font-medium capitalize">
                          {escort.eyeColor}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleContact("message")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleContact("call")}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleContact("whatsapp")}
                  >
                    WhatsApp
                  </Button>
                </CardContent>
              </Card>

              {/* Services Card */}
              {escort.services && escort.services.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {escort.services.slice(0, 6).map((service, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {service}
                        </Badge>
                      ))}
                      {escort.services.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{escort.services.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rates Card */}
              {escort.rates && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {escort.rates.hourly && (
                      <div className="flex justify-between">
                        <span className="text-sm">Hourly</span>
                        <span className="text-sm font-medium">
                          {formatPrice(escort.rates.hourly)}
                        </span>
                      </div>
                    )}
                    {escort.rates.halfDay && (
                      <div className="flex justify-between">
                        <span className="text-sm">Half Day</span>
                        <span className="text-sm font-medium">
                          {formatPrice(escort.rates.halfDay)}
                        </span>
                      </div>
                    )}
                    {escort.rates.overnight && (
                      <div className="flex justify-between">
                        <span className="text-sm">Overnight</span>
                        <span className="text-sm font-medium">
                          {formatPrice(escort.rates.overnight)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Tabs Navigation */}
              <Card className="mb-6">
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="photos">Photos</TabsTrigger>
                      <TabsTrigger value="videos">Videos</TabsTrigger>
                      <TabsTrigger value="services">Services</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                      <TabsTrigger value="about">About</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="p-6">
                      <div className="space-y-6">
                        {/* Bio Section */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            About Me
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {escort.bio || "No bio available."}
                          </p>
                        </div>

                        <Separator />

                        {/* Stats Section */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Profile Stats
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {escort.stats?.profileViews?.toLocaleString() ||
                                  "0"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Profile Views
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {escort.stats?.favorites || "0"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Favorites
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {escort.stats?.responseRate || "0"}%
                              </div>
                              <div className="text-sm text-gray-600">
                                Response Rate
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {escort.stats?.responseTime || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Response Time
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Physical Details */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Physical Details
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <Ruler className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {escort.height || "N/A"} cm
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Scale className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {escort.weight || "N/A"} kg
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Palette className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {escort.hairColor || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <EyeIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {escort.eyeColor || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Photos Tab */}
                    <TabsContent value="photos" className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            Gallery Photos
                          </h3>
                          <span className="text-sm text-gray-600">
                            {escort.gallery?.length || 0} photos
                          </span>
                        </div>

                        {escort.gallery && escort.gallery.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {escort.gallery.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image.url || image}
                                  alt={`${escort.alias} - Photo ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedImage(index)}
                                />
                                {image.isPrivate && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                    <div className="text-center text-white">
                                      <EyeIcon className="w-6 h-6 mx-auto mb-1" />
                                      <p className="text-xs">Private</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No photos available</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Videos Tab */}
                    <TabsContent value="videos" className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Videos</h3>
                          <span className="text-sm text-gray-600">
                            {escort.videos?.length || 0} videos
                          </span>
                        </div>

                        {escort.videos && escort.videos.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {escort.videos.map((video, index) => (
                              <div key={index} className="relative">
                                <video
                                  src={video.url}
                                  className="w-full h-64 object-cover rounded-lg"
                                  controls
                                />
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                  Video {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Video className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No videos available</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Services Tab */}
                    <TabsContent value="services" className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Services Offered
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {escort.services?.map((service, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">{service}</span>
                              </div>
                            )) || (
                              <p className="text-gray-500">
                                No services listed
                              </p>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Rates & Pricing
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {escort.rates?.hourly && (
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold">Hourly</h4>
                                      <p className="text-sm text-gray-600">
                                        1 hour session
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-green-600">
                                        {formatPrice(escort.rates.hourly)}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {escort.rates?.halfDay && (
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold">
                                        Half Day
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        4 hours
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-green-600">
                                        {formatPrice(escort.rates.halfDay)}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {escort.rates?.overnight && (
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold">
                                        Overnight
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        8+ hours
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-green-600">
                                        {formatPrice(escort.rates.overnight)}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {escort.rates?.weekend && (
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold">Weekend</h4>
                                      <p className="text-sm text-gray-600">
                                        48 hours
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-green-600">
                                        {formatPrice(escort.rates.weekend)}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-yellow-500">
                                {escort.rating || "N/A"}
                              </div>
                              <div className="flex items-center justify-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(escort.rating || 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="text-sm text-gray-600">
                                {escort.reviewCount || 0} reviews
                              </div>
                            </div>
                          </div>
                          <Button>Write a Review</Button>
                        </div>

                        <Separator />

                        {/* Mock Reviews */}
                        <div className="space-y-4">
                          {[1, 2, 3].map((review) => (
                            <div key={review} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                  <span className="font-medium">
                                    Client {review}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < 4
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm">
                                Amazing experience with {escort.alias}! She was
                                professional, beautiful, and made me feel very
                                comfortable. Highly recommended!
                              </p>
                              <div className="text-xs text-gray-500 mt-2">
                                {new Date(
                                  Date.now() - review * 24 * 60 * 60 * 1000
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* About Tab */}
                    <TabsContent value="about" className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            About Me
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {escort.bio || "No bio available."}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Languages
                          </h3>
                          <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {escort.languages?.join(", ") || "Not specified"}
                            </span>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Experience
                          </h3>
                          <p className="text-gray-700">
                            {escort.experience ||
                              "No experience information available."}
                          </p>
                        </div>

                        <Separator />

                        {/* Personal Details */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Personal Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {escort.height && (
                              <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Height:
                                </span>
                                <span className="text-sm font-medium">
                                  {escort.height} cm
                                </span>
                              </div>
                            )}
                            {escort.weight && (
                              <div className="flex items-center gap-2">
                                <Scale className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Weight:
                                </span>
                                <span className="text-sm font-medium">
                                  {escort.weight} kg
                                </span>
                              </div>
                            )}
                            {escort.bodyType && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Body Type:
                                </span>
                                <span className="text-sm font-medium capitalize">
                                  {escort.bodyType}
                                </span>
                              </div>
                            )}
                            {escort.ethnicity && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Ethnicity:
                                </span>
                                <span className="text-sm font-medium capitalize">
                                  {escort.ethnicity}
                                </span>
                              </div>
                            )}
                            {escort.hairColor && (
                              <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Hair Color:
                                </span>
                                <span className="text-sm font-medium capitalize">
                                  {escort.hairColor}
                                </span>
                              </div>
                            )}
                            {escort.eyeColor && (
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Eye Color:
                                </span>
                                <span className="text-sm font-medium capitalize">
                                  {escort.eyeColor}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EscortProfile;
