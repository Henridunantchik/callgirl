import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Crown,
  TrendingUp,
  Users,
  Eye,
  MessageCircle,
  Star,
  Calendar,
  DollarSign,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../helpers/showToast";

const PremiumStats = ({ stats }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContactSupport = () => {
    // Open WhatsApp with pre-filled message for premium support
    const message = `Hello! I'm a Premium user (${
      user?.name || user?.email
    }) and I need support.`;
    const whatsappUrl = `https://wa.me/+256701760214?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
    showToast("success", "Opening WhatsApp for Premium support...");
  };

  const handleViewAnalytics = () => {
    // Scroll to the analytics section
    const analyticsSection = document.querySelector("[data-analytics-section]");
    if (analyticsSection) {
      analyticsSection.scrollIntoView({ behavior: "smooth" });
      showToast("success", "Scrolling to analytics...");
    } else {
      showToast("info", "Analytics are displayed above!");
    }
  };
  const premiumFeatures = [
    {
      icon: <Crown className="w-6 h-6 text-green-600" />,
      title: "Badge Verified",
      description: "Profil vérifié et approuvé",
      value: "Actif",
      color: "text-green-600",
    },
    {
      icon: <Eye className="w-6 h-6 text-blue-600" />,
      title: "Visibilité",
      description: "Position dans les recherches",
      value: "1ère place",
      color: "text-blue-600",
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: "Multiplicateur Clients",
      description: "Plus de demandes reçues",
      value: "5x",
      color: "text-purple-600",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
      title: "Statistiques Avancées",
      description: "Analyses détaillées",
      value: "Disponible",
      color: "text-orange-600",
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-indigo-600" />,
      title: "Support Prioritaire",
      description: "Assistance clientèle",
      value: "24/7",
      color: "text-indigo-600",
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      title: "Statut Premium",
      description: "Niveau maximum",
      value: "Actif",
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Premium */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 px-6 py-3 rounded-full mb-4">
          <Crown className="w-6 h-6 text-green-600" />
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Plan Premium Actif
          </Badge>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Statistiques Premium
        </h2>
        <p className="text-gray-600">
          Vous bénéficiez de tous les avantages Premium
        </p>
      </div>

      {/* Avantages Premium */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                {feature.icon}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${feature.color}`}>
                  {feature.value}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques Avancées */}
      {stats && (
        <div
          data-analytics-section
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Vues du Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.profileViews || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                +{stats.profileViewsGrowth || 0}% ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Messages Reçus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.messages || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                +{stats.messagesGrowth || 0}% ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Réservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.bookings || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                +{stats.bookingsGrowth || 0}% ce mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Revenus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${stats.earnings || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                +{stats.earningsGrowth || 0}% ce mois
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions Premium */}
      <div className="text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Support Premium
          </h3>
          <p className="text-gray-600 mb-4">
            Besoin d'aide ? Notre équipe support prioritaire est là pour vous.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleContactSupport}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Contact Support
            </button>
            <button
              onClick={handleViewAnalytics}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Voir les Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumStats;
