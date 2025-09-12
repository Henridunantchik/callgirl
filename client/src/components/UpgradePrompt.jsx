import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Crown,
  Lock,
  Eye,
  Star,
  Zap,
  Check,
  Camera,
  Video,
  Sparkles,
} from "lucide-react";

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
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-8 border border-purple-200 shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <Camera className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gallery Photos - Upgrade Required
        </h2>
        <p className="text-gray-600 text-lg">Upload Photos & Videos</p>
        <p className="text-gray-500 mt-2">
          Upgrade to Featured or Premium to upload gallery photos and videos
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Featured Plan */}
        <Card className="relative overflow-hidden border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-yellow-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
            POPULAR
          </div>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-3">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Featured Plan
              </h3>
              <div className="text-3xl font-bold text-orange-600 mb-1">$12</div>
              <p className="text-gray-500 text-sm">lifetime</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">10 Gallery Photos</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">5 Videos</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Featured Badge</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Priority Listing</span>
              </div>
            </div>

            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300"
            >
              <Star className="h-5 w-5 mr-2" />
              Choose Featured
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="relative overflow-hidden border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
            BEST VALUE
          </div>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-3">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Premium Plan
              </h3>
              <div className="text-3xl font-bold text-purple-600 mb-1">$5</div>
              <p className="text-gray-500 text-sm">per month</p>
              <div className="text-lg font-bold text-green-600 mt-1">
                or $60/year
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">30 Gallery Photos</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">15 Videos</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Premium Badge</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">All Features</span>
              </div>
            </div>

            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300"
            >
              <Crown className="h-5 w-5 mr-2" />
              Choose Premium
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          <Sparkles className="h-4 w-4 inline mr-1" />
          Unlock premium features and see more content
        </p>
      </div>
    </div>
  );
};

export default UpgradePrompt;
