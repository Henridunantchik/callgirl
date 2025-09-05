import React from "react";
import { Navigate } from "react-router-dom";
import { useGeolocation } from "../hooks/useGeolocation";
import { isValidCountryCode } from "../helpers/countries";

const CountryRedirect = ({ children }) => {
  const { countryCode, loading, error } = useGeolocation();

  // Choose a target country immediately without blocking the UI
  const fallbackCode = "ug";
  const targetCode = isValidCountryCode(countryCode)
    ? countryCode
    : fallbackCode;

  // If we're on the root path, redirect to country-specific path
  if (window.location.pathname === "/") {
    return <Navigate to={`/${targetCode}`} replace />;
  }

  // Check if current path has a valid country code
  const pathParts = window.location.pathname.split("/");
  const pathCountryCode = pathParts[1];

  if (pathCountryCode && isValidCountryCode(pathCountryCode)) {
    // Valid country code in URL, render children
    return children;
  }

  // Invalid or no country code, redirect to detected country
  return <Navigate to={`/${targetCode}`} replace />;
};

export default CountryRedirect;
