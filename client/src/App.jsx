//client/src/App.jsx

import React from "react";
import { Button } from "./components/ui/button";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import SearchRedirect from "./components/SearchRedirect";
import Layout from "./Layout/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

import { useGeolocation } from "./hooks/useGeolocation";
import { isValidCountryCode } from "./helpers/countries";
import {
  RouteAddCategory,
  RouteBlog,
  RouteBlogAdd,
  RouteBlogByCategory,
  RouteBlogDetails,
  RouteBlogEdit,
  RouteCategoryDetails,
  RouteCommentDetails,
  RouteEditCategory,
  RouteIndex,
  RouteProfile,
  RouteSearch,
  RouteSignIn,
  RouteSignUp,
  RouteUser,
} from "./helpers/RouteName";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import AddCategory from "./pages/Category/AddCategory";
import CategoryDetails from "./pages/Category/CategoryDetails";
import EditCategory from "./pages/Category/EditCategory";
import AddBlog from "./pages/Blog/AddBlog";
import BlogDetails from "./pages/Blog/BlogDetails";
import EditBlog from "./pages/Blog/EditBlog";
import SingleBlogDetails from "./pages/SingleBlogDetails";
import BlogByCategory from "./pages/Blog/BlogByCategory";
import SearchResult from "./pages/SearchResult";
import Comments from "./pages/Comments";
import User from "./pages/User";

// New escort directory pages
import EscortList from "./pages/Escort/EscortList";
import EscortProfile from "./pages/Escort/EscortProfile";
import EscortProfileEdit from "./pages/Escort/EscortProfileEdit";
import EscortRegistration from "./pages/Escort/EscortRegistration";
import EscortDashboard from "./pages/Escort/EscortDashboard";
import EscortReviews from "./pages/Escort/EscortReviews";
import UpgradeProfile from "./pages/Escort/UpgradeProfile";
import UpgradeRequests from "./pages/Admin/UpgradeRequests";
import AdminMessages from "./pages/Admin/AdminMessages";
import ClientDashboard from "./pages/Client/ClientDashboard";
import Favorites from "./pages/Client/Favorites";
import Bookings from "./pages/Client/Bookings";
import Messages from "./pages/Client/Messages";
import ComingSoonPage from "./pages/ComingSoonPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import ContentModeration from "./pages/Admin/ContentModeration";
import PaymentManagement from "./pages/Admin/PaymentManagement";
import Analytics from "./pages/Admin/Analytics";
import AgeVerification from "./pages/Auth/AgeVerification";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import TermsOfService from "./pages/Legal/TermsOfService";
import AgeDisclaimer from "./pages/Legal/AgeDisclaimer";
import TestPage from "./pages/TestPage";
import GeolocationTest from "./components/GeolocationTest";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";

