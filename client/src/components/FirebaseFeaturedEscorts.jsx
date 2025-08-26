import React, { useState, useEffect } from "react";
import {
  Star,
  Crown,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";
import FirebaseEscortCard from "./FirebaseEscortCard";
import FirebaseImageDisplay from "./FirebaseImageDisplay";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";

const FirebaseFeaturedEscorts = ({
  escorts = [],
  title = "Escorts en Vedette",
  subtitle = "Découvrez nos escorts les plus populaires",
  maxDisplay = 6,
  showViewAll = true,
  className = "",
  onFavorite,
  onContact,
  ...props
}) => {
  const [featuredEscorts, setFeaturedEscorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    setLoading(true);

    // Filtrer et trier les escorts par popularité
    const sorted = escorts
      .filter(
        (escort) =>
          escort.subscriptionTier && escort.subscriptionTier !== "basic"
      )
      .sort((a, b) => {
        // Priorité: VIP > Featured > Premium
        const tierPriority = { vip: 3, featured: 2, premium: 1, basic: 0 };
        const aPriority = tierPriority[a.subscriptionTier?.toLowerCase()] || 0;
        const bPriority = tierPriority[b.subscriptionTier?.toLowerCase()] || 0;

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        // Ensuite par note
        if (a.rating && b.rating) {
          return b.rating - a.rating;
        }

        // Puis par nombre de vues
        if (a.stats?.profileViews && b.stats?.profileViews) {
          return b.stats.profileViews - a.stats.profileViews;
        }

        return 0;
      })
      .slice(0, maxDisplay);

    setFeaturedEscorts(sorted);
    setLoading(false);
  }, [escorts, maxDisplay]);

  const getSubscriptionBadge = (tier) => {
    const badgeConfig = {
      premium: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Crown,
        label: "Premium",
      },
      featured: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Crown,
        label: "Featured",
      },
      vip: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Crown,
        label: "VIP",
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
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className={`py-12 ${className}`} {...props}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (featuredEscorts.length === 0) {
    return (
      <div className={`py-12 ${className}`} {...props}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucune escorte en vedette pour le moment
            </h3>
            <p className="text-gray-500 mb-4">
              Les escorts premium apparaîtront ici une fois qu'elles auront mis
              à niveau leur profil.
            </p>
            <Link to="/escorts">
              <Button variant="outline">Voir toutes les escorts</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-12 ${className}`} {...props}>
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-gray-600 text-lg">{subtitle}</p>

          {/* Statistiques */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>
                {featuredEscorts.reduce(
                  (sum, e) => sum + (e.stats?.profileViews || 0),
                  0
                )}{" "}
                vues
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>
                {featuredEscorts.reduce(
                  (sum, e) => sum + (e.stats?.favorites || 0),
                  0
                )}{" "}
                favoris
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{featuredEscorts.length} escorts premium</span>
            </div>
          </div>
        </div>

        {/* Grille des escorts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredEscorts.map((escort, index) => (
            <div key={escort._id} className="relative">
              {/* Badge de position */}
              {index < 3 && (
                <div className="absolute -top-2 -left-2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : "bg-orange-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
              )}

              <FirebaseEscortCard
                escort={escort}
                onFavorite={onFavorite}
                onContact={onContact}
                className="h-full"
              />
            </div>
          ))}
        </div>

        {/* Bouton "Voir tout" */}
        {showViewAll && (
          <div className="text-center">
            <Link to="/escorts">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Eye className="w-5 h-5 mr-2" />
                Voir toutes les escorts
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseFeaturedEscorts;
