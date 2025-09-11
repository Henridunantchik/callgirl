import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Slider } from "../../components/ui/slider";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  Star,
  Heart,
  X,
  RefreshCw,
  Users,
  Eye,
  Clock,
  MessageCircle,
  Phone,
  Award,
} from "lucide-react";
import { escortAPI } from "../../services/api";
import { showToast } from "../../helpers/showToast";
import { useAuth } from "../../contexts/AuthContext";
import { RouteSignIn } from "../../helpers/RouteName";
import { debounce } from "lodash";
import FirebaseImageDisplay from "../../components/FirebaseImageDisplay";
import RealTimeMessenger from "../../components/RealTimeMessenger";
import {
  canShowContactInfo,
  canShowDetailedInfo,
  getEscortAccessLevel,
  getAccessLevelBadgeColor,
  getAccessLevelLabel,
} from "../../utils/escortAccess";

const EscortList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, getUserId } = useAuth();
  const { countryCode, city, category } = useParams();

  // Function to get currency symbol based on country
  const getCurrencySymbol = (countryCode) => {
    const currencies = {
      ug: "UGX",
      ke: "KES",
      tz: "TZS",
      rw: "RWF",
      bi: "BIF",
      cd: "CDF",
    };
    return currencies[countryCode?.toLowerCase()] || "USD";
  };

  const currencySymbol = getCurrencySymbol(countryCode);

  const [escorts, setEscorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    age: searchParams.get("age") || "",
    services: searchParams.get("services") || "",
    priceRange: searchParams.get("priceRange") || "",
    bodyType: searchParams.get("bodyType") || "",
    ethnicity: searchParams.get("ethnicity") || "",
    verified: searchParams.get("verified") === "true",
    online: searchParams.get("online") === "true",
    featured: searchParams.get("featured") === "true",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [escortsPerPage] = useState(36); // Show 36 escorts per page (6 rows of 6)
  const [sortBy, setSortBy] = useState("relevance");
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [selectedEscort, setSelectedEscort] = useState(null);

  // Simple in-memory cache for pages
  const pageCacheRef = useRef(new Map());
  const prefetchingRef = useRef(false);
  const sentinelRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm, filters) => {
      fetchEscorts(searchTerm, filters, 1, sortBy);
    }, 500),
    [sortBy]
  );

  // Initialize from URL params and route params
  useEffect(() => {
    const urlSearchTerm = searchParams.get("q") || "";

    // Handle route parameters (city and category from sidebar links)
    const routeLocation = city || searchParams.get("location") || "";
    const routeService = category || searchParams.get("services") || "";

    const urlFilters = {
      location: routeLocation,
      age: searchParams.get("age") || "",
      services: routeService,
      priceRange: searchParams.get("priceRange") || "",
      bodyType: searchParams.get("bodyType") || "",
      ethnicity: searchParams.get("ethnicity") || "",
      verified: searchParams.get("verified") === "true",
      online: searchParams.get("online") === "true",
      featured: searchParams.get("featured") === "true",
    };

    setSearchTerm(urlSearchTerm);
    setFilters(urlFilters);
    fetchEscorts(urlSearchTerm, urlFilters, 1, sortBy);
  }, [city, category]); // Re-run when route params change

  // Update URL when search or filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (filters.location && !city) params.set("location", filters.location);
    if (filters.age) params.set("age", filters.age);
    if (filters.services && !category) params.set("services", filters.services);
    if (filters.priceRange) params.set("priceRange", filters.priceRange);
    if (filters.bodyType) params.set("bodyType", filters.bodyType);
    if (filters.ethnicity) params.set("ethnicity", filters.ethnicity);
    if (filters.verified) params.set("verified", "true");
    if (filters.online) params.set("online", "true");
    if (filters.featured) params.set("featured", "true");

    setSearchParams(params);
  }, [searchTerm, filters, setSearchParams, city, category]);

  // Debounced search effect
  useEffect(() => {
    debouncedSearch(searchTerm, filters);
  }, [searchTerm, filters, debouncedSearch]);

  const fetchEscorts = async (
    search = searchTerm,
    filterParams = filters,
    page = 1,
    sort = sortBy
  ) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Fetching escorts with filters:", {
        search,
        filterParams,
        page,
      });

      const params = {
        page,
        limit: escortsPerPage,
        countryCode: countryCode || "ug", // Add country code filter
        sortBy: sort,
        ...(search && { q: search }),
        ...(filterParams.location && { city: filterParams.location }),
        ...(filterParams.age && { age: filterParams.age }),
        ...(filterParams.services && { service: filterParams.services }),
        ...(filterParams.priceRange && { priceRange: filterParams.priceRange }),
        ...(filterParams.bodyType && { bodyType: filterParams.bodyType }),
        ...(filterParams.ethnicity && { ethnicity: filterParams.ethnicity }),
        ...(filterParams.verified && { verified: true }),
        ...(filterParams.online && { online: true }),
        ...(filterParams.featured && { featured: true }),
      };

      const cacheKey = JSON.stringify({ params, sort });
      if (pageCacheRef.current.has(cacheKey)) {
        const cached = pageCacheRef.current.get(cacheKey);
        setEscorts(cached.escorts);
        setTotalResults(cached.totalResults);
        setCurrentPage(cached.currentPage);
        setTotalPages(cached.totalPages);
        return;
      }

      const response = await escortAPI.getAllEscorts(params);
      console.log("✅ Escorts fetched:", response.data);

      let escortData =
        response.data?.data?.escorts ||
        response.data?.escorts ||
        response.data ||
        [];
      const total =
        response.data?.data?.total || response.data?.total || escortData.length;

      // Sort escorts by priority: Premium/Elite > Featured > Basic
      if (sort === "relevance") {
        escortData.sort((a, b) => {
          // Get access levels
          const aLevel = getEscortAccessLevel(a);
          const bLevel = getEscortAccessLevel(b);

          // Priority order: elite > premium > featured > basic
          const priority = { elite: 4, premium: 3, featured: 2, basic: 1 };

          return priority[bLevel] - priority[aLevel]; // Higher priority first
        });
      }

      const computedTotalPages = Math.ceil(total / escortsPerPage);
      setEscorts(escortData);
      setTotalResults(total);
      setCurrentPage(page);
      setTotalPages(computedTotalPages);

      // Cache the result
      pageCacheRef.current.set(cacheKey, {
        escorts: escortData,
        totalResults: total,
        currentPage: page,
        totalPages: computedTotalPages,
        ts: Date.now(),
      });

      // Fire-and-forget prefetch of next page
      const nextPage = page + 1;
      if (nextPage <= computedTotalPages && !prefetchingRef.current) {
        prefetchingRef.current = true;
        const nextParams = { ...params, page: nextPage };
        const nextKey = JSON.stringify({ params: nextParams, sort });
        if (!pageCacheRef.current.has(nextKey)) {
          escortAPI
            .getAllEscorts(nextParams)
            .then((resp) => {
              const nextData =
                resp.data?.data?.escorts ||
                resp.data?.escorts ||
                resp.data ||
                [];
              const nextTotal =
                resp.data?.data?.total || resp.data?.total || nextData.length;
              pageCacheRef.current.set(nextKey, {
                escorts: nextData,
                totalResults: nextTotal,
                currentPage: nextPage,
                totalPages: Math.ceil(nextTotal / escortsPerPage),
                ts: Date.now(),
              });
            })
            .finally(() => {
              prefetchingRef.current = false;
            });
        } else {
          prefetchingRef.current = false;
        }
      }
    } catch (error) {
      console.error("❌ Failed to fetch escorts:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load escorts";
      setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Intersection observer to trigger prefetch when near bottom
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading) {
          const nextPage = currentPage + 1;
          if (nextPage <= totalPages) {
            // Touch cache by asking for next page; fetchEscorts will prefetch
            fetchEscorts(searchTerm, filters, currentPage, sortBy);
          }
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentPage, totalPages, loading, searchTerm, filters, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEscorts(searchTerm, filters, 1, sortBy);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleFilterToggle = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
    fetchEscorts(searchTerm, filters, 1, value);
  };

  // Pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchEscorts(searchTerm, filters, page, sortBy);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleContact = (escort, action) => {
    // Use the helper function to check authentication
    const userId = getUserId(user);

    if (!userId) {
      showToast("error", "Please sign in to contact escorts");
      navigate(RouteSignIn);
      return;
    }

    if (action === "message") {
      setSelectedEscort(escort);
      setIsMessengerOpen(true);
    } else if (action === "call") {
      if (escort.phone) {
        window.open(`tel:${escort.phone}`, "_blank");
      } else {
        showToast("error", "Phone number not available");
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      location: "",
      age: "",
      services: "",
      priceRange: "",
      bodyType: "",
      ethnicity: "",
      verified: false,
      online: false,
      featured: false,
    });
    setSortBy("relevance");
    setCurrentPage(1);

    // If we have route parameters, navigate back to the main escort list
    if (city || category) {
      navigate(`/${countryCode}/escort/list`);
    }
  };

  const handleFavorite = (escortId) => {
    if (!user) {
      showToast("error", "Please log in to add favorites");
      navigate(RouteSignIn);
      return;
    }

    // TODO: Implement favorite functionality
    showToast("success", "Added to favorites!");
  };

  const handleEscortClick = (escort) => {
    navigate(`/${countryCode}/escort/${escort.alias || escort.name}`);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.values(filters).forEach((value) => {
      if (
        value &&
        (typeof value === "string" ? value !== "" : value === true)
      ) {
        count++;
      }
    });
    return count;
  };

  if (loading && escorts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading escorts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {category
              ? `${(category?.[0] || "")?.toUpperCase() || ""}${
                  category?.slice?.(1) || ""
                } Escorts`
              : city
              ? `Escorts in ${(city?.[0] || "")?.toUpperCase() || ""}${
                  city?.slice?.(1) || ""
                }`
              : "Find Escorts"}
          </h1>
          {(category || city) && (
            <p className="text-gray-600 mb-4">
              {category && city
                ? `Showing ${category} escorts in ${city}`
                : category
                ? `Showing escorts offering ${category} services`
                : `Showing escorts in ${city}`}
            </p>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search escorts by name, location, or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Search"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </form>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (
                  value &&
                  (typeof value === "string" ? value !== "" : value === true)
                ) {
                  return (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {key}: {typeof value === "boolean" ? "Yes" : value}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          handleFilterChange(
                            key,
                            typeof value === "boolean" ? false : ""
                          )
                        }
                      />
                    </Badge>
                  );
                }
                return null;
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          )}

          {/* Enhanced Filters */}
          {showFilters && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Advanced Filters</span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location
                    </label>
                    <Input
                      placeholder="City or area"
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange("location", e.target.value)
                      }
                    />
                  </div>

                  {/* Age Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Age Range
                    </label>
                    <Select
                      value={filters.age}
                      onValueChange={(value) =>
                        handleFilterChange("age", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Age</SelectItem>
                        <SelectItem value="18-25">18-25</SelectItem>
                        <SelectItem value="26-35">26-35</SelectItem>
                        <SelectItem value="36-45">36-45</SelectItem>
                        <SelectItem value="46+">46+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Services */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="h-4 w-4 inline mr-1" />
                      Services
                    </label>
                    <Select
                      value={filters.services}
                      onValueChange={(value) =>
                        handleFilterChange("services", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Service</SelectItem>
                        <SelectItem value="in-call">In-call</SelectItem>
                        <SelectItem value="out-call">Out-call</SelectItem>
                        <SelectItem value="massage">Massage</SelectItem>
                        <SelectItem value="gfe">GFE</SelectItem>
                        <SelectItem value="pse">PSE</SelectItem>
                        <SelectItem value="duo">Duo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Price Range
                    </label>
                    <Select
                      value={filters.priceRange}
                      onValueChange={(value) =>
                        handleFilterChange("priceRange", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Price</SelectItem>
                        <SelectItem value="0-50000">
                          {currencySymbol} 0-50,000
                        </SelectItem>
                        <SelectItem value="50000-100000">
                          {currencySymbol} 50,000-100,000
                        </SelectItem>
                        <SelectItem value="100000-200000">
                          {currencySymbol} 100,000-200,000
                        </SelectItem>
                        <SelectItem value="200000+">
                          {currencySymbol} 200,000+
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Type
                    </label>
                    <Select
                      value={filters.bodyType}
                      onValueChange={(value) =>
                        handleFilterChange("bodyType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Body Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Body Type</SelectItem>
                        <SelectItem value="slim">Slim</SelectItem>
                        <SelectItem value="athletic">Athletic</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="curvy">Curvy</SelectItem>
                        <SelectItem value="plus-size">Plus Size</SelectItem>
                        <SelectItem value="bbw">BBW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ethnicity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ethnicity
                    </label>
                    <Select
                      value={filters.ethnicity}
                      onValueChange={(value) =>
                        handleFilterChange("ethnicity", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Ethnicity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Ethnicity</SelectItem>
                        <SelectItem value="african">African</SelectItem>
                        <SelectItem value="asian">Asian</SelectItem>
                        <SelectItem value="caucasian">Caucasian</SelectItem>
                        <SelectItem value="hispanic">Hispanic</SelectItem>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="middle-eastern">
                          Middle Eastern
                        </SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checkboxes */}
                  <div className="md:col-span-2 lg:col-span-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="verified"
                          checked={filters.verified}
                          onCheckedChange={() => handleFilterToggle("verified")}
                        />
                        <label
                          htmlFor="verified"
                          className="text-sm font-medium text-gray-700 flex items-center"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Verified Only
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="online"
                          checked={filters.online}
                          onCheckedChange={() => handleFilterToggle("online")}
                        />
                        <label
                          htmlFor="online"
                          className="text-sm font-medium text-gray-700 flex items-center"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Online Now
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="featured"
                          checked={filters.featured}
                          onCheckedChange={() => handleFilterToggle("featured")}
                        />
                        <label
                          htmlFor="featured"
                          className="text-sm font-medium text-gray-700 flex items-center"
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Featured Only
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? "Loading..." : `${totalResults} escorts found`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">
                  Priority (Premium → Featured → Basic)
                </SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {error ? (
          <Card>
            <CardContent className="text-center p-6">
              <h2 className="text-xl font-semibold mb-2">
                Error Loading Escorts
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchEscorts(searchTerm, filters, 1)}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : escorts.length === 0 && !loading ? (
          <Card>
            <CardContent className="text-center p-6">
              <h2 className="text-xl font-semibold mb-2">No Escorts Found</h2>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {escorts.map((escort) => (
                <Card
                  key={escort._id}
                  className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                  onClick={() => handleEscortClick(escort)}
                >
                  <CardContent className="p-0">
                    {/* Image - Moderately taller */}
                    <div className="relative h-64 bg-gray-200 overflow-hidden">
                      {escort.gallery && escort.gallery.length > 0 ? (
                        <FirebaseImageDisplay
                          src={
                            escort.gallery[0].url ||
                            escort.gallery[0].src ||
                            escort.avatar
                          }
                          alt={escort.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No Photo
                        </div>
                      )}

                      {/* Online Status */}
                      {escort.isOnline && (
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-green-500 text-white text-xs">
                            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                            Online
                          </Badge>
                        </div>
                      )}

                      {/* Only show tier badge (Featured/Premium) - not basic */}
                      {escort.subscriptionTier &&
                        escort.subscriptionTier !== "basic" && (
                          <div className="absolute top-2 left-2">
                            <Badge
                              variant="secondary"
                              className={`${getAccessLevelBadgeColor(
                                getEscortAccessLevel(escort)
                              )} text-white shadow-md text-xs`}
                            >
                              <Award className="h-3 w-3 mr-1" />
                              {getAccessLevelLabel(
                                getEscortAccessLevel(escort)
                              )}
                            </Badge>
                          </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      {/* Name and Age - Aligned like EscortCard */}
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {escort.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {escort.age} years
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">
                          {escort.location?.city || "Location not specified"}
                        </span>
                      </div>

                      {/* Services */}
                      {canShowDetailedInfo(escort) &&
                        escort.services &&
                        escort.services.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {escort.services
                              .slice(0, 3)
                              .map((service, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {service}
                                </Badge>
                              ))}
                            {escort.services.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{escort.services.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                      {/* Rating */}
                      {escort.rating && (
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(escort.rating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">
                            ({escort.reviewCount || 0} reviews)
                          </span>
                        </div>
                      )}

                      {/* Contact Buttons */}
                      <div
                        className="flex gap-2 mt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContact(escort, "message");
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        {canShowContactInfo(escort) ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContact(escort, "call");
                            }}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                        ) : // Only show premium access message to escorts (not clients)
                        user?.user?.role === "escort" ? (
                          <div className="flex-1 p-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                            <div className="text-center">
                              <p className="text-orange-600 text-xs font-medium">
                                Premium Required
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sentinel for prefetching when near bottom */}
            <div ref={sentinelRef} />

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                {/* Results summary */}
                <div className="text-center text-gray-600 mb-6">
                  <span className="font-medium text-gray-800">
                    Showing {(currentPage - 1) * escortsPerPage + 1} to{" "}
                    {Math.min(currentPage * escortsPerPage, totalResults)} of{" "}
                    {totalResults} escorts
                  </span>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center space-x-3">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="px-6 py-2 border-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex space-x-2">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        if (i === 0) pageNum = 1;
                        else if (i === 1) pageNum = currentPage - 1;
                        else if (i === 2) pageNum = currentPage;
                        else if (i === 3) pageNum = currentPage + 1;
                        else if (i === 4) pageNum = totalPages;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="lg"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`w-12 h-12 font-semibold ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg"
                              : "hover:bg-gray-50 border-2"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="px-6 py-2 border-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Button>
                </div>

                {/* Page Info */}
                <div className="text-center text-sm text-gray-500 mt-4">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Real-time Messenger */}
      <RealTimeMessenger
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        selectedEscort={selectedEscort}
      />
    </div>
  );
};

export default EscortList;
