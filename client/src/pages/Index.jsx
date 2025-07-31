import EscortCard from "@/components/EscortCard";
import Loading from "@/components/Loading";
import { getEvn } from "@/helpers/getEnv";
import { useFetch } from "@/hooks/useFetch";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaStar,
  FaEye,
} from "react-icons/fa";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    ageMin: "",
    ageMax: "",
    verified: false,
    online: false,
  });

  const {
    data: escortData,
    loading,
    error,
  } = useFetch(`${getEvn("VITE_API_BASE_URL")}/escort/all`, {
    method: "get",
    credentials: "include",
  });

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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="City"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
              />
              <Input
                placeholder="Min Age"
                type="number"
                value={filters.ageMin}
                onChange={(e) => handleFilterChange("ageMin", e.target.value)}
              />
              <Input
                placeholder="Max Age"
                type="number"
                value={filters.ageMax}
                onChange={(e) => handleFilterChange("ageMax", e.target.value)}
              />
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
            {escortData.escorts.map((escort) => (
              <EscortCard key={escort._id} escort={escort} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                No escorts found. Try adjusting your search criteria.
              </div>
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
