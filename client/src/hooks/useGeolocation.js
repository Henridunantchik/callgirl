import { useState, useEffect } from "react";
import { isValidCountryCode } from "../helpers/countries";

export const useGeolocation = () => {
  const [countryCode, setCountryCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectCountry = async () => {
      // For development, skip geolocation and use default
      if (import.meta.env.DEV) {
        setCountryCode("ug");
        setLoading(false);
        return;
      }

      // Add timeout to prevent hanging
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Geolocation timeout")), 3000)
      );

      try {
        // Try ipinfo.io first (HTTPS, no CORS issues)
        const response = await Promise.race([
          fetch("https://ipinfo.io/json", {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }),
          timeout,
        ]);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Geolocation successful via ipinfo.io");

          // Map country codes to our supported countries
          const countryMapping = {
            UG: "ug",
            KE: "ke",
            TZ: "tz",
            RW: "rw",
            BI: "bi",
            CD: "cd",
            ug: "ug",
            ke: "ke",
            tz: "tz",
            rw: "rw",
            bi: "bi",
            cd: "cd",
          };

          const detectedCountry = countryMapping[data.country];
          if (detectedCountry && isValidCountryCode(detectedCountry)) {
            setCountryCode(detectedCountry);
          } else {
            setCountryCode("ug");
          }
        } else {
          throw new Error("Geolocation service failed");
        }
      } catch (err) {
        console.log("Geolocation failed, using default Uganda");
        setError("Could not detect your location");
        setCountryCode("ug");
      } finally {
        setLoading(false);
      }
    };

    // Only run geolocation in production
    if (import.meta.env.PROD) {
      detectCountry();
    } else {
      // Default to Uganda in development
      setCountryCode("ug");
      setLoading(false);
    }
  }, []);

  return { countryCode, loading, error };
};
