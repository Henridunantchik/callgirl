import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useParams } from "react-router-dom";
import logo from "@/assets/images/logo-white.png";
import { IoHomeOutline } from "react-icons/io5";
import { BiCategoryAlt } from "react-icons/bi";
import { GrBlog } from "react-icons/gr";
import { FaRegComments } from "react-icons/fa6";
import { LuUsers } from "react-icons/lu";
import { GoDot } from "react-icons/go";
import {
  FaHeart,
  FaCalendarAlt,
  FaEnvelope,
  FaUserTie,
  FaCog,
  FaChartBar,
  FaShieldAlt,
  FaCreditCard,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { TrendingUp } from "lucide-react";
import {
  RouteBlog,
  RouteBlogByCategory,
  RouteCategoryDetails,
  RouteCommentDetails,
  RouteIndex,
  RouteUser,
} from "@/helpers/RouteName";
import { useFetch } from "@/hooks/useFetch";
import { getEvn } from "@/helpers/getEnv";
import { useSelector } from "react-redux";
import { getCitiesByCountry, getCountryByCode } from "@/helpers/countries";
import { useState, useEffect } from "react";
import { messageAPI, bookingAPI, reviewAPI, categoryAPI } from "@/services/api";

import { Badge } from "@/components/ui/badge";

const AppSidebar = () => {
  const user = useSelector((state) => state.user);
  const { countryCode } = useParams();
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({
    messages: 0,
    bookings: 0,
    reviews: 0,
  });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [categoryData, setCategoryData] = useState(null);

  // Fetch categories using the API service
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        setCategoryData(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Get cities for the current country
  const cities = getCitiesByCountry(countryCode);
  const countryInfo = getCountryByCode(countryCode);

  // Show first 8 cities by default, or all cities if expanded
  const displayedCities = showAllCities ? cities : cities.slice(0, 8);

  // Fetch notification counts for users
  useEffect(() => {
    const fetchNotificationCounts = async () => {
      if (!user?.isLoggedIn) return;

      try {
        console.log(
          "🔍 Fetching notification counts for user:",
          user?.user?.role
        );

        // Fetch unread message count (for both clients and escorts)
        try {
          const messagesResponse = await messageAPI.getUserConversations();
          console.log("📨 Messages response:", messagesResponse.data);
          console.log(
            "📨 Messages data structure:",
            JSON.stringify(messagesResponse.data, null, 2)
          );

          const unreadMessages =
            messagesResponse.data?.data?.reduce((total, conv) => {
              console.log("📨 Conversation:", conv);
              console.log("📨 Unread count for this conv:", conv.unreadCount);
              return total + (conv.unreadCount || 0);
            }, 0) || 0;

          console.log("📨 Unread messages count:", unreadMessages);
          setUnreadMessages(unreadMessages);
        } catch (error) {
          console.warn("Failed to fetch message counts:", error.message);
          setUnreadMessages(0);
        }

        let pendingBookings = 0;
        let newReviews = 0;

        if (user?.user?.role === "escort") {
          // Fetch pending bookings count for escorts
          const bookingsResponse = await bookingAPI.getEscortBookings();
          console.log("📅 Bookings response:", bookingsResponse.data);
          console.log(
            "📅 Bookings data structure:",
            JSON.stringify(bookingsResponse.data, null, 2)
          );

          // Fix: bookings are in data.bookings array
          const bookings = bookingsResponse.data?.data?.bookings || [];
          pendingBookings =
            bookings.filter((booking) => booking.status === "pending").length ||
            0;

          console.log("📅 Pending bookings count:", pendingBookings);

          // Fetch new reviews count (reviews from last 7 days) for escorts
          try {
            const reviewsResponse = await reviewAPI.getUserReviews();
            console.log("⭐ Reviews response:", reviewsResponse.data);
            console.log(
              "⭐ Reviews data structure:",
              JSON.stringify(reviewsResponse.data, null, 2)
            );

            // Fix: reviews might be in data.reviews array or directly in data
            const reviews =
              reviewsResponse.data?.data?.reviews ||
              reviewsResponse.data?.data ||
              [];
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            newReviews =
              reviews.filter(
                (review) => new Date(review.createdAt) > sevenDaysAgo
              ).length || 0;

            console.log("⭐ New reviews count:", newReviews);
          } catch (error) {
            console.error("Error fetching reviews:", error);
            newReviews = 0;
          }
        } else if (user?.user?.role === "client") {
          // Fetch pending bookings count for clients
          const bookingsResponse = await bookingAPI.getUserBookings();
          console.log("📅 Client bookings response:", bookingsResponse.data);
          console.log(
            "📅 Client bookings data structure:",
            JSON.stringify(bookingsResponse.data, null, 2)
          );

          // Fix: bookings are in data.bookings array
          const bookings = bookingsResponse.data?.data?.bookings || [];
          pendingBookings =
            bookings.filter((booking) => booking.status === "pending").length ||
            0;

          console.log("📅 Client pending bookings count:", pendingBookings);
        }

        console.log("📊 Final notification counts:", {
          messages: unreadMessages,
          bookings: pendingBookings,
          reviews: newReviews,
        });

        console.log("📊 Final notification counts:", {
          messages: unreadMessages,
          bookings: pendingBookings,
          reviews: newReviews,
        });

        setNotificationCounts({
          messages: unreadMessages,
          bookings: pendingBookings,
          reviews: newReviews,
        });
      } catch (error) {
        console.error("Error fetching notification counts:", error);
      }
    };

    fetchNotificationCounts();

    // No auto-refresh interval - let events handle updates
  }, [user]);

  // Listen for conversation opened events
  useEffect(() => {
    const handleConversationOpened = () => {
      // Don't refresh notification counts when conversation is opened
      // Let the messagesRead event handle it
      console.log("📨 Sidebar - Conversation opened event received");
    };

    const handleMessagesRead = () => {
      // Reset message notifications when messages are read
      setNotificationCounts((prev) => ({
        ...prev,
        messages: 0,
      }));
      console.log("📨 Sidebar - Messages read, notifications reset to 0");
    };

    window.addEventListener("conversationOpened", handleConversationOpened);
    window.addEventListener("messagesRead", handleMessagesRead);
    return () => {
      window.removeEventListener(
        "conversationOpened",
        handleConversationOpened
      );
      window.removeEventListener("messagesRead", handleMessagesRead);
    };
  }, []);

  return (
    <Sidebar>
      <SidebarHeader className="bg-white">
        <Link to={`/${countryCode || "ug"}`}>
          <img src={logo} width={80} className="h-auto" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <IoHomeOutline />
                <Link to={`/${countryCode}`}>ESCORT DIRECTORY</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {user && user.isLoggedIn && (
              <>
                {/* Join as Escort - Only for clients */}
                {user?.user?.role === "client" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700">
                      <FaUserTie />
                      <Link to={`/${countryCode}/escort/registration`}>
                        Join as Escort
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {/* Client Navigation */}
                {user?.user?.role === "client" && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaHeart />
                        <Link to={`/${countryCode}/client/favorites`}>
                          My Favorites
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        disabled
                        className="opacity-50 cursor-not-allowed"
                      >
                        <FaCalendarAlt />
                        <span className="flex items-center gap-2">
                          My Bookings
                          <Badge
                            variant="secondary"
                            className="text-xs bg-orange-100 text-orange-700"
                          >
                            Coming Soon
                          </Badge>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaEnvelope />
                        <Link to={`/${countryCode}/client/messages`}>
                          Messages
                        </Link>
                        {notificationCounts.messages > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center"
                          >
                            {notificationCounts.messages > 99
                              ? "99+"
                              : notificationCounts.messages}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                {/* Escort Navigation */}
                {user?.user?.role === "escort" && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaUserTie />
                        <Link to={`/${countryCode}/escort/dashboard`}>
                          My Dashboard
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        disabled
                        className="opacity-50 cursor-not-allowed"
                      >
                        <FaCalendarAlt />
                        <span className="flex items-center gap-2">
                          Bookings
                          <Badge
                            variant="secondary"
                            className="text-xs bg-orange-100 text-orange-700"
                          >
                            Coming Soon
                          </Badge>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaEnvelope />
                        <Link to={`/${countryCode}/escort/messages`}>
                          Messages
                        </Link>
                        {notificationCounts.messages > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center"
                          >
                            {notificationCounts.messages > 99
                              ? "99+"
                              : notificationCounts.messages}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaRegComments />
                        <Link to={`/${countryCode}/escort/reviews`}>
                          Reviews
                        </Link>
                        {notificationCounts.reviews > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center"
                          >
                            {notificationCounts.reviews > 99
                              ? "99+"
                              : notificationCounts.reviews}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                {/* Admin Navigation */}
                {user?.user?.role === "admin" && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaChartBar />
                        <Link to={`/${countryCode}/admin/dashboard`}>
                          Dashboard
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <LuUsers />
                        <Link to={`/${countryCode}/admin/users`}>
                          User Management
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaShieldAlt />
                        <Link to={`/${countryCode}/admin/moderation`}>
                          Content Moderation
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaCreditCard />
                        <Link to={`/${countryCode}/admin/payments`}>
                          Payment Management
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <TrendingUp />
                        <Link to={`/${countryCode}/admin/upgrade-requests`}>
                          Demandes d'Upgrade
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaRegComments />
                        <Link to={`/${countryCode}/admin/messages`}>
                          Messages Admin
                        </Link>
                        {notificationCounts.messages > 0 && (
                          <Badge className="ml-2 text-xs">
                            {notificationCounts.messages > 99
                              ? "99+"
                              : notificationCounts.messages}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <BiCategoryAlt />
                        <Link to={`/${countryCode}/sexe`}>Categories</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {/* Popular Services */}
        <SidebarGroup>
          <SidebarGroupLabel>POPULAR SERVICES</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to={`/${countryCode}/category/in-call`}>In-call</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to={`/${countryCode}/category/out-call`}>Out-call</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to={`/${countryCode}/category/massage`}>Massage</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to={`/${countryCode}/category/gfe`}>
                  GFE (Girlfriend Experience)
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to={`/${countryCode}/category/pse`}>
                  PSE (Porn Star Experience)
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to={`/${countryCode}/category/travel`}>Travel</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to={`/${countryCode}/category/overnight`}>Overnight</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to={`/${countryCode}/category/duo`}>Duo</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* View All Services Toggle */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setShowAllServices(!showAllServices)}
                className="cursor-pointer hover:bg-gray-100"
              >
                {showAllServices ? (
                  <>
                    <FaChevronUp />
                    <span>Show Less Services</span>
                  </>
                ) : (
                  <>
                    <FaChevronDown />
                    <span>View All Services</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* All Services (Expanded) */}
        {showAllServices && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>EXTENDED SERVICES</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <GoDot />
                    <Link to={`/${countryCode}/category/dinner-date`}>
                      Dinner Date
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <GoDot />
                    <Link to={`/${countryCode}/category/weekend`}>Weekend</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <GoDot />
                    <Link to={`/${countryCode}/category/party`}>Party</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <GoDot />
                    <Link to={`/${countryCode}/category/companionship`}>
                      Companionship
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>SPECIALTY SERVICES</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <GoDot />
                    <Link to={`/${countryCode}/category/bdsm`}>BDSM</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <GoDot />
                    <Link to={`/${countryCode}/category/role-play`}>
                      Role Play
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <GoDot />
                    <Link to={`/${countryCode}/category/fetish`}>Fetish</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <GoDot />
                    <Link to={`/${countryCode}/category/couples`}>Couples</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}

        {/* Popular Locations - Country Specific */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {countryInfo?.name?.toUpperCase()} CITIES ({cities.length})
          </SidebarGroupLabel>
          <SidebarMenu>
            {displayedCities.map((city) => (
              <SidebarMenuItem key={city}>
                <SidebarMenuButton>
                  <GoDot />
                  <Link to={`/${countryCode}/location/${city.toLowerCase()}`}>
                    {city}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            {/* Show More/Less Cities Toggle */}
            {cities.length > 8 && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setShowAllCities(!showAllCities)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  {showAllCities ? (
                    <>
                      <FaChevronUp />
                      <span>Show Less Cities</span>
                    </>
                  ) : (
                    <>
                      <FaChevronDown />
                      <span>View All {cities.length} Cities</span>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
