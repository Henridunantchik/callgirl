import EscortCard from "@/components/EscortCard";
import Loading from "@/components/Loading";
import { getEvn } from "@/helpers/getEnv";
import { useFetch } from "@/hooks/useFetch";
import { escortAPI, statsAPI } from "@/services/api";
import React, { useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEscorts, setTotalEscorts] = useState(0);
  const escortsPerPage = 24; // Show 24 escorts per page (4 rows of 6)

  // Debug logging
  console.log("=== HOME PAGE DEBUG ===");
  console.log("Escort data:", escortData);
  console.log("Loading:", loading);
  console.log("Error:", error);

  // Fetch escorts and stats on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching featured escorts and stats from API...");

        // Fetch escorts and stats in parallel with error handling
        const [escortsResponse, statsResponse] = await Promise.allSettled([
          escortAPI.getAllEscorts({
            featured: "true", // Use string "true" instead of boolean true
            countryCode: countryCode || "ug", // Add country code filter
            _t: Date.now(), // Cache busting parameter
          }),
          statsAPI.getGlobalStats(countryCode || "ug"),
        ]);

        // Handle escorts response
        if (escortsResponse.status === "fulfilled") {
          console.log("Escorts API response:", escortsResponse.value.data);
        } else {
          console.error("Error fetching escorts:", escortsResponse.reason);
          setError("Failed to load escorts");
          setLoading(false);
          return;
        }

        // Handle stats response
        if (statsResponse.status === "fulfilled") {
          console.log("Stats API response:", statsResponse.value.data);
        } else {
          console.error("Error fetching stats:", statsResponse.reason);
          // Don't set error for stats, it's not critical
        }

        // Filter and sort escort data
        let escorts =
          escortsResponse.value.data.data?.escorts || escortsResponse.value.data.data || [];

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
              _t: Date.now(),
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

        escorts = escorts.filter((escort) => {
          const accessLevel = getEscortAccessLevel(escort);
          const isFeatured = escort.isFeatured === true;
          const hasFeaturedTier =
            escort.subscriptionTier === "featured" ||
            escort.subscriptionTier === "premium";

          console.log(
            `Escort ${escort.name}: subscriptionTier=${escort.subscriptionTier}, isFeatured=${isFeatured}, accessLevel=${accessLevel}`
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
        setEscortData({ ...escortsResponse.value.data.data, escorts });
        setTotalEscorts(escorts.length);
        setTotalPages(Math.ceil(escorts.length / escortsPerPage));

        // Set stats data
        if (statsResponse.status === "fulfilled" && statsResponse.value.data?.data?.stats) {
          setStatsData(statsResponse.value.data.data.stats);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [countryCode]);

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
    const isAuthenticatedFromAnySource = userId || isUserAuthenticated || (token && storedUser);
    
    if (!isAuthenticatedFromAnySource) {
      console.log("No authentication found from any source, redirecting to login");
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
      console.log("Opening messenger for:", escort.alias);
      setSelectedEscort(escort);
      setIsMessengerOpen(true);
    }
    console.log("Contacting escort:", escort.alias, "via", method);
  };

  if (loading) return <Loading />;

  return (
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
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    asChild
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                  >
                    <Link to={`/${countryCode}/escort/registration`}>
                      <FaUserTie className="mr-2" />
                      Join as Escort
                    </Link>
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
                  onClick={() => handleFilterChange("online", !filters.online)}
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
            <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
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
          <Button size="lg" variant="secondary">
            Create Your Profile
          </Button>
        </CardContent>
      </Card>

      {/* Real-time Messenger */}
      <RealTimeMessenger
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        selectedEscort={selectedEscort}
      />
    </div>
  );
};

export default Index;