import AuthRouteProtechtion from "./components/AuthRouteProtechtion";
import OnlyAdminAllowed from "./components/OnlyAdminAllowed";
import OnlyEscortAllowed from "./components/OnlyEscortAllowed";
import OnlyClientAllowed from "./components/OnlyClientAllowed";
import CountryRedirect from "./components/CountryRedirect";
import OnlineStatus from "./components/OnlineStatus";

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <OnlineStatus />
        <BrowserRouter>
          <Routes>
            {/* Country-specific routes */}
            <Route
              path="/:countryCode"
              element={
                <CountryRedirect>
                  <Layout />
                </CountryRedirect>
              }
            >
              <Route index element={<Index />} />

              {/* Public Escort Directory Routes */}
              <Route path="escorts" element={<EscortList />} />
              <Route path="escort/list" element={<EscortList />} />
              <Route path="search" element={<SearchRedirect />} />
              <Route path="location/:city" element={<EscortList />} />
              <Route path="category/:category" element={<EscortList />} />

              {/* Authenticated Routes */}
              <Route element={<AuthRouteProtechtion />}>
                <Route path="profile" element={<Profile />} />

                {/* Client Routes */}
                <Route element={<OnlyClientAllowed />}>
                  <Route
                    path="client/dashboard"
                    element={<ClientDashboard />}
                  />
                  <Route path="client/favorites" element={<Favorites />} />
                  <Route path="client/bookings" element={<ComingSoonPage />} />
                  <Route path="client/messages" element={<Messages />} />
                  <Route
                    path="escort/registration"
                    element={<EscortRegistration />}
                  />
                </Route>

                {/* Escort Routes */}
                <Route element={<OnlyEscortAllowed />}>
                  <Route
                    path="escort/dashboard"
                    element={<EscortDashboard />}
                  />
                  <Route
                    path="escort/profile"
                    element={<EscortProfileEdit />}
                  />
                  <Route path="escort/messages" element={<Messages />} />
                  <Route path="escort/bookings" element={<ComingSoonPage />} />
                  <Route path="escort/reviews" element={<EscortReviews />} />
                  <Route path="escort/upgrade" element={<UpgradeProfile />} />
                  <Route path="victime/add" element={<AddBlog />} />
                  <Route path="victimes" element={<BlogDetails />} />
                  <Route path="victime/edit/:blogid" element={<EditBlog />} />
                  <Route path="hommages" element={<Comments />} />
                </Route>
              </Route>

              {/* Public Escort Profile Route - Must be AFTER authenticated routes */}
              <Route path="escort/:id" element={<EscortProfile />} />

              {/* Legal Pages */}
              <Route path="legal/privacy" element={<PrivacyPolicy />} />
              <Route path="legal/terms" element={<TermsOfService />} />
              <Route path="legal/age-disclaimer" element={<AgeDisclaimer />} />

              {/* Test Pages */}
              <Route path="test" element={<TestPage />} />
              <Route path="geolocation-test" element={<GeolocationTest />} />

              {/* Legacy Blog Routes (to be deprecated) */}
              <Route
                path="victimes/:sexe/:blog"
                element={<SingleBlogDetails />}
              />
              <Route path="victimes/:category" element={<BlogByCategory />} />

              {/* Admin Routes */}
              <Route element={<OnlyAdminAllowed />}>
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/users" element={<UserManagement />} />
                <Route
                  path="admin/moderation"
                  element={<ContentModeration />}
                />
                <Route path="admin/payments" element={<PaymentManagement />} />
                <Route path="admin/analytics" element={<Analytics />} />
                <Route
                  path="admin/upgrade-requests"
                  element={<UpgradeRequests />}
                />
                <Route path="admin/messages" element={<AdminMessages />} />
                <Route path="sexe/add" element={<AddCategory />} />
                <Route path="sexe" element={<CategoryDetails />} />
                <Route
                  path="sexe/edit/:category_id"
                  element={<EditCategory />}
                />
                <Route path="users" element={<User />} />
              </Route>
            </Route>

            {/* Auth Routes */}
            <Route path={RouteSignIn} element={<SignIn />} />
            <Route path={RouteSignUp} element={<SignUp />} />
            <Route path="age-verification" element={<AgeVerification />} />

            {/* Payment Routes */}
            <Route path="payment/success" element={<PaymentSuccess />} />
            <Route path="payment/failure" element={<PaymentFailure />} />

            {/* Root redirect with geolocation */}
            <Route
              path="/"
              element={
                <CountryRedirect>
                  <Layout />
                </CountryRedirect>
              }
            />

            {/* Fallback routes for direct access without country code */}
            {/* Main Pages */}
            <Route
              path="/escorts"
              element={<Navigate to="/ug/escorts" replace />}
            />
            <Route
              path="/escort/list"
              element={<Navigate to="/ug/escorts" replace />}
            />
            <Route
              path="/search"
              element={<Navigate to="/ug/search" replace />}
            />
            <Route
              path="/profile"
              element={<Navigate to="/ug/profile" replace />}
            />

            {/* Client Routes */}
            <Route
              path="/client/dashboard"
              element={<Navigate to="/ug/client/dashboard" replace />}
            />
            <Route
              path="/client/favorites"
              element={<Navigate to="/ug/client/favorites" replace />}
            />
            <Route
              path="/client/bookings"
              element={<Navigate to="/ug/client/bookings" replace />}
            />
            <Route
              path="/client/messages"
              element={<Navigate to="/ug/client/messages" replace />}
            />

            {/* Escort Routes */}
            <Route
              path="/escort/registration"
              element={<Navigate to="/ug/escort/registration" replace />}
            />
            <Route
              path="/escort/dashboard"
              element={<Navigate to="/ug/escort/dashboard" replace />}
            />
            <Route
              path="/escort/profile"
              element={<Navigate to="/ug/escort/profile" replace />}
            />
            <Route
              path="/escort/messages"
              element={<Navigate to="/ug/escort/messages" replace />}
            />
            <Route
              path="/escort/reviews"
              element={<Navigate to="/ug/escort/reviews" replace />}
            />
            <Route
              path="/escort/upgrade"
              element={<Navigate to="/ug/escort/upgrade" replace />}
            />
            <Route
              path="/escort/bookings"
              element={<Navigate to="/ug/escort/bookings" replace />}
            />
            <Route
              path="/escort/availability"
              element={<Navigate to="/ug/escort/availability" replace />}
            />
            <Route
              path="/escort/earnings"
              element={<Navigate to="/ug/escort/earnings" replace />}
            />
            <Route
              path="/escort/settings"
              element={<Navigate to="/ug/escort/settings" replace />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={<Navigate to="/ug/admin/dashboard" replace />}
            />
            <Route
              path="/admin/users"
              element={<Navigate to="/ug/admin/users" replace />}
            />
            <Route
              path="/admin/moderation"
              element={<Navigate to="/ug/admin/moderation" replace />}
            />
            <Route
              path="/admin/payments"
              element={<Navigate to="/ug/admin/payments" replace />}
            />
            <Route
              path="/admin/analytics"
              element={<Navigate to="/ug/admin/analytics" replace />}
            />
            <Route
              path="/admin/upgrade-requests"
              element={<Navigate to="/ug/admin/upgrade-requests" replace />}
            />
            <Route
              path="/admin/messages"
              element={<Navigate to="/ug/admin/messages" replace />}
            />

            {/* Category Routes */}
            <Route
              path="/category/in-call"
              element={<Navigate to="/ug/category/in-call" replace />}
            />
            <Route
              path="/category/out-call"
              element={<Navigate to="/ug/category/out-call" replace />}
            />
            <Route
              path="/category/massage"
              element={<Navigate to="/ug/category/massage" replace />}
            />
            <Route
              path="/category/gfe"
              element={<Navigate to="/ug/category/gfe" replace />}
            />
            <Route
              path="/category/pse"
              element={<Navigate to="/ug/category/pse" replace />}
            />
            <Route
              path="/category/travel"
              element={<Navigate to="/ug/category/travel" replace />}
            />
            <Route
              path="/category/overnight"
              element={<Navigate to="/ug/category/overnight" replace />}
            />
            <Route
              path="/category/duo"
              element={<Navigate to="/ug/category/duo" replace />}
            />
            <Route
              path="/category/dinner-date"
              element={<Navigate to="/ug/category/dinner-date" replace />}
            />
            <Route
              path="/category/weekend"
              element={<Navigate to="/ug/category/weekend" replace />}
            />
            <Route
              path="/category/party"
              element={<Navigate to="/ug/category/party" replace />}
            />
            <Route
              path="/category/companionship"
              element={<Navigate to="/ug/category/companionship" replace />}
            />
            <Route
              path="/category/bdsm"
              element={<Navigate to="/ug/category/bdsm" replace />}
            />
            <Route
              path="/category/role-play"
              element={<Navigate to="/ug/category/role-play" replace />}
            />
            <Route
              path="/category/fetish"
              element={<Navigate to="/ug/category/fetish" replace />}
            />
            <Route
              path="/category/couples"
              element={<Navigate to="/ug/category/couples" replace />}
            />

            {/* Location Routes */}
            <Route
              path="/location/kampala"
              element={<Navigate to="/ug/location/kampala" replace />}
            />
            <Route
              path="/location/entebbe"
              element={<Navigate to="/ug/location/entebbe" replace />}
            />
            <Route
              path="/location/jinja"
              element={<Navigate to="/ug/location/jinja" replace />}
            />
            <Route
              path="/location/mbarara"
              element={<Navigate to="/ug/location/mbarara" replace />}
            />
            <Route
              path="/location/gulu"
              element={<Navigate to="/ug/location/gulu" replace />}
            />
            <Route
              path="/location/arua"
              element={<Navigate to="/ug/location/arua" replace />}
            />
            <Route
              path="/location/mbale"
              element={<Navigate to="/ug/location/mbale" replace />}
            />
            <Route
              path="/location/soroti"
              element={<Navigate to="/ug/location/soroti" replace />}
            />
            <Route
              path="/location/lira"
              element={<Navigate to="/ug/location/lira" replace />}
            />
            <Route
              path="/location/tororo"
              element={<Navigate to="/ug/location/tororo" replace />}
            />
            <Route
              path="/location/kabale"
              element={<Navigate to="/ug/location/kabale" replace />}
            />
            <Route
              path="/location/masaka"
              element={<Navigate to="/ug/location/masaka" replace />}
            />
            <Route
              path="/location/mukono"
              element={<Navigate to="/ug/location/mukono" replace />}
            />
            <Route
              path="/location/kasese"
              element={<Navigate to="/ug/location/kasese" replace />}
            />
            <Route
              path="/location/hoima"
              element={<Navigate to="/ug/location/hoima" replace />}
            />
            <Route
              path="/location/fort-portal"
              element={<Navigate to="/ug/location/fort-portal" replace />}
            />
            <Route
              path="/location/iganga"
              element={<Navigate to="/ug/location/iganga" replace />}
            />
            <Route
              path="/location/bushenyi"
              element={<Navigate to="/ug/location/bushenyi" replace />}
            />
            <Route
              path="/location/kisoro"
              element={<Navigate to="/ug/location/kisoro" replace />}
            />
            <Route
              path="/location/kitgum"
              element={<Navigate to="/ug/location/kitgum" replace />}
            />

            {/* Legacy Routes */}
            <Route path="/sexe" element={<Navigate to="/ug/sexe" replace />} />
            <Route
              path="/sexe/add"
              element={<Navigate to="/ug/sexe/add" replace />}
            />
            <Route
              path="/victime/add"
              element={<Navigate to="/ug/victime/add" replace />}
            />
            <Route
              path="/victimes"
              element={<Navigate to="/ug/victimes" replace />}
            />
            <Route
              path="/hommages"
              element={<Navigate to="/ug/hommages" replace />}
            />
            <Route
              path="/users"
              element={<Navigate to="/ug/users" replace />}
            />

            {/* Legal Routes */}
            <Route
              path="/legal/privacy"
              element={<Navigate to="/ug/legal/privacy" replace />}
            />
            <Route
              path="/legal/terms"
              element={<Navigate to="/ug/legal/terms" replace />}
            />
            <Route
              path="/legal/age-disclaimer"
              element={<Navigate to="/ug/legal/age-disclaimer" replace />}
            />

            {/* Test Routes */}
            <Route path="/test" element={<Navigate to="/ug/test" replace />} />
            <Route
              path="/geolocation-test"
              element={<Navigate to="/ug/geolocation-test" replace />}
            />

            {/* Dynamic Routes - These need to be last to catch any remaining patterns */}
            <Route
              path="/escort/:id"
              element={<Navigate to="/ug/escort/:id" replace />}
            />
            <Route
              path="/location/:city"
              element={<Navigate to="/ug/location/:city" replace />}
            />
            <Route
              path="/category/:category"
              element={<Navigate to="/ug/category/:category" replace />}
            />
            <Route
              path="/sexe/edit/:category_id"
              element={<Navigate to="/ug/sexe/edit/:category_id" replace />}
            />
            <Route
              path="/victime/edit/:blogid"
              element={<Navigate to="/ug/victime/edit/:blogid" replace />}
            />
            <Route
              path="/victimes/:sexe/:blog"
              element={<Navigate to="/ug/victimes/:sexe/:blog" replace />}
            />
            <Route
              path="/victimes/:category"
              element={<Navigate to="/ug/victimes/:category" replace />}
            />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
