import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { showToast } from "../../helpers/showToast";
import { RouteSignIn } from "../../helpers/RouteName";
import { upgradeAPI } from "../../services/api";
import UpgradeCard from "../../components/UpgradeCard";
import UpgradeModal from "../../components/UpgradeModal";
import UpgradeNotification from "../../components/UpgradeNotification";
import useUpgradeNotifications from "../../hooks/useUpgradeNotifications";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Crown,
  Star,
  Zap,
  CheckCircle,
  Users,
  Eye,
  TrendingUp,
  Phone,
} from "lucide-react";

const UpgradeProfile = () => {
  const { user, getUserId, isAuthenticated } = useAuth();
  const { countryCode } = useParams();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [upgradeRequests, setUpgradeRequests] = useState([]);

  // Hook pour les notifications d'upgrade
  const {
    isNotificationOpen,
    currentNotificationType,
    closeNotification,
    handleLater,
    handleUpgrade: handleNotificationUpgrade,
    shouldShowNotifications,
  } = useUpgradeNotifications();

  // Vérifier l'authentification
  useEffect(() => {
    const userId = getUserId(user);
    const isUserAuthenticated = isAuthenticated();

    if (!userId && !isUserAuthenticated) {
      showToast("error", "Veuillez vous connecter pour accéder à cette page");
      navigate(RouteSignIn);
      return;
    }

    if (user?.user?.role !== "escort") {
      showToast("error", "Cette page est réservée aux escorts");
      navigate("/");
      return;
    }
  }, [user, navigate, getUserId, isAuthenticated]);

  const currentPlan = user?.user?.subscriptionTier || "basic";

  // Vérifier si l'utilisateur est déjà Premium
  const isPremium = currentPlan === "premium";
  const isFeatured = currentPlan === "featured";

  const handleUpgrade = (plan) => {
    if (plan === "basic") {
      showToast("info", "Vous êtes déjà sur le plan Basic");
      return;
    }

    if (plan === currentPlan) {
      showToast("info", `Vous êtes déjà sur le plan ${plan}`);
      return;
    }

    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleWhatsAppContact = (data) => {
    // Logique pour WhatsApp (déjà gérée dans le modal)
    showToast("success", "Redirection vers WhatsApp...");
  };

  const handleMessengerContact = async (data) => {
    try {
      setLoading(true);

      const response = await upgradeAPI.createRequest({
        ...data,
        countryCode: countryCode || "ug",
      });

      showToast("success", "Demande envoyée avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande:", error);
      showToast("error", "Erreur lors de l'envoi de la demande");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpgradeClick = () => {
    handleNotificationUpgrade();
    navigate("/escort/upgrade");
  };

  const benefits = [
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Plus de clients",
      description: "Recevez 3x plus de messages et de demandes",
    },
    {
      icon: <Eye className="h-6 w-6 text-purple-500" />,
      title: "Visibilité accrue",
      description: "Apparaissez en premier dans les listes",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: "Revenus augmentés",
      description: "Gagnez plus grâce à une meilleure visibilité",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-orange-500" />,
      title: "Contact visible",
      description: "Les clients peuvent vous contacter directement",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Upgrade Your Profile
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Improve your visibility and get more clients
            </p>

            {/* Plan actuel */}
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Plan Actuel:{" "}
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why upgrade your profile?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{benefit.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Plans Section - Conditionnel selon le plan */}
        {isPremium ? (
          // Contenu pour les utilisateurs Premium
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-50 px-6 py-3 rounded-full mb-4">
                <Crown className="w-6 h-6 text-green-600" />
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Premium Plan Active
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Congratulations! You are Premium
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                You have access to all Premium benefits
              </p>
            </div>

            {/* Avantages Premium */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <Crown className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Verified Badge
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your profile is verified and approved
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <Eye className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Maximum Visibility
                  </h3>
                  <p className="text-sm text-gray-600">
                    Appear first in search results
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    5x More Clients
                  </h3>
                  <p className="text-sm text-gray-600">
                    Receive 5 times more requests
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Advanced Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Access detailed performance insights
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Priority Support
                  </h3>
                  <p className="text-sm text-gray-600">
                    24/7 customer service support
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    All Benefits
                  </h3>
                  <p className="text-sm text-gray-600">
                    Includes all Basic and Featured benefits
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Actions pour Premium */}
            <div className="text-center">
              <Button
                onClick={() => navigate(`/${countryCode}/escort/dashboard`)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : isFeatured ? (
          // Contenu pour les utilisateurs Featured
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-50 px-6 py-3 rounded-full mb-4">
                <Star className="w-6 h-6 text-purple-600" />
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  Plan Featured Actif
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Vous êtes Featured !
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Passez au niveau supérieur avec Premium
              </p>
            </div>

            {/* Comparaison Featured vs Premium */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    Votre Plan Featured
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Contact visible (téléphone, WhatsApp)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Badge 'Featured'</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Plus de visibilité</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>3x plus de clients</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-green-600" />
                    Plan Premium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Tout de Featured</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Badge 'Verified' sur photo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Visibilité maximale</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Support prioritaire</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Statistiques avancées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>5x plus de clients</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Bouton pour upgrade vers Premium */}
            <div className="text-center">
              <Button
                onClick={() => handleUpgrade("premium")}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                Devenir Premium - $5/mois
              </Button>
            </div>
          </div>
        ) : (
          // Contenu pour les utilisateurs Basic (plan normal)
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Choose Your Plan
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <UpgradeCard
                plan="basic"
                currentPlan={currentPlan}
                onUpgrade={handleUpgrade}
                isCurrent={currentPlan === "basic"}
              />
              <UpgradeCard
                plan="featured"
                currentPlan={currentPlan}
                onUpgrade={handleUpgrade}
                isCurrent={currentPlan === "featured"}
              />
              <UpgradeCard
                plan="premium"
                currentPlan={currentPlan}
                onUpgrade={handleUpgrade}
                isCurrent={currentPlan === "premium"}
              />
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Questions fréquentes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Comment fonctionne le paiement ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Après avoir soumis votre demande, nous vous fournirons les
                  instructions de paiement. Une fois le paiement effectué et
                  vérifié, votre profil sera mis à jour dans les 24h.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Puis-je annuler mon abonnement ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Oui, vous pouvez annuler votre abonnement Premium à tout
                  moment. Votre statut Premium restera actif jusqu'à la fin de
                  la période payée.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Quelle est la différence entre Featured et Premium ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Featured (12$) : Contact visible, plus de visibilité, 3x plus
                  de clients. Premium (5$/mois) : Tout de Featured + badge
                  verified, visibilité maximale, 5x plus de clients.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Combien de temps pour voir les résultats ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vous verrez une augmentation immédiate de votre visibilité.
                  Les résultats en termes de clients peuvent prendre quelques
                  jours à une semaine.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Besoin d'aide ?
              </h3>
              <p className="text-gray-600 mb-6">
                Notre équipe est là pour vous aider à choisir le bon plan et
                répondre à toutes vos questions.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() =>
                    window.open("https://wa.me/+1234567890", "_blank")
                  }
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button onClick={() => navigate("/messages")} variant="outline">
                  <Star className="h-4 w-4 mr-2" />
                  Messagerie
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlan}
        currentPlan={currentPlan}
        onWhatsAppContact={handleWhatsAppContact}
        onMessengerContact={handleMessengerContact}
      />

      {/* Upgrade Notification */}
      <UpgradeNotification
        isOpen={isNotificationOpen}
        onClose={closeNotification}
        onUpgrade={handleNotificationUpgradeClick}
        onLater={handleLater}
        type={currentNotificationType}
        escortName={user?.user?.name || "Escort"}
      />
    </div>
  );
};

export default UpgradeProfile;
