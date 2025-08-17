import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { X, Star, Zap, Crown, TrendingUp, Users, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const UpgradeNotification = ({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  onLater, 
  type = "clients",
  escortName = "Escort"
}) => {
  const notifications = {
    clients: {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Plus de clients!",
      message: `Salut ${escortName}! Vous voulez recevoir 3x plus de clients?`,
      action: "Devenez Featured pour seulement 12$!",
      color: "bg-blue-50 border-blue-200",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
    },
    visibility: {
      icon: <Eye className="h-8 w-8 text-purple-500" />,
      title: "Améliorez votre visibilité!",
      message: "Les escorts Featured apparaissent en premier dans les listes",
      action: "Contactez-nous pour upgrade!",
      color: "bg-purple-50 border-purple-200",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
    },
    competition: {
      icon: <TrendingUp className="h-8 w-8 text-orange-500" />,
      title: "Votre profil est en bas de la liste",
      message: "Les clients voient d'abord les escorts Featured",
      action: "Upgradez maintenant!",
      color: "bg-orange-50 border-orange-200",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
    },
    statistics: {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "Statistiques impressionnantes!",
      message: "Les escorts Featured reçoivent 3x plus de messages",
      action: "Devenez Featured aujourd'hui!",
      color: "bg-yellow-50 border-yellow-200",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    },
  };

  const currentNotification = notifications[type];

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
            className="relative w-full max-w-md mx-4"
          >
            <Card className={`${currentNotification.color} border-2 shadow-xl`}>
              <CardContent className="p-6">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Icon and title */}
                <div className="text-center mb-4">
                  <div className="flex justify-center mb-3">
                    {currentNotification.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {currentNotification.title}
                  </h3>
                </div>

                {/* Message */}
                <p className="text-gray-600 text-center mb-4">
                  {currentNotification.message}
                </p>

                {/* Action text */}
                <p className="text-sm font-medium text-gray-700 text-center mb-6">
                  {currentNotification.action}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={onUpgrade}
                    className={`${currentNotification.buttonColor} text-white flex-1 font-semibold`}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Maintenant
                  </Button>
                  <Button
                    onClick={onLater}
                    variant="outline"
                    className="flex-1"
                  >
                    Plus tard
                  </Button>
                </div>

                {/* Benefits preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    <Star className="h-3 w-3 mr-1 text-yellow-400" />
                    <span>Contact visible • Plus de visibilité • Badge Featured</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeNotification;
