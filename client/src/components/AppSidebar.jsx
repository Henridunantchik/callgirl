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
import { useState } from "react";

const AppSidebar = () => {
  const user = useSelector((state) => state.user);
  const { countryCode } = useParams();
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const { data: categoryData } = useFetch(
    `${getEvn("VITE_API_BASE_URL")}/category/all-category`,
    {
      method: "get",
      credentials: "include",
    }
  );

  // Get cities for the current country
  const cities = getCitiesByCountry(countryCode);
  const countryInfo = getCountryByCode(countryCode);

  // Show first 8 cities by default, or all cities if expanded
  const displayedCities = showAllCities ? cities : cities.slice(0, 8);

  return (
    <Sidebar>
      <SidebarHeader className="bg-white">
        <img src={logo} width={80} className="h-auto" />
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
                      <SidebarMenuButton>
                        <FaCalendarAlt />
                        <Link to={`/${countryCode}/client/bookings`}>
                          My Bookings
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaEnvelope />
                        <Link to={`/${countryCode}/client/messages`}>
                          Messages
                        </Link>
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
                      <SidebarMenuButton>
                        <FaCalendarAlt />
                        <Link to={`/${countryCode}/escort/bookings`}>
                          Bookings
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaEnvelope />
                        <Link to={`/${countryCode}/escort/messages`}>
                          Messages
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaRegComments />
                        <Link to={`/${countryCode}/hommages`}>Reviews</Link>
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
