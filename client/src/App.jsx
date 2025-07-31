//client/src/App.jsx

import React from "react";
import { Button } from "./components/ui/button";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./Layout/Layout";
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
import EscortRegistration from "./pages/Escort/EscortRegistration";
import EscortDashboard from "./pages/Escort/EscortDashboard";
import ClientDashboard from "./pages/Client/ClientDashboard";
import Favorites from "./pages/Client/Favorites";
import Bookings from "./pages/Client/Bookings";
import Messages from "./pages/Client/Messages";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import ContentModeration from "./pages/Admin/ContentModeration";
import PaymentManagement from "./pages/Admin/PaymentManagement";
import Analytics from "./pages/Admin/Analytics";
import AgeVerification from "./pages/Auth/AgeVerification";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import TermsOfService from "./pages/Legal/TermsOfService";
import AgeDisclaimer from "./pages/Legal/AgeDisclaimer";

import AuthRouteProtechtion from "./components/AuthRouteProtechtion";
import OnlyAdminAllowed from "./components/OnlyAdminAllowed";
import OnlyEscortAllowed from "./components/OnlyEscortAllowed";
import OnlyClientAllowed from "./components/OnlyClientAllowed";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={RouteIndex} element={<Layout />}>
          <Route index element={<Index />} />

          {/* Public Escort Directory Routes */}
          <Route path="/escorts" element={<EscortList />} />
          <Route path="/escort/:id" element={<EscortProfile />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/location/:city" element={<EscortList />} />
          <Route path="/category/:category" element={<EscortList />} />

          {/* Legal Pages */}
          <Route path="/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms" element={<TermsOfService />} />
          <Route path="/legal/age-disclaimer" element={<AgeDisclaimer />} />

          {/* Legacy Blog Routes (to be deprecated) */}
          <Route path={RouteBlogDetails()} element={<SingleBlogDetails />} />
          <Route path={RouteBlogByCategory()} element={<BlogByCategory />} />
          <Route path={RouteSearch()} element={<SearchResult />} />

          {/* Authenticated Routes */}
          <Route element={<AuthRouteProtechtion />}>
            <Route path={RouteProfile} element={<Profile />} />

            {/* Client Routes */}
            <Route element={<OnlyClientAllowed />}>
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/favorites" element={<Favorites />} />
              <Route path="/client/bookings" element={<Bookings />} />
              <Route path="/client/messages" element={<Messages />} />
            </Route>

            {/* Escort Routes */}
            <Route element={<OnlyEscortAllowed />}>
              <Route path="/escort/dashboard" element={<EscortDashboard />} />
              <Route
                path="/escort/registration"
                element={<EscortRegistration />}
              />
              <Route path={RouteBlogAdd} element={<AddBlog />} />
              <Route path={RouteBlog} element={<BlogDetails />} />
              <Route path={RouteBlogEdit()} element={<EditBlog />} />
              <Route path={RouteCommentDetails} element={<Comments />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<OnlyAdminAllowed />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/moderation" element={<ContentModeration />} />
            <Route path="/admin/payments" element={<PaymentManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path={RouteAddCategory} element={<AddCategory />} />
            <Route path={RouteCategoryDetails} element={<CategoryDetails />} />
            <Route path={RouteEditCategory()} element={<EditCategory />} />
            <Route path={RouteUser} element={<User />} />
          </Route>
        </Route>

        {/* Auth Routes */}
        <Route path={RouteSignIn} element={<SignIn />} />
        <Route path={RouteSignUp} element={<SignUp />} />
        <Route path="/age-verification" element={<AgeVerification />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
