import { useState, useEffect } from "react";
import { isValidCountryCode } from "../helpers/countries";

export const useGeolocation = () => {
  const [countryCode, setCountryCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectCountry = async () => {
      // Add timeout to prevent hanging
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Geolocation timeout")), 5000)
      );

      try {
        // Try multiple geolocation services for better reliability
        let data = null;

        // Try ipinfo.io first (HTTPS, no CORS issues)
        try {
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
            data = await response.json();
            console.log("✅ Geolocation successful via ipinfo.io");
          }
        } catch (err) {
          console.log("ipinfo.io failed, trying backup service...");
        }

        // Backup: Try ipapi.co with HTTPS
        if (!data) {
          try {
            const response = await fetch("https://ipapi.co/json/", {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            });

            if (response.ok) {
              data = await response.json();
              console.log("✅ Geolocation successful via ipapi.co");
            }
          } catch (err) {
            console.log("ipapi.co failed, trying final backup...");
          }
        }

        // Final backup: Try ip-api.com with HTTPS
        if (!data) {
          try {
            const response = await fetch("https://ip-api.com/json/", {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            });

            if (response.ok) {
              data = await response.json();
              console.log("✅ Geolocation successful via ip-api.com");
            }
          } catch (err) {
            console.log("All geolocation services failed, using default...");
          }
        }

        if (!data) {
          throw new Error("All geolocation services failed");
        }

        // Map country codes to our supported countries (handle different formats)
        const countryMapping = {
          UG: "ug",
          KE: "ke",
          TZ: "tz",
          RW: "rw",
          BI: "bi",
          CD: "cd", // DRC
          // Handle lowercase codes too
          ug: "ug",
          ke: "ke",
          tz: "tz",
          rw: "rw",
          bi: "bi",
          cd: "cd",
        };

        // Try different possible country code fields
        const countryCode =
          data.country_code || data.country || data.countryCode;
        const detectedCountry = countryMapping[countryCode];

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

    // Run geolocation detection in production or if explicitly enabled
    // For development, also enable it for testing
    if (
      import.meta.env.PROD ||
      import.meta.env.VITE_ENABLE_GEOLOCATION === "true" ||
      import.meta.env.DEV
    ) {
      detectCountry();
    } else {
      // Default to Uganda if geolocation is disabled
      setCountryCode("ug");
      setLoading(false);
    }
  }, []);

  return { countryCode, loading, error };
};
