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

  useEffect(() => {
    fetchEscortProfile();
  }, [slug]);

  const fetchEscortProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate slug parameter
      if (!slug || slug === "undefined") {
        throw new Error("Invalid escort identifier");
      }

      console.log("🔍 Fetching escort profile for slug:", slug);

      const response = await escortAPI.getEscortProfile(slug);
      console.log("✅ Escort profile fetched:", response.data);

      if (response.data && response.data.escort) {
        setEscort(response.data.escort);
      } else if (response.data) {
        // Handle case where the response is the escort object directly
        setEscort(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("❌ Failed to fetch escort profile:", error);

      // Handle specific ObjectId errors
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading escort profile...</p>
        </div>
      </div>
    );
  }

  if (error || !escort) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || "This escort profile could not be found."}
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back
          </Button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {escort.name}
                {escort.alias && escort.alias !== escort.name && (
                  <span className="text-xl text-gray-600 ml-2">
                    ({escort.alias})
                  </span>
                )}
              </h1>

              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{escort.location?.city || escort.city}</span>
                </div>

                {escort.age && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{escort.age} years old</span>
                  </div>
                )}

                {escort.subscriptionTier &&
                  escort.subscriptionTier !== "free" && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      {escort.subscriptionTier}
                    </Badge>
                  )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            {escort.gallery && escort.gallery.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {escort.gallery.slice(0, 6).map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url}
                        alt={`${escort.name} - Photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About */}
            {escort.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{escort.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {escort.services && escort.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {escort.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rates */}
            {escort.rates && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {escort.rates.hourly && (
                      <div className="flex justify-between items-center">
                        <span>Hourly Rate</span>
                        <span className="font-semibold">
                          ${escort.rates.hourly}
                        </span>
                      </div>
                    )}
                    {escort.rates.overnight && (
                      <div className="flex justify-between items-center">
                        <span>Overnight</span>
                        <span className="font-semibold">
                          ${escort.rates.overnight}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleContact} className="w-full" size="lg">
                  Contact {escort.name}
                </Button>

                <div className="space-y-2 text-sm">
                  {escort.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{escort.phone}</span>
                    </div>
                  )}

                  {escort.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{escort.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {escort.isAgeVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {escort.isAgeVerified
                        ? "Age Verified"
                        : "Age Verification Pending"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {escort.isVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {escort.isVerified
                        ? "Profile Verified"
                        : "Profile Verification Pending"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscortProfile;
