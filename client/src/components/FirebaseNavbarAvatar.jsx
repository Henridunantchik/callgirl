import React, { useState } from "react";
import { User, Settings, LogOut, Crown, Shield } from "lucide-react";
import FirebasePremiumAvatar from "./FirebasePremiumAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const FirebaseNavbarAvatar = ({
  user,
  onLogout,
  onProfileClick,
  onSettingsClick,
  className = "",
  size = "w-8 h-8",
  showDropdown = true,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout?.();
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    onProfileClick?.();
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    onSettingsClick?.();
  };

  const getSubscriptionIcon = (tier) => {
    switch (tier?.toLowerCase()) {
      case "premium":
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case "featured":
        return <Crown className="w-3 h-3 text-blue-500" />;
      case "vip":
        return <Shield className="w-3 h-3 text-purple-500" />;
      default:
        return null;
    }
  };

  const getSubscriptionLabel = (tier) => {
    switch (tier?.toLowerCase()) {
      case "premium":
        return "Premium";
      case "featured":
        return "Featured";
      case "vip":
        return "VIP";
      default:
        return "Basic";
    }
  };

  if (!user) {
    return (
      <div className={`${className}`} {...props}>
        <Button variant="ghost" size="sm" className="rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  const avatar = (
    <FirebasePremiumAvatar
      src={user.avatar}
      alt={user.name || user.alias || "User"}
      size={size}
      showBadge={false}
      subscriptionTier={user.subscriptionTier}
      isVerified={user.isVerified}
      className="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all duration-200"
    />
  );

  if (!showDropdown) {
    return (
      <div className={`${className}`} {...props}>
        {avatar}
      </div>
    );
  }

  return (
    <div className={`${className}`} {...props}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>{avatar}</DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          {/* En-tête utilisateur */}
          <DropdownMenuLabel className="p-3">
            <div className="flex items-center gap-3">
              <FirebasePremiumAvatar
                src={user.avatar}
                alt={user.name || user.alias || "User"}
                size="w-12 h-12"
                showBadge={false}
                subscriptionTier={user.subscriptionTier}
                isVerified={user.isVerified}
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user.name || user.alias || "Utilisateur"}
                </p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>

                {/* Badge de subscription */}
                {user.subscriptionTier && user.subscriptionTier !== "basic" && (
                  <div className="flex items-center gap-1 mt-1">
                    {getSubscriptionIcon(user.subscriptionTier)}
                    <Badge variant="outline" className="text-xs">
                      {getSubscriptionLabel(user.subscriptionTier)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Menu items */}
          <DropdownMenuItem
            onClick={handleProfileClick}
            className="cursor-pointer"
          >
            <User className="w-4 h-4 mr-2" />
            Mon Profil
          </DropdownMenuItem>

          {user.role === "escort" && (
            <DropdownMenuItem
              onClick={handleProfileClick}
              className="cursor-pointer"
            >
              <Crown className="w-4 h-4 mr-2" />
              Dashboard Escort
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={handleSettingsClick}
            className="cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FirebaseNavbarAvatar;
