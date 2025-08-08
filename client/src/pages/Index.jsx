import EscortCard from "@/components/EscortCard";
import Loading from "@/components/Loading";
import { getEvn } from "@/helpers/getEnv";
import { useFetch } from "@/hooks/useFetch";
import { escortAPI } from "@/services/api";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
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

const Index = () => {
  const { user } = useAuth();
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

  // Fetch escort data from API
  const [escortData, setEscortData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logging
  console.log("=== HOME PAGE DEBUG ===");
  console.log("Escort data:", escortData);
  console.log("Loading:", loading);
  console.log("Error:", error);

  // Fetch escorts on component mount
  React.useEffect(() => {
    const fetchEscorts = async () => {
      try {
        setLoading(true);
        console.log("Fetching escorts from API...");
        const response = await escortAPI.getAllEscorts();
        console.log("API response:", response.data);
        setEscortData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching escorts:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEscorts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleContact = (escort, method) => {
    console.log("=== CONTACT DEBUG (INDEX) ===");
    console.log("Escort data:", escort);
    console.log("Method:", method);
    console.log("Phone:", escort.phone);
    console.log("Alias:", escort.alias);
    console.log("Name:", escort.name);

    if (method === "call") {
      if (escort.phone) {
        // Copy phone number to clipboard
        navigator.clipboard.writeText(escort.phone);
        alert(`Phone number copied to clipboard: ${escort.phone}`);
      } else {
        alert("Phone number not available for this escort.");
      }
    } else if (method === "message") {
      // Navigate to message page or open chat
      console.log("Opening message for:", escort.alias);
      // You can implement navigation to message page here
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {escortData?.total || 0}
            </div>
            <div className="text-sm text-gray-600">Active Profiles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {escortData?.escorts?.filter((e) => e.isVerified).length || 0}
            </div>
            <div className="text-sm text-gray-600">Verified Escorts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {escortData?.escorts?.filter((e) => e.isOnline).length || 0}
            </div>
            <div className="text-sm text-gray-600">Online Now</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {escortData?.escorts?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Cities Covered</div>
          </CardContent>
        </Card>
      </div>

      {/* Escort Listings */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Featured Escorts</h2>
          <Button variant="outline">
            <FaFilter className="mr-2" />
            Advanced Filters
          </Button>
        </div>

        {escortData && escortData.escorts && escortData.escorts.length > 0 ? (
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
            {escortData.escorts.map((escort) => {
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
        ) : (
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
    </div>
  );
};

export default Index;
