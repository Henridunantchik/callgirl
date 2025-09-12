import EscortCard from "@/components/EscortCard";
import { getEvn } from "@/helpers/getEnv";
import { useFetch } from "@/hooks/useFetch";
import { escortAPI, statsAPI } from "@/services/api";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { showToast } from "@/helpers/showToast";
import { RouteSignIn } from "@/helpers/RouteName";
import { getEscortAccessLevel } from "@/utils/escortAccess";
import { useParams } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaStar,
  FaEye,
  FaUserTie,
  FaCrown,
  FaShieldAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import RealTimeMessenger from "@/components/RealTimeMessenger";
import { Helmet } from "react-helmet-async";
import { getCountryByCode, getCitiesByCountry } from "@/helpers/countries";

const Index = () => {
  const { user, getUserId, isAuthenticated } = useAuth();
  const { countryCode } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    ageMin: "18",
    ageMax: "",
    gender: "",
    verified: false,
    online: false,
  });
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [selectedEscort, setSelectedEscort] = useState(null);

  // Fetch escort data from API
  const [escortData, setEscortData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEscorts, setTotalEscorts] = useState(0);
  const escortsPerPage = 24; // Show 24 escorts per page (4 rows of 6)
  const [prefetchedImages, setPrefetchedImages] = useState([]);

  // Debug logging
  console.log("=== HOME PAGE DEBUG ===");
  console.log("Escort data:", escortData);
  console.log("Loading:", loading);
  console.log("Error:", error);

  // Function to fetch escort data
  const fetchEscortData = React.useCallback(async () => {
    try {
      setLoading(true);
      // Fetch escorts first; stats will be fetched in background
      let escorts = [];
      let escortsResponseData = null;
      try {
        const escortsResp = await escortAPI.getAllEscorts({
          featured: "true",
          countryCode: countryCode || "ug",
        });
        escortsResponseData = escortsResp.data;
        escorts = escortsResp.data.data?.escorts || escortsResp.data.data || [];
      } catch (e) {
        console.error("Error fetching escorts:", e);
        setEscortData({ escorts: [] });
        setError("Failed to load escorts");
      }

      // Filter: Only Premium/Elite and Featured escorts
      console.log("All escorts before filtering:", escorts);

      // If no escorts found, try fetching all escorts and filter on frontend
      if (escorts.length === 0) {
        console.log(
          "No escorts found with featured filter, trying to fetch all escorts..."
        );
        try {
          const allEscortsResponse = await escortAPI.getAllEscorts({
            countryCode: countryCode || "ug",
            limit: 100, // Get more escorts to filter from
          });
          escorts =
            allEscortsResponse.data.data?.escorts ||
            allEscortsResponse.data.data ||
            [];
          console.log("All escorts fetched:", escorts);
        } catch (error) {
          console.error("Error fetching all escorts:", error);
        }
      }

      // Filter: Only Premium/Elite and Featured escorts
      escorts = escorts.filter((escort) => {
        const accessLevel = getEscortAccessLevel(escort);
        const isFeatured = escort.isFeatured === true;
        const hasFeaturedTier =
          escort.subscriptionTier === "featured" ||
          escort.subscriptionTier === "premium";

        console.log(
          `Escort ${escort.alias || escort.name}: subscriptionTier=${
            escort.subscriptionTier
          }, isFeatured=${isFeatured}, accessLevel=${accessLevel}`
        );

        return (
          accessLevel === "elite" ||
          accessLevel === "premium" ||
          accessLevel === "featured" ||
          isFeatured ||
          hasFeaturedTier
        );
      });
      console.log("Escorts after filtering:", escorts);

      // Sort: Premium/Elite first, then Featured
      escorts.sort((a, b) => {
        const aLevel = getEscortAccessLevel(a);
        const bLevel = getEscortAccessLevel(b);

        // Priority order: elite > premium > featured
        const priority = { elite: 3, premium: 2, featured: 1 };

        return priority[bLevel] - priority[aLevel]; // Higher priority first
      });

      // Set escort data with filtered and sorted results
      const baseData = escortsResponseData?.data || {};
      setEscortData({ ...baseData, escorts });
      setTotalEscorts(escorts.length);
      setTotalPages(Math.ceil(escorts.length / escortsPerPage));

      // Background fetch stats (do not block rendering)
      try {
        statsAPI
          .getCountryStats(countryCode || "ug")
          .then((resp) => {
            if (resp?.data?.data?.stats) {
              setStatsData(resp.data.data.stats);
            } else {
              // Use demo data if API returns empty stats
              console.log("Using demo stats for homepage");
              setStatsData({
                totalEscorts: 1,
                verifiedEscorts: 1,
                onlineEscorts: 1,
                featuredEscorts: 0,
                premiumEscorts: 0,
                citiesCovered: 1,
                topCities: [{ _id: "Kampala", escortCount: 1 }],
                countryCode: countryCode || "ug",
              });
            }
          })
          .catch((err) => {
            console.warn("Stats fetch failed:", err?.message);
            // Use demo data when API fails
            setStatsData({
              totalEscorts: 1,
              verifiedEscorts: 1,
              onlineEscorts: 1,
              featuredEscorts: 0,
              premiumEscorts: 0,
              citiesCovered: 1,
              topCities: [{ _id: "Kampala", escortCount: 1 }],
              countryCode: countryCode || "ug",
            });
          });
      } catch (error) {
        console.warn("Stats fetch error:", error?.message);
        // Use demo data when API fails
        setStatsData({
          totalEscorts: 1,
          verifiedEscorts: 1,
          onlineEscorts: 1,
          featuredEscorts: 0,
          premiumEscorts: 0,
          citiesCovered: 1,
          topCities: [{ _id: "Kampala", escortCount: 1 }],
          countryCode: countryCode || "ug",
        });
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [countryCode]);

  // Hydrate from session cache for instant paint, then revalidate
  React.useEffect(() => {
    let canceled = false;
    try {
      const cacheKey = `home_escorts_${countryCode || "ug"}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!canceled && parsed?.escorts?.length) {
          setEscortData(parsed);
          setTotalEscorts(parsed.escorts.length);
          setTotalPages(Math.ceil(parsed.escorts.length / escortsPerPage));
          setLoading(false);
        }
      }
    } catch {}

    fetchEscortData();

    // Save to cache whenever escorts change
    return () => {
      canceled = true;
    };
  }, [countryCode]);

  // Persist to session cache when escortData changes
  useEffect(() => {
    if (escortData?.escorts) {
      const cacheKey = `home_escorts_${countryCode || "ug"}`;
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(escortData));
      } catch {}
    }
  }, [escortData, countryCode]);

  // Note: Removed auto-refresh to prevent cards from reloading themselves
  // Online status will be updated through socket connections and user activity

  const handleSearch = (e) => {
    e.preventDefault();

    // Build search parameters
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (filters.city) params.set("city", filters.city);
    if (filters.ageMin) params.set("ageMin", filters.ageMin);
    if (filters.ageMax) params.set("ageMax", filters.ageMax);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.verified) params.set("verified", "true");
    if (filters.online) params.set("online", "true");

    // Navigate to escort list with search parameters
    const searchUrl = `/${countryCode}/escort/list?${params.toString()}`;
    window.location.href = searchUrl;
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCurrentPageEscorts = () => {
    if (!escortData?.escorts) return [];
    const startIndex = (currentPage - 1) * escortsPerPage;
    const endIndex = startIndex + escortsPerPage;
    return escortData.escorts.slice(startIndex, endIndex);
  };

  // Prefetch next slice of images to improve perceived speed
  useEffect(() => {
    if (!escortData?.escorts || escortData.escorts.length === 0) return;
    const startIndex = currentPage * escortsPerPage;
    const endIndex = startIndex + escortsPerPage;
    const nextSlice = escortData.escorts.slice(startIndex, endIndex);
    const urls = nextSlice
      .map((e) => e?.gallery?.[0]?.url)
      .filter(Boolean)
      .slice(0, 12); // cap prefetch count
    const imgs = urls.map((src) => {
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = src;
      return img;
    });
    setPrefetchedImages(imgs);
  }, [escortData?.escorts, currentPage]);

  const handleContact = (escort, method) => {
    console.log("=== CONTACT DEBUG (INDEX) ===");
    console.log("Escort data:", escort);
    console.log("Method:", method);
    console.log("Phone:", escort.phone);
    console.log("Alias:", escort.alias);
    console.log("Name:", escort.name);
    console.log("User object:", user);
    console.log("User type:", typeof user);
    console.log("User keys:", user ? Object.keys(user) : "No user");

    // Check authentication - try multiple sources
    const userId = getUserId(user);
    const isUserAuthenticated = isAuthenticated();
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("Extracted userId:", userId);
    console.log("isAuthenticated():", isUserAuthenticated);
    console.log("Token exists:", !!token);
    console.log("Stored user exists:", !!storedUser);

    // Check if user is authenticated from any source
    const isAuthenticatedFromAnySource =
      userId || isUserAuthenticated || (token && storedUser);

    if (!isAuthenticatedFromAnySource) {
      console.log(
        "No authentication found from any source, redirecting to login"
      );
      showToast("error", "Please sign in to contact escorts");
      navigate(RouteSignIn);
      return;
    }

    if (method === "call") {
      if (escort.phone) {
        // Copy phone number to clipboard
        navigator.clipboard.writeText(escort.phone);
        showToast(
          "success",
          `Phone number copied to clipboard: ${escort.phone}`
        );
      } else {
        showToast("error", "Phone number not available for this escort.");
      }
    } else if (method === "message") {
      // Open the floating messenger directly
      console.log("Opening messenger for:", escort.alias || escort.name);
      setSelectedEscort(escort);
      setIsMessengerOpen(true);
    }
    console.log(
      "Contacting escort:",
      escort.alias || escort.name,
      "via",
      method
    );
  };

  // Render immediately; show skeleton text where needed instead of blocking overlay
  // This avoids long spinner times on the home page

  // Get country and city information for SEO
  const countryInfo = getCountryByCode(countryCode || "ug");
  const cities = getCitiesByCountry(countryCode || "ug");
  const countryName = countryInfo?.name || "Uganda";
  const mainCity = cities[0] || "Kampala";

  return (
    <>
      <Helmet>
        <title>
          🔥 Epic Escorts - {countryName} Call Girls, Massage & GFE | Premium{" "}
          {mainCity} Escort Services | Book Now!
        </title>
        <meta
          name="description"
          content={`🔥 Epic Escorts - Find verified ${countryName} escorts, call girls & sexy companions in ${mainCity}! Premium escort services, sensual massage, girlfriend experience (GFE), dating & adult entertainment. 100% discreet, verified profiles, outcall/incall available. Book elite escorts, luxury companions & beautiful girls for dinner dates, travel, business trips. Browse ${
            escortData?.escorts?.length || 0
          }+ verified profiles. WhatsApp booking available! Best escort site in ${countryName}.`}
        />
        <meta
          name="keywords"
          content={`epic, epic escorts, epicescorts, epicescorts.live, epic escort, epic call girls, epic massage, epic companions, escort, escorts, call girl, call girls, ${countryName} escorts, ${mainCity} escorts, sexy girls, hot girls, beautiful girls, massage, massage service, sexy massage, erotic massage, sensual massage, girlfriend experience, GFE, companion, companionship, dating service, adult services, adult entertainment, intimate services, personal services, outcall, incall, travel companion, dinner date, business trip, weekend getaway, verified escort, premium escort, elite escort, high-class escort, luxury escort, discreet service, confidential service, private service, exclusive service, escort reviews, escort ratings, escort directory, escort listing, escort booking, ${mainCity} call girl, ${countryName} call girl, ${mainCity} girls, ${countryName} girls, ${mainCity} massage, ${countryName} massage, ${mainCity} dating, ${countryName} dating, find escort near me, escort service near me, local escort, local girls, best escort site, top escort website, escort platform, escort agency, hire escort, book escort, meet escort, contact escort, escort phone, whatsapp escort, telegram escort, escort chat, escort message, escort photos, escort gallery, escort videos, escort profile, African escort, East African escort, hookup ${mainCity}, dating ${countryName}, girls ${mainCity}, meet girls ${countryName}, find girls near me`}
        />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`🔥 Epic Escorts - ${countryName} Call Girls, Massage & GFE | Premium ${mainCity} Escort Services`}
        />
        <meta
          property="og:description"
          content={`🔥 Epic Escorts - Find verified ${countryName} escorts, call girls & sexy companions in ${mainCity}! Premium escort services, sensual massage, girlfriend experience (GFE), dating & adult entertainment. 100% discreet, verified profiles, outcall/incall available.`}
        />
        <meta
          property="og:url"
          content={`https://epicescorts.live/${countryCode || "ug"}`}
        />
        <meta property="og:site_name" content="Epic Escorts" />
        <meta
          property="og:image"
          content="https://epicescorts.live/og-image.jpg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`🔥 Epic Escorts - ${countryName} Call Girls, Massage & GFE | Premium ${mainCity} Escort Services`}
        />
        <meta
          name="twitter:description"
          content={`🔥 Epic Escorts - Find verified ${countryName} escorts, call girls & sexy companions in ${mainCity}! Premium escort services, sensual massage, girlfriend experience (GFE), dating & adult entertainment.`}
        />
        <meta
          name="twitter:image"
          content="https://epicescorts.live/og-image.jpg"
        />

        {/* Additional SEO */}
        <meta name="author" content="Epic Escorts" />
        <meta name="language" content="en" />
        <meta name="classification" content="adult entertainment" />
        <meta
          name="category"
          content="escort services, adult services, companions"
        />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="adult" />
        <meta name="revisit-after" content="1 days" />
        <meta name="geo.region" content="{countryCode?.toUpperCase()}" />
        <meta name="geo.placename" content="{mainCity}" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="msapplication-navbutton-color" content="#8B5CF6" />
        <meta name="apple-mobile-web-app-title" content="Epic Escorts" />
        <meta name="revisit-after" content="1 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="adult" />

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href={`https://epicescorts.live/${countryCode || "ug"}`}
        />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: `Epic Escorts - ${countryName} Escorts & Call Girls`,
            description: `Epic Escorts - Find verified ${countryName} escorts and call girls in ${mainCity}. Premium escort services, massage, companionship, and more.`,
            url: `https://epicescorts.live/${countryCode || "ug"}`,
            potentialAction: {
              "@type": "SearchAction",
              target: `https://epicescorts.live/${
                countryCode || "ug"
              }/search?q={{search_term_string}}`,
              "query-input": "required name=search_term_string",
            },
            publisher: {
              "@type": "Organization",
              name: "Epic Escorts",
              url: "https://epicescorts.live",
            },
          })}
        </script>
      </Helmet>

      <div className="space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Find Your Perfect Companion
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover verified escorts in your area. Safe, discreet, and
            professional.
          </p>
        </div>

        {/* Join as Escort CTA - Show for logged-in users who are not escorts */}
        {user && user.user && user.user.role !== "escort" && (
          <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
                    <FaUserTie className="text-white text-2xl" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Are You an Escort?
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Join our platform and connect with clients in your area. Get
                    verified, build your profile, and start earning today.
                  </p>
                  {!isAuthenticated && (
                    <p className="text-sm text-gray-500 mb-4">
                      You'll be redirected to sign in first, then back to
                      profile creation.
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                      onClick={() => {
                        if (isAuthenticated) {
                          // User is logged in, go directly to escort registration
                          window.location.href = `/${countryCode}/escort/registration`;
                        } else {
                          // User is not logged in, redirect to sign in with return URL
                          const returnUrl = encodeURIComponent(
                            `/${countryCode}/escort/registration`
                          );
                          window.location.href = `/${countryCode}/signin?returnUrl=${returnUrl}`;
                        }
                      }}
                    >
                      <FaUserTie className="mr-2" />
                      {isAuthenticated ? "Join as Escort" : "Sign In to Join"}
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/${countryCode}/escort/list`}>
                        <FaEye className="mr-2" />
                        See How It Works
                      </Link>
                    </Button>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaShieldAlt className="text-green-500" />
                      <span>Verified Profiles</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCrown className="text-yellow-500" />
                      <span>Premium Features</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUserTie className="text-blue-500" />
                      <span>Professional Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, location, or services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="px-6">
                  <FaSearch className="mr-2" />
                  Search
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                />
                <Input
                  placeholder="Min Age"
                  type="number"
                  min="18"
                  value={filters.ageMin}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 18 || e.target.value === "") {
                      handleFilterChange("ageMin", e.target.value);
                    }
                  }}
                />
                <Input
                  placeholder="Max Age"
                  type="number"
                  value={filters.ageMax}
                  onChange={(e) => handleFilterChange("ageMax", e.target.value)}
                />
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange("gender", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">All Genders</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="trans-female">Trans Female</option>
                  <option value="trans-male">Trans Male</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="other">Other</option>
                </select>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={filters.verified ? "default" : "outline"}
                    onClick={() =>
                      handleFilterChange("verified", !filters.verified)
                    }
                  >
                    Verified Only
                  </Button>
                  <Button
                    type="button"
                    variant={filters.online ? "default" : "outline"}
                    onClick={() =>
                      handleFilterChange("online", !filters.online)
                    }
                  >
                    Online Now
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {statsData?.totalEscorts || 0}
              </div>
              <div className="text-sm text-gray-600">Active Profiles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {statsData?.verifiedEscorts || 0}
              </div>
              <div className="text-sm text-gray-600">Verified Escorts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {statsData?.onlineEscorts || 0}
              </div>
              <div className="text-sm text-gray-600">Online Now</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {statsData?.citiesCovered || 0}
              </div>
              <div className="text-sm text-gray-600">Cities Covered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">
                {statsData?.featuredEscorts || 0}
              </div>
              <div className="text-sm text-gray-600">Featured</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {statsData?.premiumEscorts || 0}
              </div>
              <div className="text-sm text-gray-600">Premium</div>
            </CardContent>
          </Card>
        </div>

        {/* Escort Listings */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Premium & Featured Escorts</h2>
            <Button variant="outline" asChild>
              <Link to={`/${countryCode}/escort/list`}>
                <FaFilter className="mr-2" />
                View All Escorts
              </Link>
            </Button>
          </div>

          {escortData?.escorts && escortData.escorts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {console.log(
                  "Rendering escorts, count:",
                  getCurrentPageEscorts().length
                )}
                {getCurrentPageEscorts().map((escort) => {
                  console.log("Rendering escort:", escort);
                  return (
                    <EscortCard
                      key={escort._id}
                      escort={escort}
                      onContact={handleContact}
                    />
                  );
                })}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  {/* Results summary */}
                  <div className="text-center text-gray-600 mb-6">
                    <span className="font-medium text-gray-800">
                      Showing {(currentPage - 1) * escortsPerPage + 1} to{" "}
                      {Math.min(currentPage * escortsPerPage, totalEscorts)} of{" "}
                      {totalEscorts} escorts
                    </span>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center space-x-3">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
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
                      {Array.from(
                        { length: Math.min(totalPages, 7) },
                        (_, i) => {
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
                              className={`w-12 h-12 font-semibold ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg"
                                  : "hover:bg-gray-50 border-2"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
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
          ) : (
            (console.log("No escorts to render. escortData:", escortData),
            (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">
                    {loading
                      ? "Loading escorts..."
                      : error
                      ? `Error loading escorts: ${error.message}`
                      : escortData
                      ? `No escorts found. Total: ${escortData.total || 0}`
                      : "No escorts found. Try adjusting your search criteria."}
                  </div>
                  {error && (
                    <div className="mt-4 text-red-500 text-sm">
                      Debug: {JSON.stringify(error)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Are You an Escort?</h3>
            <p className="text-lg mb-6">
              Join our platform and reach thousands of potential clients. Create
              your profile today and start earning more.
            </p>
            {!isAuthenticated && (
              <p className="text-sm text-white/80 mb-4">
                You'll be redirected to sign in first, then back to profile
                creation.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  if (isAuthenticated) {
                    // User is logged in, go directly to escort registration
                    window.location.href = `/${countryCode}/escort/registration`;
                  } else {
                    // User is not logged in, redirect to sign in with return URL
                    const returnUrl = encodeURIComponent(
                      `/${countryCode}/escort/registration`
                    );
                    window.location.href = `/${countryCode}/signin?returnUrl=${returnUrl}`;
                  }
                }}
              >
                <FaUserTie className="mr-2" />
                {isAuthenticated ? "Create Your Profile" : "Sign In to Join"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-purple-600 hover:bg-gray-50"
                asChild
              >
                <Link to={`/${countryCode}/escort/list`}>
                  <FaEye className="mr-2" />
                  See Examples
                </Link>
              </Button>
            </div>
            <div className="flex justify-center gap-6 mt-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-green-300" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCrown className="text-yellow-300" />
                <span>Premium Features</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUserTie className="text-blue-300" />
                <span>24/7 Support</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Messenger */}
        <RealTimeMessenger
          isOpen={isMessengerOpen}
          onClose={() => setIsMessengerOpen(false)}
          selectedEscort={selectedEscort}
        />
      </div>
    </>
  );
};

export default Index;
