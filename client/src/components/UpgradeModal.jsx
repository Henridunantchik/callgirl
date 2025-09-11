import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { X, MessageCircle, Phone, Zap, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { messageAPI, upgradeAPI } from "../services/api";
import { showToast } from "../helpers/showToast";

const UpgradeModal = ({
  isOpen,
  onClose,
  selectedPlan,
  setSelectedPlan,
  currentPlan,
  onWhatsAppContact,
  onMessengerContact,
  onRequestCreated,
}) => {
  const [contactMethod, setContactMethod] = useState(null);
  const [subscriptionPeriod, setSubscriptionPeriod] = useState("monthly");
  const [formData, setFormData] = useState({
    escortName: "",
    escortPhone: "",
    escortEmail: "",
    paymentProof: "",
  });

  const plans = {
    featured: {
      title: "Featured",
      price: "$12",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-blue-500",
      description: "More visibility, visible contact, 3x more clients",
    },
    premium: {
      title: "Premium",
      price: subscriptionPeriod === "annual" ? "$60/year" : "$5/month",
      icon: <Crown className="h-6 w-6" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      description: "Maximum visibility, verified badge, 5x more clients",
    },
  };

  const planData = plans[selectedPlan] || plans.featured; // Default to featured if no plan selected

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWhatsApp = () => {
    const messageContent = `Hello! I want to become ${planData.title}.

Name: ${formData.escortName}
Phone: ${formData.escortPhone}
Email: ${formData.escortEmail}
Current plan: ${currentPlan}
Requested plan: ${selectedPlan}${
      selectedPlan === "premium" ? `(${subscriptionPeriod})` : ""
    }
Price: ${planData.price}`;

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/+256701760214?text=${encodeURIComponent(
      messageContent
    )}`;
    window.open(whatsappUrl, "_blank");
    showToast("success", "Opening WhatsApp...");
    onClose();
  };

  const handleMessenger = async () => {
    try {
      const messageContent = `Hello! I want to upgrade to ${
        planData.title
      } plan.

Name: ${formData.escortName}
Phone: ${formData.escortPhone}
Email: ${formData.escortEmail}
Current plan: ${currentPlan}
Requested plan: ${selectedPlan}${
        selectedPlan === "premium" ? `(${subscriptionPeriod})` : ""
      }
Price: ${planData.price}`;

      // Create upgrade request in the system
      await upgradeAPI.createRequest({
        escortName: formData.escortName,
        escortPhone: formData.escortPhone,
        escortEmail: formData.escortEmail,
        requestedPlan: selectedPlan,
        subscriptionPeriod:
          selectedPlan === "premium" ? subscriptionPeriod : undefined,
        contactMethod: "messenger",
        paymentProof: "", // Optional field, can be empty
        countryCode: "ug",
      });

      // Send message to admin via your system
      await messageAPI.sendMessage({
        escortId: "67bb7464ac51a7a6674dca42", // Admin user ID
        content: messageContent,
        type: "text",
      });

      showToast("success", "Upgrade request sent successfully!");

      // Call callback to refresh requests list
      if (onRequestCreated) {
        onRequestCreated();
      }

      onClose();
    } catch (error) {
      console.error("Error sending upgrade request:", error);
      showToast(
        "error",
        "Failed to send upgrade request. Please try WhatsApp instead."
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (contactMethod === "whatsapp") {
      handleWhatsApp();
    } else if (contactMethod === "messenger") {
      handleMessenger();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-lg mx-4"
          >
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">
                    Become {planData.title}
                  </CardTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <div
                    className={`w-12 h-12 rounded-full ${planData.color} text-white flex items-center justify-center`}
                  >
                    {planData.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {planData.price}
                    </div>
                    <p className="text-sm text-gray-600">
                      {planData.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Plan Selection - Show when no plan is pre-selected */}
                  {!selectedPlan && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Select Plan:
                      </Label>
                      <div
                        className={`grid ${
                          currentPlan === "featured"
                            ? "grid-cols-2"
                            : "grid-cols-1"
                        } gap-3`}
                      >
                        {/* Show Featured for Basic users */}
                        {currentPlan === "basic" && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSelectedPlan("featured")}
                            className="h-20 flex flex-col items-center justify-center p-3"
                          >
                            <Zap className="h-6 w-6 mb-2 text-blue-500" />
                            <span className="font-semibold">Featured</span>
                            <span className="text-sm text-gray-600">$12</span>
                          </Button>
                        )}

                        {/* Show Premium for Featured users */}
                        {currentPlan === "featured" && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setSelectedPlan("featured")}
                              className="h-20 flex flex-col items-center justify-center p-3"
                            >
                              <Zap className="h-6 w-6 mb-2 text-blue-500" />
                              <span className="font-semibold">Featured</span>
                              <span className="text-sm text-gray-600">$12</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setSelectedPlan("premium")}
                              className="h-20 flex flex-col items-center justify-center p-3"
                            >
                              <Crown className="h-6 w-6 mb-2 text-purple-500" />
                              <span className="font-semibold">Premium</span>
                              <span className="text-sm text-gray-600">
                                {subscriptionPeriod === "annual"
                                  ? "$60/year"
                                  : "$5/month"}
                              </span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="escortName">Full Name</Label>
                      <Input
                        id="escortName"
                        name="escortName"
                        value={formData.escortName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="escortPhone">Phone</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">+</span>
                        </div>
                        <Input
                          id="escortPhone"
                          name="escortPhone"
                          value={formData.escortPhone}
                          onChange={handleInputChange}
                          placeholder="256 123 456 789"
                          className="pl-8"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="escortEmail">Email</Label>
                    <Input
                      id="escortEmail"
                      name="escortEmail"
                      type="email"
                      value={formData.escortEmail}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  {/* Subscription Period Selection for Premium */}
                  {selectedPlan === "premium" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Subscription Period:
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={
                            subscriptionPeriod === "monthly"
                              ? "default"
                              : "outline"
                          }
                          onClick={() => setSubscriptionPeriod("monthly")}
                          className="h-12"
                        >
                          <span className="text-sm">Monthly</span>
                          <span className="text-xs ml-1">$5/month</span>
                        </Button>

                        <Button
                          type="button"
                          variant={
                            subscriptionPeriod === "annual"
                              ? "default"
                              : "outline"
                          }
                          onClick={() => setSubscriptionPeriod("annual")}
                          className="h-12"
                        >
                          <span className="text-sm">Annual</span>
                          <span className="text-xs ml-1">$60/year</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Contact Method:
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={
                          contactMethod === "whatsapp" ? "default" : "outline"
                        }
                        onClick={() => setContactMethod("whatsapp")}
                        className="h-12"
                      >
                        <Phone className="h-4 w-4 mr-2 text-green-500" />
                        WhatsApp
                      </Button>

                      <Button
                        type="button"
                        variant={
                          contactMethod === "messenger" ? "default" : "outline"
                        }
                        onClick={() => setContactMethod("messenger")}
                        className="h-12"
                      >
                        <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
                        Message
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={!contactMethod}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                    >
                      Send Request
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> After sending your request, we will
                    provide you with payment instructions. Once payment is
                    completed, your profile will be updated within 24 hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
