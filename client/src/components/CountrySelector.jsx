import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SUPPORTED_COUNTRIES } from "../helpers/countries";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Globe } from "lucide-react";

const CountrySelector = () => {
  const { countryCode } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const currentCountry =
    SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES.ug;

  const handleCountryChange = (newCountryCode) => {
    // Get current path and replace country code
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split("/");

    if (pathParts.length > 1 && SUPPORTED_COUNTRIES[pathParts[1]]) {
      // Replace the country code in the path
      pathParts[1] = newCountryCode;
      navigate(pathParts.join("/"));
    } else {
      // If no country code in path, navigate to root of new country
      navigate(`/${newCountryCode}`);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentCountry.name}</span>
          <span className="sm:hidden">{countryCode?.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(SUPPORTED_COUNTRIES).map(([code, country]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleCountryChange(code)}
            className={`cursor-pointer ${
              code === countryCode ? "bg-blue-50 text-blue-700" : ""
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span>{country.name}</span>
              {code === countryCode && <span className="text-blue-600">✓</span>}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;
