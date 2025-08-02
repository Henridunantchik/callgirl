import { useState, useEffect } from "react";
import { isValidCountryCode } from "../helpers/countries";

export const useGeolocation = () => {
  const [countryCode, setCountryCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Try to get country from IP geolocation
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        // Map country codes to our supported countries
        const countryMapping = {
          UG: "ug",
          KE: "ke",
          TZ: "tz",
          RW: "rw",
          BI: "bi",
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

    detectCountry();
  }, []);

  return { countryCode, loading, error };
};
