import React from "react";
import { Navigate } from "react-router-dom";
import { useGeolocation } from "../hooks/useGeolocation";
import { isValidCountryCode } from "../helpers/countries";
import Loading from "./Loading";

const CountryRedirect = ({ children }) => {
  const { countryCode, loading, error } = useGeolocation();

  if (loading) {
    return <Loading />;
  }

  // If we're on the root path, redirect to country-specific path
  if (window.location.pathname === "/") {
    return <Navigate to={`/${countryCode}`} replace />;
  }

  // Check if current path has a valid country code
  const pathParts = window.location.pathname.split("/");
  const pathCountryCode = pathParts[1];

  if (pathCountryCode && isValidCountryCode(pathCountryCode)) {
    // Valid country code in URL, render children
    return children;
  }

  // Invalid or no country code, redirect to detected country
  return <Navigate to={`/${countryCode}`} replace />;
};

export default CountryRedirect;
