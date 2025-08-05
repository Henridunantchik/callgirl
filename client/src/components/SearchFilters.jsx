import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import {
  Filter,
  MapPin,
  DollarSign,
  Users,
  Star,
  X,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SearchFilters = ({ filters, onFiltersChange, onReset }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const serviceOptions = [
    "In-call",
    "Out-call",
    "Massage",
    "GFE (Girlfriend Experience)",
    "PSE (Porn Star Experience)",
    "Duo",
    "Party",
    "Travel",
    "Dinner Date",
    "Overnight",
    "Weekend",
    "BDSM",
    "Role Play",
    "Fetish",
  ];

  const bodyTypeOptions = [
    "Slim",
    "Athletic",
    "Average",
    "Curvy",
    "Plus Size",
    "BBW",
    "Petite",
    "Tall",
  ];

  const ethnicityOptions = [
    "Asian",
    "Black",
    "Caucasian",
    "Hispanic",
    "Indian",
    "Middle Eastern",
    "Mixed",
    "Other",
  ];

  const hairColorOptions = [
    "Black",
    "Brown",
    "Blonde",
    "Red",
    "Brunette",
    "Auburn",
    "Gray",
    "Other",
  ];

  const eyeColorOptions = ["Brown", "Blue", "Green", "Hazel", "Gray", "Other"];

  const genderOptions = [
    "Female",
    "Male",
    "Trans Female",
    "Trans Male",
    "Non-Binary",
    "Other",
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Set default min age to 18 if not already set
  React.useEffect(() => {
    if (!filters.minAge) {
      handleFilterChange("minAge", "18");
    }
  }, []);

  const handleServiceToggle = (service) => {
    const currentServices = filters.services || [];
    const newServices = currentServices.includes(service)
      ? currentServices.filter((s) => s !== service)
      : [...currentServices, service];

    handleFilterChange("services", newServices);
  };

  const handleMultiSelectToggle = (key, value) => {
    const currentValues = filters[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    handleFilterChange(key, newValues);
  };

  const clearFilter = (key) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] &&
        (Array.isArray(filters[key])
          ? filters[key].length > 0
          : filters[key] !== "")
      ) {
        count++;
      }
    });
    return count;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="text-red-600 hover:text-red-700"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location Search */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="location"
              placeholder="Enter city or area..."
              value={filters.location || ""}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range (per hour)</Label>
          <div className="px-2">
            <Slider
              value={[filters.minPrice || 0, filters.maxPrice || 1000]}
              onValueChange={([min, max]) => {
                handleFilterChange("minPrice", min);
                handleFilterChange("maxPrice", max);
              }}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>${filters.minPrice || 0}</span>
              <span>${filters.maxPrice || 1000}</span>
            </div>
          </div>
        </div>

        {/* Age Range */}
        <div className="space-y-2">
          <Label>Age Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min age"
              min="18"
              value={filters.minAge || "18"}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 18 || e.target.value === "") {
                  handleFilterChange("minAge", e.target.value);
                }
              }}
            />
            <Input
              type="number"
              placeholder="Max age"
              value={filters.maxAge || ""}
              onChange={(e) => handleFilterChange("maxAge", e.target.value)}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Gender</Label>
          <div className="flex flex-wrap gap-2">
            {genderOptions.map((gender) => (
              <Badge
                key={gender}
                variant={
                  filters.genders?.includes(gender) ? "default" : "outline"
                }
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleMultiSelectToggle("genders", gender)}
              >
                {gender}
              </Badge>
            ))}
          </div>
        </div>

        {/* Verification Status */}
        <div className="space-y-2">
          <Label>Verification Status</Label>
          <div className="flex gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verified || false}
                onCheckedChange={(checked) =>
                  handleFilterChange("verified", checked)
                }
              />
              <Label htmlFor="verified" className="text-sm">
                Verified Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="online"
                checked={filters.online || false}
                onCheckedChange={(checked) =>
                  handleFilterChange("online", checked)
                }
              />
              <Label htmlFor="online" className="text-sm">
                Online Now
              </Label>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-2">
          <Label>Services</Label>
          <div className="flex flex-wrap gap-2">
            {serviceOptions.map((service) => (
              <Badge
                key={service}
                variant={
                  filters.services?.includes(service) ? "default" : "outline"
                }
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleServiceToggle(service)}
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Separator />

              {/* Body Type */}
              <div className="space-y-2">
                <Label>Body Type</Label>
                <div className="flex flex-wrap gap-2">
                  {bodyTypeOptions.map((type) => (
                    <Badge
                      key={type}
                      variant={
                        filters.bodyTypes?.includes(type)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleMultiSelectToggle("bodyTypes", type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Ethnicity */}
              <div className="space-y-2">
                <Label>Ethnicity</Label>
                <div className="flex flex-wrap gap-2">
                  {ethnicityOptions.map((ethnicity) => (
                    <Badge
                      key={ethnicity}
                      variant={
                        filters.ethnicities?.includes(ethnicity)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        handleMultiSelectToggle("ethnicities", ethnicity)
                      }
                    >
                      {ethnicity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div className="space-y-2">
                <Label>Hair Color</Label>
                <div className="flex flex-wrap gap-2">
                  {hairColorOptions.map((color) => (
                    <Badge
                      key={color}
                      variant={
                        filters.hairColors?.includes(color)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        handleMultiSelectToggle("hairColors", color)
                      }
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Eye Color */}
              <div className="space-y-2">
                <Label>Eye Color</Label>
                <div className="flex flex-wrap gap-2">
                  {eyeColorOptions.map((color) => (
                    <Badge
                      key={color}
                      variant={
                        filters.eyeColors?.includes(color)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() =>
                        handleMultiSelectToggle("eyeColors", color)
                      }
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Height Range */}
              <div className="space-y-2">
                <Label>Height Range (cm)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min height"
                    value={filters.minHeight || ""}
                    onChange={(e) =>
                      handleFilterChange("minHeight", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max height"
                    value={filters.maxHeight || ""}
                    onChange={(e) =>
                      handleFilterChange("maxHeight", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Languages</Label>
                <Select
                  value={filters.language || ""}
                  onValueChange={(value) =>
                    handleFilterChange("language", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                    <SelectItem value="russian">Russian</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="korean">Korean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="available-now"
                      checked={filters.availableNow || false}
                      onCheckedChange={(checked) =>
                        handleFilterChange("availableNow", checked)
                      }
                    />
                    <Label htmlFor="available-now" className="text-sm">
                      Available Now
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="same-day"
                      checked={filters.sameDay || false}
                      onCheckedChange={(checked) =>
                        handleFilterChange("sameDay", checked)
                      }
                    />
                    <Label htmlFor="same-day" className="text-sm">
                      Same Day
                    </Label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0))
                  return null;

                let displayValue = value;
                if (Array.isArray(value)) {
                  displayValue = value.join(", ");
                } else if (
                  key === "verified" ||
                  key === "online" ||
                  key === "availableNow" ||
                  key === "sameDay"
                ) {
                  displayValue = key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase());
                } else if (key === "minPrice" || key === "maxPrice") {
                  displayValue = `$${value}`;
                } else if (key === "minAge" || key === "maxAge") {
                  displayValue = `${value} years`;
                } else if (key === "minHeight" || key === "maxHeight") {
                  displayValue = `${value}cm`;
                }

                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {displayValue}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => clearFilter(key)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
