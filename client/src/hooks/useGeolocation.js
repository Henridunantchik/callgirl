import { useState, useEffect } from "react";
import { isValidCountryCode } from "../helpers/countries";

export const useGeolocation = () => {
  const [countryCode, setCountryCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Try to get country from IP geolocation using a CORS-friendly approach
        const response = await fetch("https://ipapi.co/json/", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Map country codes to our supported countries
        const countryMapping = {
          UG: "ug",
          KE: "ke",
          TZ: "tz",
          RW: "rw",
          BI: "bi",
          CD: "cd", // Add DRC
        };

        const detectedCountry = countryMapping[data.country_code];

        if (detectedCountry && isValidCountryCode(detectedCountry)) {
          setCountryCode(detectedCountry);
        } else {
          // Default to Uganda if country not supported
          setCountryCode("ug");
        }
      } catch (err) {
        console.error("Error detecting location:", err);
        setError("Could not detect your location");
        // Default to Uganda on error
        setCountryCode("ug");
      } finally {
        setLoading(false);
      }
    };

    // Only run geolocation detection in production or if explicitly enabled
    if (
      import.meta.env.PROD ||
      import.meta.env.VITE_ENABLE_GEOLOCATION === "true"
    ) {
      detectCountry();
    } else {
      // In development, default to Uganda to avoid CORS issues
      setCountryCode("ug");
      setLoading(false);
    }
  }, []);

  return { countryCode, loading, error };
};
