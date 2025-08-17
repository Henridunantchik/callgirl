import React from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { Button } from "./ui/button";

const GeolocationTest = () => {
  const { countryCode, loading, error } = useGeolocation();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">🌍 Geolocation Test</h2>

      {loading && (
        <div className="text-blue-600">🔍 Detecting your location...</div>
      )}

      {error && <div className="text-red-600 mb-4">❌ Error: {error}</div>}

      {countryCode && (
        <div className="text-green-600 mb-4">
          ✅ Detected Country: <strong>{countryCode.toUpperCase()}</strong>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>This component shows the geolocation detection in real-time.</p>
        <p>
          If you're in a supported country, you should be redirected
          automatically.
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <Button
          onClick={() => (window.location.href = `/${countryCode || "ug"}`)}
          className="w-full"
        >
          Go to {countryCode || "ug"} Homepage
        </Button>

        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="w-full"
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
};

export default GeolocationTest;
