import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RouteSignIn } from "@/helpers/RouteName";

const OnlyEscortAllowed = () => {
  const user = useSelector((state) => state.user);

  if (!user.isLoggedIn) {
    return <Navigate to={RouteSignIn} replace />;
  }

  if (user.user.role !== "escort") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default OnlyEscortAllowed;
