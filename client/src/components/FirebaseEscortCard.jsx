import React from "react";
import { MapPin, Star, Heart, MessageCircle, Eye, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import FirebasePremiumAvatar from "./FirebasePremiumAvatar";
import FirebaseImageDisplay from "./FirebaseImageDisplay";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const FirebaseEscortCard = ({
  escort,
  className = "",
  showActions = true,
  onFavorite,
  onContact,
  isFavorite = false,
  ...props
}) => {
  const {
    _id,
    name,
    alias,
    age,
    location,
    country,
    rating,
    reviews,
    subscriptionTier = "basic",
    isVerified = false,
    avatar,
    gallery = [],
    stats = {},
    services = [],
    hourlyRate,
    currency = "USD",
  } = escort;

  const getCurrencySymbol = (currencyCode) => {
    const currencyMap = {
      ug: "UGX",
      ke: "KES",
      tz: "TZS",
      rw: "RWF",
      bi: "BIF",
      cd: "CDF",
      usd: "USD",
      eur: "EUR",
    };
    return currencyMap[currencyCode?.toLowerCase()] || currencyCode || "USD";
  };

  const getSubscriptionBadge = (tier) => {
    if (tier === "basic") return null;

    const badgeConfig = {
      premium: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Crown,
      },
      featured: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Crown,
      },
      vip: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Crown,
      },
    };

    const config = badgeConfig[tier?.toLowerCase()];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <Badge
        variant="outline"
        className={`text-xs px-2 py-1 border-2 ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {(tier && tier[0] ? tier[0].toUpperCase() : "B") +
          (tier?.slice ? tier.slice(1) : "")}
      </Badge>
    );
  };

  const coverImage =
    gallery?.[0]?.url ||
    gallery?.[0]?.src ||
    avatar ||
    "/placeholder-escort.jpg";

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${className}`}
      {...props}
    >
      {/* Image de couverture */}
      <div className="relative h-48 overflow-hidden">
        <FirebaseImageDisplay
          src={coverImage}
          alt={alias || name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />

        {/* Badge de subscription */}
        {subscriptionTier && subscriptionTier !== "basic" && (
          <div className="absolute top-2 left-2">
            {getSubscriptionBadge(subscriptionTier)}
          </div>
        )}

        {/* Badge de vérification */}
        {isVerified && (
          <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
          <Link to={`/escort/${alias || name}`}>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Voir le profil
            </Button>
          </Link>
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-4">
        {/* En-tête avec avatar et nom */}
        <div className="flex items-start gap-3 mb-3">
          <FirebasePremiumAvatar
            src={avatar}
            alt={alias || name}
            size="w-12 h-12"
            showBadge={false}
            subscriptionTier={subscriptionTier}
            isVerified={isVerified}
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {alias || name}
              {age && <span className="text-gray-500 ml-1">, {age}</span>}
            </h3>

            {location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate">{location}</span>
                {country && (
                  <span className="ml-1">
                    ({(country || "").toUpperCase()})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Note et avis */}
        {(rating || reviews) && (
          <div className="flex items-center gap-2 mb-3">
            {rating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium ml-1">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
            {reviews && (
              <span className="text-sm text-gray-500">({reviews} avis)</span>
            )}
          </div>
        )}

        {/* Services */}
        {services && services.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {services.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{services.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tarif */}
        {hourlyRate && (
          <div className="mb-3">
            <span className="text-lg font-bold text-green-600">
              {getCurrencySymbol(currency)} {hourlyRate}
            </span>
            <span className="text-sm text-gray-500 ml-1">/heure</span>
          </div>
        )}

        {/* Statistiques */}
        {stats && Object.keys(stats).length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            {stats.profileViews && <span>👁️ {stats.profileViews} vues</span>}
            {stats.favorites && <span>❤️ {stats.favorites} favoris</span>}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onFavorite?.(_id)}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  isFavorite ? "fill-current text-red-500" : ""
                }`}
              />
              {isFavorite ? "Retirer" : "Favoris"}
            </Button>

            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => onContact?.(escort)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contacter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseEscortCard;
