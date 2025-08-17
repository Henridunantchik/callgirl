import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Heart,
  Star,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Eye,
  Shield,
  Crown,
  DollarSign,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import FavoriteButton from "./FavoriteButton";
import { useAuth } from "../contexts/AuthContext";
import {
  hasPremiumAccess,
  canShowContactInfo,
  canShowDetailedInfo,
  getEscortAccessLevel,
  getAccessLevelBadgeColor,
  getAccessLevelLabel,
} from "../utils/escortAccess";

const EscortCard = ({ escort, onFavorite, onContact, isFavorite = false }) => {
  const { countryCode } = useParams();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Function to get currency symbol based on country
  const getCurrencySymbol = (countryCode) => {
    const currencies = {
      ug: "UGX",
      ke: "KES",
      tz: "TZS",
      rw: "RWF",
      bi: "BIF",
      cd: "CDF",
    };
    return currencies[countryCode?.toLowerCase()] || "USD";
  };

  const currencySymbol = getCurrencySymbol(countryCode);

  const handleImageError = () => {
    setImageError(true);
  };

  const getVerificationBadge = () => {
    if (
      escort.verification?.idVerified &&
      escort.verification?.selfieVerified
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
      escort.subscriptionPlan === "premium" ||
      escort.subscriptionPlan === "vip"
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

  const getOnlineStatus = () => {
    if (escort.isOnline) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
          Online
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-gray-400 text-gray-400">
        <Clock className="w-3 h-3 mr-1" />
        {escort.lastSeen
          ? `Last seen ${new Date(escort.lastSeen).toLocaleDateString()}`
          : "Offline"}
      </Badge>
    );
  };

  // Price formatting removed - will be shown elsewhere

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        {/* Image Section */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={
              imageError
                ? escort.avatar || "/default-escort.jpg"
                : escort.gallery?.[0]?.url || escort.avatar
            }
            alt={escort.alias || escort.name}
            className="w-full h-full object-cover object-center transition-transform duration-300"
            style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
            onError={handleImageError}
          />

          {/* Overlay with badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {getVerificationBadge()}
            {getPremiumBadge()}
            {/* Access Level Badge */}
            <Badge
              variant="secondary"
              className={`${getAccessLevelBadgeColor(
                getEscortAccessLevel(escort)
              )} text-white shadow-md`}
            >
              <Award className="h-3 w-3 mr-1" />
              {getAccessLevelLabel(getEscortAccessLevel(escort))}
            </Badge>
          </div>

          {/* Online status */}
          <div className="absolute top-3 right-3">{getOnlineStatus()}</div>

          {/* Favorite button - Only for premium/featured escorts */}
          {canShowContactInfo(escort) && (
            <div className="absolute top-3 right-3 mt-12">
              <FavoriteButton
                escortId={escort._id}
                size="sm"
                variant="ghost"
                className="bg-white/80 hover:bg-white text-gray-700 hover:text-red-500"
                onFavoriteToggle={() => {
                  // Update escort stats in the card if needed
                  if (onFavorite) {
                    onFavorite(escort._id);
                  }
                }}
              />
            </div>
          )}

          {/* Gallery count */}
          {escort.gallery && escort.gallery.length > 1 && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-black/70 text-white">
                <Eye className="w-3 h-3 mr-1" />
                {escort.gallery.length} photos
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          {/* Name and Age */}
          <div className="flex items-center justify-between mb-1">
            <Link
              to={`/${countryCode}/escort/${escort.alias || escort.name}`}
              className="hover:underline"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {escort.alias || escort.name}
              </h3>
            </Link>
            <span className="text-xs text-gray-500">{escort.age} years</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-xs text-gray-600 mb-1">
            <MapPin className="w-3 h-3 mr-1" />
            {(() => {
              // Handle location whether it's an object or string
              if (typeof escort.location === "object" && escort.location.city) {
                return `${escort.location.city}${
                  escort.location.subLocation
                    ? `, ${escort.location.subLocation}`
                    : ""
                }`;
              } else if (typeof escort.location === "string") {
                return escort.location;
              } else {
                return "Location not specified";
              }
            })()}
          </div>

          {/* Rating */}
          {escort.rating && (
            <div className="flex items-center mb-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(escort.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 ml-1">
                {escort.rating.toFixed(1)} ({escort.reviewCount || 0} reviews)
              </span>
            </div>
          )}

          {/* Physical attributes - Only show for premium escorts */}
          {canShowDetailedInfo(escort) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {escort.height && (
                <Badge variant="outline" className="text-xs">
                  {escort.height}cm
                </Badge>
              )}
              {escort.bodyType && (
                <Badge variant="outline" className="text-xs">
                  {escort.bodyType}
                </Badge>
              )}
              {escort.ethnicity && (
                <Badge variant="outline" className="text-xs">
                  {escort.ethnicity}
                </Badge>
              )}
            </div>
          )}

          {/* Services - Only show for premium escorts */}
          {canShowDetailedInfo(escort) && escort.services && (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {(() => {
                  // Handle services whether it's a string or array
                  let servicesArray = escort.services;
                  if (typeof servicesArray === "string") {
                    // Split by common delimiters and clean up
                    servicesArray = servicesArray
                      .split(/[,\s]+/)
                      .filter((s) => s.trim());
                  }

                  // Show first 3 services
                  const displayServices = servicesArray.slice(0, 3);
                  return (
                    <>
                      {displayServices.map((service, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          {service}
                        </Badge>
                      ))}
                      {servicesArray.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-100 text-gray-600"
                        >
                          +{servicesArray.length - 3} more
                        </Badge>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 pt-0">
          {canShowContactInfo(escort) ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onContact(escort, "message")}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onContact(escort, "call")}
              >
                <Phone className="w-4 h-4 mr-1" />
                {escort.phone || "Call"}
              </Button>
            </div>
          ) : // Only show premium access message to escorts (not clients)
          user?.user?.role === "escort" ? (
            <div className="w-full p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
              <div className="text-center">
                <Award className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                <p className="text-orange-600 text-xs font-medium">
                  Premium Access Required
                </p>
              </div>
            </div>
          ) : (
            // For clients, just show message button
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onContact(escort, "message")}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EscortCard;
