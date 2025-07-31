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
import { Link } from "react-router-dom";
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

const AppSidebar = () => {
  const user = useSelector((state) => state.user);
  const { data: categoryData } = useFetch(
    `${getEvn("VITE_API_BASE_URL")}/category/all-category`,
    {
      method: "get",
      credentials: "include",
    }
  );

  return (
    <Sidebar>
      <SidebarHeader className="bg-white">
        <img src={logo} width={120} />
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <IoHomeOutline />
                <Link to={RouteIndex}>ESCORT DIRECTORY</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {user && user.isLoggedIn && (
              <>
                {/* Client Navigation */}
                {user.user.role === "client" && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaHeart />
                        <Link to="/client/favorites">My Favorites</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaCalendarAlt />
                        <Link to="/client/bookings">My Bookings</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaEnvelope />
                        <Link to="/client/messages">Messages</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                {/* Escort Navigation */}
                {user.user.role === "escort" && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaUserTie />
                        <Link to="/escort/dashboard">My Dashboard</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaCalendarAlt />
                        <Link to="/escort/bookings">Bookings</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaEnvelope />
                        <Link to="/escort/messages">Messages</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaRegComments />
                        <Link to={RouteCommentDetails}>Reviews</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                {/* Admin Navigation */}
                {user.user.role === "admin" && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaChartBar />
                        <Link to="/admin/dashboard">Dashboard</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <LuUsers />
                        <Link to="/admin/users">User Management</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaShieldAlt />
                        <Link to="/admin/moderation">Content Moderation</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <FaCreditCard />
                        <Link to="/admin/payments">Payment Management</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <BiCategoryAlt />
                        <Link to={RouteCategoryDetails}>Categories</Link>
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
                <Link to="/category/massage">Massage</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to="/category/companionship">Companionship</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to="/category/events">Events</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to="/category/travel">Travel</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Popular Locations */}
        <SidebarGroup>
          <SidebarGroupLabel>POPULAR LOCATIONS</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to="/location/kampala">Kampala</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to="/location/entebbe">Entebbe</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to="/location/jinja">Jinja</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GoDot />
                <Link to="/location/mbarara">Mbarara</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
