import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { showToast } from "../../helpers/showToast";
import { RouteSignIn } from "../../helpers/RouteName";
import { upgradeAPI, messageAPI, userAPI } from "../../services/api";
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
  Clock,
  MessageCircle,
} from "lucide-react";

const UpgradeProfile = () => {
  const { user, getUserId, isAuthenticated, refreshUser } = useAuth();
  const { countryCode } = useParams();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

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
      showToast("error", "Please log in to access this page");
      navigate(RouteSignIn);
      return;
    }

    if (user?.role !== "escort") {
      showToast("error", "This page is reserved for escorts");
      navigate("/");
      return;
    }
  }, [user, navigate, getUserId, isAuthenticated]);

  // Refresh user data to get latest subscription status
  useEffect(() => {
    const refreshUserData = async () => {
      if (user && user.role === "escort") {
        try {
          console.log("🔄 Refreshing user data on upgrade page load...");
          await refreshUser();
        } catch (error) {
          console.error("❌ Error refreshing user data:", error);
        }
      }
    };

    refreshUserData();
  }, []); // Only run once on mount

  // Fetch upgrade requests and subscription status (cache-first + timeout)
  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== "escort") return;

      try {
        setRequestsLoading(true);
        setSubscriptionLoading(true);

        // Fast path: short timeout, no batching
        const [requestsResponse, statusResponse] = await Promise.all([
          upgradeAPI.getMyRequests({ timeout: 1200, batch: false }),
          upgradeAPI.getSubscriptionStatus({ timeout: 1200, batch: false }),
        ]);

        setUpgradeRequests(requestsResponse.data.data || []);
        setSubscriptionStatus(statusResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setRequestsLoading(false);
        setSubscriptionLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Function to fetch upgrade requests
  const fetchUpgradeRequests = async () => {
    if (!user || user.role !== "escort") return;

    try {
      setRequestsLoading(true);
      const requestsResponse = await upgradeAPI.getMyRequests();
      setUpgradeRequests(requestsResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching upgrade requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const currentPlan = user?.subscriptionTier || "basic";

  // Vérifier si l'utilisateur est déjà Premium
  const isPremium = currentPlan === "premium";
  const isFeatured = currentPlan === "featured";

  const handleUpgrade = (plan) => {
    if (plan === "basic") {
      showToast("info", "You are already on the Basic plan");
      return;
    }

    if (plan === currentPlan) {
      showToast("info", `You are already on the ${plan} plan`);
      return;
    }

    // Enforce progression: Basic → Featured → Premium
    if (currentPlan === "basic" && plan === "premium") {
      showToast(
        "info",
        "You must upgrade to Featured first before becoming Premium"
      );
      return;
    }

    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleWhatsAppContact = () => {
    // Open WhatsApp with pre-filled message for upgrade help
    const currentTier = user?.user?.subscriptionTier || "basic";
    const tierLabel =
      currentTier === "premium"
        ? "Premium"
        : currentTier === "featured"
        ? "Featured"
        : "Basic";

    const message = `Hello! I'm a ${tierLabel} user (${
      user?.user?.name || user?.user?.email || user?.name || user?.email
    }) and I need help with upgrading my subscription plan.`;
    const whatsappUrl = `https://wa.me/+256701760214?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
    showToast("success", "Opening WhatsApp for upgrade support...");
  };

  const handleMessengerContact = async () => {
    try {
      setLoading(true);

      // Get main admin dynamically
      const adminResponse = await userAPI.getMainAdmin();
      const adminId = adminResponse.data.data.admin._id;

      // Navigate to messages page with admin conversation
      navigate(`/${countryCode}/escort/messages?admin=${adminId}`);

      showToast("success", "Opening messaging system...");
    } catch (error) {
      console.error("Error opening messaging:", error);
      showToast("error", "Error opening messaging system");
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
      title: "More Clients",
      description: "Receive 3x more messages and requests",
    },
    {
      icon: <Eye className="h-6 w-6 text-purple-500" />,
      title: "Increased Visibility",
      description: "Appear first in listings",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: "Higher Revenue",
      description: "Earn more through better visibility",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-orange-500" />,
      title: "Visible Contact",
      description: "Clients can contact you directly",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Upgrade Your Profile
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Improve your visibility and get more clients
            </p>

            {/* Current Plan */}
            <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Current Plan:{" "}
                {(currentPlan?.[0] || "").toUpperCase() +
                  (currentPlan?.slice?.(1) || "")}
              </Badge>
            </div>

            {/* Subscription Status for Premium Users */}
            {subscriptionStatus && subscriptionStatus.tier === "premium" && (
              <div className="mt-4 inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  {subscriptionStatus.period === "annual"
                    ? "Annual"
                    : "Monthly"}{" "}
                  Premium
                </Badge>
                {subscriptionStatus.remainingDays !== null && (
                  <span className="text-sm text-purple-700">
                    {subscriptionStatus.remainingDays > 0
                      ? `${subscriptionStatus.remainingDays} days remaining`
                      : "Subscription expired"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Requests Status */}
        {upgradeRequests.length > 0 && (
          <div className="mb-8">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Clock className="h-5 w-5" />
                  Your Upgrade Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    <span className="ml-2 text-orange-600">
                      Loading requests...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      // Debug: Log all requests
                      console.log("All upgrade requests:", upgradeRequests);

                      // Simple approach: Show only the most recent request
                      const sortedRequests = upgradeRequests.sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      );
                      const filteredRequests = sortedRequests.slice(0, 1); // Show only the most recent

                      console.log("Sorted requests:", sortedRequests);
                      console.log(
                        "Filtered requests (most recent only):",
                        filteredRequests
                      );

                      console.log("Filtered requests:", filteredRequests);

                      return filteredRequests.map((request) => (
                        <div
                          key={request._id}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge
                                variant={
                                  request.status === "pending"
                                    ? "secondary"
                                    : request.status === "payment_required"
                                    ? "secondary"
                                    : request.status === "payment_confirmed"
                                    ? "secondary"
                                    : request.status === "approved"
                                    ? "default"
                                    : "destructive"
                                }
                                className={
                                  request.status === "pending"
                                    ? "bg-orange-100 text-orange-800"
                                    : request.status === "payment_required"
                                    ? "bg-blue-100 text-blue-800"
                                    : request.status === "payment_confirmed"
                                    ? "bg-purple-100 text-purple-800"
                                    : request.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {request.status === "pending" && "Pending"}
                                {request.status === "payment_required" &&
                                  "Payment Required"}
                                {request.status === "payment_confirmed" &&
                                  "Payment Confirmed"}
                                {request.status === "approved" && "Approved"}
                                {request.status === "rejected" && "Rejected"}
                                {request.status === "expired" && "Expired"}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700">
                              <strong>Requested Plan:</strong>{" "}
                              {(
                                request.requestedPlan?.[0] || ""
                              ).toUpperCase() +
                                (request.requestedPlan?.slice?.(1) || "")}
                            </div>
                            <div className="text-sm text-gray-700">
                              <strong>Contact Method:</strong>{" "}
                              {(
                                request.contactMethod?.[0] || ""
                              ).toUpperCase() +
                                (request.contactMethod?.slice?.(1) || "")}
                            </div>

                            {/* Payment Required Status */}
                            {request.status === "payment_required" && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-sm font-medium text-blue-800 mb-2">
                                  Payment Instructions:
                                </div>
                                <div className="text-sm text-blue-700 mb-2">
                                  {request.paymentInstructions}
                                </div>
                                <div className="text-sm text-blue-600">
                                  <strong>Payment Method:</strong>{" "}
                                  {request.paymentMethod}
                                </div>
                                <div className="text-sm text-blue-600">
                                  <strong>Deadline:</strong>{" "}
                                  {new Date(
                                    request.paymentDeadline
                                  ).toLocaleString()}
                                </div>
                                <div className="text-sm text-blue-600">
                                  <strong>Amount:</strong> $
                                  {request.paymentAmount}
                                </div>

                                {/* Payment Instructions Message */}
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="text-sm font-medium text-blue-800 mb-2">
                                    Payment Instructions Sent:
                                  </div>
                                  <div className="text-sm text-blue-700">
                                    Check your messages or WhatsApp for complete
                                    payment instructions.
                                  </div>
                                  <div className="text-sm text-blue-600 mt-2">
                                    Please complete payment within 48 hours and
                                    send the receipt via message.
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Payment Confirmed Status */}
                            {request.status === "payment_confirmed" && (
                              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="text-sm font-medium text-purple-800 mb-2">
                                  Payment Proof Submitted:
                                </div>
                                <div className="text-sm text-purple-700">
                                  {request.paymentProof}
                                </div>
                                <div className="text-sm text-purple-600 mt-2">
                                  Waiting for admin approval...
                                </div>
                              </div>
                            )}

                            {/* Rejected Status */}
                            {request.status === "rejected" && (
                              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <div className="text-sm font-medium text-red-800 mb-2">
                                  Request Rejected
                                </div>
                                <div className="text-sm text-red-700 mb-3">
                                  Your upgrade request has been rejected. You
                                  can submit a new request.
                                </div>
                                <Button
                                  onClick={() => setIsModalOpen(true)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  size="sm"
                                >
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  Re-Upgrade
                                </Button>
                              </div>
                            )}

                            {/* Expired Status */}
                            {request.status === "expired" && (
                              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                <div className="text-sm font-medium text-red-800 mb-2">
                                  Payment Deadline Expired
                                </div>
                                <div className="text-sm text-red-700 mb-3">
                                  The 48-hour payment deadline has passed. You
                                  can submit a new request.
                                </div>
                                <Button
                                  onClick={() => setIsModalOpen(true)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  size="sm"
                                >
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  Re-Upgrade
                                </Button>
                              </div>
                            )}

                            {request.adminNotes && (
                              <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                                <strong>Admin Note:</strong>{" "}
                                {request.adminNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

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

        {/* Plans Section - Conditional based on plan */}
        {isPremium ? (
          // Content for Premium users
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

            {/* Premium Benefits */}
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

            {/* Actions for Premium */}
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
          // Content for Featured users
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-50 px-6 py-3 rounded-full mb-4">
                <Star className="w-6 h-6 text-purple-600" />
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  Featured Plan Active
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You are Featured!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Take it to the next level with Premium
              </p>
            </div>

            {/* Featured vs Premium Comparison */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    Your Featured Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Visible contact (phone, WhatsApp)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>'Featured' badge</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>More visibility</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Text messaging only</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>No photos or videos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>3x more clients</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-green-600" />
                    Premium Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Everything from Featured</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Photo gallery (up to 30 photos)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Video uploads (up to 15 videos)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>'Verified' badge on photo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Maximum visibility</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>5x more clients</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Button to upgrade to Premium */}
            <div className="text-center">
              <Button
                onClick={() => handleUpgrade("premium")}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                Become Premium - $5/month or $60/year
              </Button>
            </div>
          </div>
        ) : (
          // Content for Basic users (normal plan)
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Choose Your Plan
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
            </div>

            {/* Premium info for Basic users */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-full mb-4">
                <Crown className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600 font-medium">
                  Premium plan available after Featured upgrade
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  How does payment work?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  After submitting your request, we will provide you with
                  payment instructions. Once payment is completed and verified,
                  your profile will be updated within 24 hours.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Can I cancel my subscription?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, you can cancel your Premium subscription at any time.
                  Your Premium status will remain active until the end of the
                  paid period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What's the difference between Featured and Premium?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Featured ($12): Visible contact, more visibility, text
                  messaging only, no photos/videos, 3x more clients. Premium
                  ($5/month or $60/year): Everything from Featured + photo
                  gallery (30 photos), video uploads (15 videos), verified
                  badge, maximum visibility, 5x more clients.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  How long to see results?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You will see an immediate increase in your visibility. Results
                  in terms of clients may take a few days to a week.
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
                Need help?
              </h3>
              <p className="text-gray-600 mb-6">
                Our team is here to help you choose the right plan and answer
                all your questions.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleWhatsAppContact}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button onClick={handleMessengerContact} variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messaging
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
        setSelectedPlan={setSelectedPlan}
        currentPlan={currentPlan}
        onWhatsAppContact={handleWhatsAppContact}
        onMessengerContact={handleMessengerContact}
        onRequestCreated={fetchUpgradeRequests}
        user={user}
      />

      {/* Upgrade Notification */}
      <UpgradeNotification
        isOpen={isNotificationOpen}
        onClose={closeNotification}
        onUpgrade={handleNotificationUpgradeClick}
        onLater={handleLater}
        type={currentNotificationType}
        escortName={user?.name || "Escort"}
      />
    </div>
  );
};

export default UpgradeProfile;
