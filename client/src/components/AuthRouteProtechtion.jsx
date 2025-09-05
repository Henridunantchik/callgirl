import { RouteSignIn } from "@/helpers/RouteName";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AuthRouteProtechtion = () => {
  const reduxUser = useSelector((state) => state.user);
  const { user: ctxUser, loading } = useAuth();
  const location = useLocation();

  // Show lightweight loading while auth context initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const isLoggedIn = reduxUser?.isLoggedIn || !!ctxUser;
  if (isLoggedIn) {
    return <Outlet />;
  }

  const returnUrl = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`${RouteSignIn}?returnUrl=${returnUrl}`} replace />;
};

export default AuthRouteProtechtion;
