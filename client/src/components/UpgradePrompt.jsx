import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Crown, Lock, Eye, Star, Zap } from "lucide-react";

const UpgradePrompt = ({
  type = "photos", // "photos", "videos", "details", "contact"
  escort,
  onUpgrade,
}) => {
  const getUpgradeContent = () => {
    switch (type) {
      case "photos":
        return {
          icon: <Eye className="h-8 w-8 text-blue-500" />,
          title: "View Gallery Photos",
          description: "See all photos in this escort's gallery",
          benefits: [
            "View all photos",
            "High quality images",
            "Multiple angles",
          ],
          color: "blue",
        };
      case "videos":
        return {
          icon: <Zap className="h-8 w-8 text-purple-500" />,
          title: "View Videos",
          description: "Watch videos to see this escort in action",
          benefits: ["HD videos", "Multiple videos", "Better preview"],
          color: "purple",
        };
      case "details":
        return {
          icon: <Star className="h-8 w-8 text-orange-500" />,
          title: "View Detailed Information",
          description: "See services, personal details, and more",
          benefits: ["Services list", "Personal details", "Experience info"],
          color: "orange",
        };
      case "contact":
        return {
          icon: <Crown className="h-8 w-8 text-yellow-500" />,
          title: "Contact This Escort",
          description: "Get direct contact information",
          benefits: ["Phone number", "WhatsApp", "Direct messaging"],
          color: "yellow",
        };
      default:
        return {
          icon: <Lock className="h-8 w-8 text-gray-500" />,
          title: "Premium Content",
          description: "This content requires a premium subscription",
          benefits: ["Premium features", "Better experience", "More content"],
          color: "gray",
        };
    }
  };

  const content = getUpgradeContent();
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
    orange: "from-orange-50 to-orange-100 border-orange-200",
    yellow: "from-yellow-50 to-yellow-100 border-yellow-200",
    gray: "from-gray-50 to-gray-100 border-gray-200",
  };

  return (
    <Card
      className={`bg-gradient-to-r ${
        colorClasses[content.color]
      } border-l-4 border-l-${content.color}-500`}
    >
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">{content.icon}</div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {content.title}
        </h3>

        <p className="text-gray-600 mb-4">{content.description}</p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {content.benefits.map((benefit, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {benefit}
            </Badge>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            onClick={onUpgrade}
            className={`w-full bg-gradient-to-r from-${content.color}-600 to-${content.color}-700 hover:from-${content.color}-700 hover:to-${content.color}-800 text-white shadow-lg`}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to View
          </Button>

          <p className="text-xs text-gray-500">
            Unlock premium features and see more content
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
