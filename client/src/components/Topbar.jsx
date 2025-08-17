import React, { useState, useEffect } from "react";
import logo from "@/assets/images/logo-white.png";
import { Button } from "./ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MdLogin } from "react-icons/md";
import SearchBox from "./SearchBox";
import {
  RouteBlogAdd,
  RouteIndex,
  RouteProfile,
  RouteSignIn,
} from "@/helpers/RouteName";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import usericon from "@/assets/images/user.png";

import {
  FaRegUser,
  FaUserTie,
  FaHeart,
  FaCalendarAlt,
  FaEnvelope,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { IoLogOutOutline, IoSearch } from "react-icons/io5";
import { removeUser } from "@/redux/user/user.slice";
import { showToast } from "@/helpers/showToast";
import { getEvn } from "@/helpers/getEnv";
import { IoMdSearch } from "react-icons/io";
import { AiOutlineMenu } from "react-icons/ai";
import { useSidebar } from "./ui/sidebar";
import { Badge } from "./ui/badge";
import CountrySelector from "./CountrySelector";
import { messageAPI } from "@/services/api";

const Topbar = () => {
  const { toggleSidebar } = useSidebar();
  const [showSearch, setShowSearch] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const dispath = useDispatch();
  const navigate = useNavigate();
  const { countryCode } = useParams();
  const user = useSelector((state) => state.user);

  // Debug user state
  React.useEffect(() => {
    console.log("🔍 Topbar - User state:", user);
    console.log("🔍 Topbar - User role:", user?.user?.role);
  }, [user]);

  // Fetch unread messages count
  const fetchUnreadMessagesCount = async () => {
    if (!user?.user?._id) return;
    
    try {
      const response = await messageAPI.getUserConversations();
      if (response.data && response.data.data) {
        const totalUnread = response.data.data.reduce((total, conv) => {
          return total + (conv.unreadCount || 0);
        }, 0);
        setUnreadMessagesCount(totalUnread);
      }
    } catch (error) {
      console.error("Failed to fetch unread messages count:", error);
    }
  };

  // Fetch unread count when user changes
  useEffect(() => {
    if (user?.user?._id) {
      fetchUnreadMessagesCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadMessagesCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.user?._id]);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${getEvn("VITE_API_BASE_URL")}/auth/logout`,
        {
          method: "get",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!response.ok) {
        return showToast("error", data.message);
      }
      // Clear localStorage for AuthContext
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      dispath(removeUser());
      navigate(RouteIndex);
      showToast("success", data.message);
    } catch (error) {
      showToast("error", error.message);
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const getRoleBadge = () => {
    if (!user?.user?.role) return null;

    const roleColors = {
      client: "bg-blue-100 text-blue-800",
      escort: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    };

    const roleLabels = {
      client: "Client",
      escort: "Escort",
      admin: "Admin",
    };

    const color = roleColors[user.user.role] || "bg-gray-100 text-gray-800";
    const label = roleLabels[user.user.role] || user.user.role;

    return <Badge className={`text-xs ${color}`}>{label}</Badge>;
  };

  return (
    <div className="flex justify-between items-center h-16 fixed w-full z-20 bg-white px-5 border-b">
      <div className="flex justify-center items-center gap-2">
        <button onClick={toggleSidebar} className="md:hidden" type="button">
          <AiOutlineMenu />
        </button>
        <Link to={`/${countryCode || 'ug'}`}>
          <img src={logo} className="w-20 h-auto" />
        </Link>
      </div>

      <div className="w-[500px]">
        <div
          className={`md:relative md:block absolute bg-white left-0 w-full md:top-0 top-16 md:p-0 p-5 ${
            showSearch ? "block" : "hidden"
          }`}
        >
          <SearchBox />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <CountrySelector />

        <button
          onClick={toggleSearch}
          type="button"
          className="md:hidden block"
        >
          <IoMdSearch size={25} />
        </button>

        {!user.isLoggedIn ? (
          <div className="flex gap-2">
            <Button asChild className="rounded-full">
              <Link to={RouteSignIn}>
                <MdLogin />
                Sign In
              </Link>
            </Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={user?.user?.avatar || usericon} />
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">
                    {user?.user?.name || "User"}
                  </p>
                  {getRoleBadge()}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.user?.avatar || usericon} />
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.user?.name || "User"}</p>
                    <p className="text-sm text-gray-500">
                      {user?.user?.email || ""}
                    </p>
                    {getRoleBadge()}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Profile & Settings */}
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link
                  to={RouteProfile(countryCode, user?.user?.role || "client")}
                >
                  <FaRegUser className="mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>

              {/* Role-specific menu items */}
              {user?.user?.role === "escort" && (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to={`/${countryCode}/escort/dashboard`}>
                      <FaUserTie className="mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {user?.user?.role === "client" && (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/client/favorites">
                      <FaHeart className="mr-2" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/client/bookings">
                      <FaCalendarAlt className="mr-2" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {user?.user?.role === "admin" && (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/admin/dashboard">
                      <FaCog className="mr-2" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {/* Join as Escort - Only visible to clients */}
              {user?.user?.role === "client" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to={`/${countryCode}/escort/registration`}>
                      <FaUserTie className="mr-2" />
                      Join as Escort
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {/* Common menu items */}
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to={`/${countryCode}/${user?.user?.role || 'client'}/messages`}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <FaEnvelope className="mr-2" />
                      Messages
                    </div>
                    {unreadMessagesCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs ml-2">
                        {unreadMessagesCount}
                      </Badge>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default Topbar;
