import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Check, Crown, Star, Zap } from "lucide-react";

const UpgradeCard = ({ 
  plan, 
  currentPlan, 
  onUpgrade, 
  loading = false,
  isCurrent = false 
}) => {
  const plans = {
    basic: {
      title: "Basic",
      price: "Free",
      icon: <Star className="h-6 w-6" />,
      color: "bg-gray-500",
      features: [
        "Profile visible in listings",
        "Basic information",
        "Messaging system",
      ],
    },
    featured: {
      title: "Featured",
      price: "$12",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-blue-500",
      features: [
        "Everything from Basic",
        "Visible contact (phone, WhatsApp)",
        "Featured badge",
        "More visibility",
        "Detailed services",
        "3x more clients",
      ],
    },
    premium: {
      title: "Premium",
      price: "$5/month",
      icon: <Crown className="h-6 w-6" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      features: [
        "Everything from Featured",
        "Verified badge on photo",
        "Maximum visibility",
        "Priority support",
        "Advanced analytics",
        "5x more clients",
      ],
    },
  };

  const planData = plans[plan];

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isCurrent ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:scale-105'
    }`}>
      {isCurrent && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          Current Plan
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className={`mx-auto w-16 h-16 rounded-full ${planData.color} text-white flex items-center justify-center mb-4`}>
          {planData.icon}
        </div>
        <CardTitle className="text-2xl font-bold">{planData.title}</CardTitle>
        <div className="text-3xl font-bold text-gray-900">
          {planData.price}
          {plan === "premium" && (
            <span className="text-sm font-normal text-gray-500">/mois</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ul className="space-y-3 mb-6">
          {planData.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        {!isCurrent && (
          <Button
            onClick={() => onUpgrade(plan)}
            disabled={loading}
            className={`w-full ${
              plan === "premium"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                : plan === "featured"
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-500 hover:bg-gray-600"
            } text-white font-semibold`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : null}
            {plan === "basic" ? "Free Plan" : `Become ${planData.title}`}
          </Button>
        )}

        {isCurrent && (
          <div className="text-center">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Current Plan
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpgradeCard;
