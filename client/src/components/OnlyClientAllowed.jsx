import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RouteSignIn } from "@/helpers/RouteName";

const OnlyClientAllowed = () => {
  const user = useSelector((state) => state.user);

  // Check if user is logged in via Redux
  if (!user?.isLoggedIn) {
    // Fallback to localStorage check
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      return <Navigate to={RouteSignIn} replace />;
    }

    // Try to parse stored user
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "client") {
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      return <Navigate to={RouteSignIn} replace />;
    }
  } else {
    // Check Redux user role
    if (user?.user?.role !== "client") {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default OnlyClientAllowed;
