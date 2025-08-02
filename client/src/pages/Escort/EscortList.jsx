import React, { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import EscortCard from "../../components/EscortCard";
import SearchFilters from "../../components/SearchFilters";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { escortAPI, favoriteAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { getCountryByCode } from "../../helpers/countries";
import {
  Search,
  MapPin,
  Grid,
  List,
  Filter,
  SortAsc,
  SortDesc,
  Heart,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EscortList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { countryCode } = useParams();
  const [escorts, setEscorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    minPrice: parseInt(searchParams.get("minPrice")) || 0,
    maxPrice: parseInt(searchParams.get("maxPrice")) || 1000,
    services: searchParams.get("services")?.split(",") || [],
    verified: searchParams.get("verified") === "true",
    online: searchParams.get("online") === "true",
  });

  const { user } = useAuth();

  // Fetch escorts from API
  useEffect(() => {
    const fetchEscorts = async () => {
      try {
        setLoading(true);
        const params = {
          ...filters,
          country: countryCode,
          sortBy,
          limit: 50,
        };

        const response = await escortAPI.getAllEscorts(params);
        setEscorts(response.data.escorts || []);
      } catch (error) {
        console.error("Error fetching escorts:", error);
        // Fallback to mock data if API fails
        setEscorts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEscorts();
  }, [filters, sortBy, countryCode]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filters.location) params.set("location", filters.location);
    if (filters.minPrice > 0)
      params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice < 1000)
      params.set("maxPrice", filters.maxPrice.toString());
    if (filters.services.length > 0)
      params.set("services", filters.services.join(","));
    if (filters.verified) params.set("verified", "true");
    if (filters.online) params.set("online", "true");

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearch = (searchTerm) => {
    // Implement search functionality
    console.log("Searching for:", searchTerm);
  };

  const handleFavorite = async (escortId) => {
    try {
      if (user) {
        await favoriteAPI.addToFavorites(escortId);
        // Update the escort's favorited status in the list
        setEscorts((prev) =>
          prev.map((escort) =>
            escort._id === escortId
              ? { ...escort, isFavorited: !escort.isFavorited }
              : escort
          )
        );
      } else {
        // Redirect to login if not authenticated
        window.location.href = "/signin";
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleContact = (escort, method) => {
    // Implement contact functionality
    console.log("Contacting escort:", escort.alias, "via", method);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({
      location: "",
      minPrice: 0,
      maxPrice: 1000,
      services: [],
      verified: false,
      online: false,
    });
  };

  const sortEscorts = (escortList) => {
    switch (sortBy) {
      case "price-low":
        return [...escortList].sort((a, b) => a.rates.hourly - b.rates.hourly);
      case "price-high":
        return [...escortList].sort((a, b) => b.rates.hourly - a.rates.hourly);
      case "rating":
        return [...escortList].sort((a, b) => b.rating - a.rating);
      case "newest":
        return [...escortList].sort(
          (a, b) => new Date(b.lastSeen) - new Date(a.lastSeen)
        );
      case "online":
        return [...escortList].sort((a, b) => b.isOnline - a.isOnline);
      default:
        return escortList;
    }
  };

  const filteredAndSortedEscorts = sortEscorts(escorts);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const countryInfo = getCountryByCode(countryCode);

  return (
    <>
      <Helmet>
        <title>
          {countryInfo ? `Escorts in ${countryInfo.name}` : "Escorts Directory"}{" "}
          - Call Girls
        </title>
        <meta
          name="description"
          content={`Find verified escorts in ${
            countryInfo?.name || "your area"
          }. Browse profiles, read reviews, and book appointments safely and discreetly.`}
        />
        <meta
          name="keywords"
          content="escorts, call girls, adult services, verified profiles"
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {countryInfo
              ? `Escorts in ${countryInfo.name}`
              : "Find Your Perfect Companion"}
          </h1>
          <p className="text-gray-600">
            Browse verified escorts in {countryInfo?.name || "your area"}. Safe,
            discreet, and professional.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name, location, or services..."
              className="pl-10 pr-4 py-3 text-lg"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch(e.target.value);
                }
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{escorts.length}</div>
              <div className="text-sm text-gray-600">Active Escorts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">4.7</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">98%</div>
              <div className="text-sm text-gray-600">Verified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">2.5k+</div>
              <div className="text-sm text-gray-600">Happy Clients</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleFiltersReset}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {filteredAndSortedEscorts.length} escorts found
                </h2>
                {filters.location && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {filters.location}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="online">Online Now</option>
                  <option value="newest">Newest</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <AnimatePresence>
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredAndSortedEscorts.map((escort) => (
                  <EscortCard
                    key={escort._id}
                    escort={escort}
                    onFavorite={handleFavorite}
                    onContact={handleContact}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* No Results */}
            {filteredAndSortedEscorts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Users className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No escorts found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={handleFiltersReset}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EscortList;
