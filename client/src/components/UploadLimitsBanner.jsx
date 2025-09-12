import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Camera, Video, Crown, ArrowUp, Zap } from "lucide-react";
import {
  getUploadLimits,
  getRemainingPhotos,
  getRemainingVideos,
  getUpgradeBenefits,
} from "../utils/uploadLimits";

const UploadLimitsBanner = ({ escort, onUpgrade }) => {
  if (!escort) return null;

  const limits = getUploadLimits(escort.subscriptionTier);
  const remainingPhotos = getRemainingPhotos(escort);
  const remainingVideos = getRemainingVideos(escort);
  const upgradeInfo = getUpgradeBenefits(escort.subscriptionTier);

  // Don't show banner if escort is at highest tier
  if (!upgradeInfo) return null;

  const currentPhotos = escort.gallery?.length || 0;
  const currentVideos = escort.videos?.length || 0;

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Subscription Plan</h3>
              <Badge className={limits.badgeColor}>{limits.label}</Badge>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              Your current plan includes {limits.photos} photos and{" "}
              {limits.videos} videos.
              {upgradeInfo && (
                <span className="text-blue-600 font-medium">
                  {" "}
                  Upgrade to unlock more content and premium features.
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Photos */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Camera className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">
                    Photos
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentPhotos}/{limits.photos} used
                    {remainingPhotos > 0 && (
                      <span className="text-green-600 ml-1">
                        ({remainingPhotos} remaining)
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentPhotos / limits.photos) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Videos */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Video className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">
                    Videos
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentVideos}/{limits.videos} used
                    {remainingVideos > 0 && (
                      <span className="text-green-600 ml-1">
                        ({remainingVideos} remaining)
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          limits.videos > 0
                            ? (currentVideos / limits.videos) * 100
                            : 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade Benefits */}
            <div className="bg-white/60 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-800">
                  Upgrade to {upgradeInfo.next.label} for:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {upgradeInfo.benefits.map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    +{benefit}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Upgrade Button */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            <div className="text-xs text-center text-gray-500">
              Unlock more uploads
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadLimitsBanner;
