import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Shield, 
  CheckCircle,
  Star,
  Heart
} from "lucide-react";
import { escortAPI } from "../../services/api";
import { showToast } from "../../helpers/showToast";
import { useAuth } from "../../contexts/AuthContext";

const EscortList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [escorts, setEscorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    age: searchParams.get("age") || "",
    services: searchParams.get("services") || "",
    priceRange: searchParams.get("priceRange") || "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEscorts();
  }, [searchTerm, filters]);

  const fetchEscorts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Fetching escorts with filters:", { searchTerm, filters });
      
      const params = {
        ...(searchTerm && { q: searchTerm }),
        ...(filters.location && { location: filters.location }),
        ...(filters.age && { age: filters.age }),
        ...(filters.services && { services: filters.services }),
        ...(filters.priceRange && { priceRange: filters.priceRange }),
      };
      
      const response = await escortAPI.getAllEscorts(params);
      console.log("✅ Escorts fetched:", response.data);
      
      if (response.data && response.data.escorts) {
        setEscorts(response.data.escorts);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where the response is an array directly
        setEscorts(response.data);
      } else {
        setEscorts([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch escorts:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load escorts";
      setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.set("q", searchTerm);
    if (filters.location) newParams.set("location", filters.location);
    if (filters.age) newParams.set("age", filters.age);
    if (filters.services) newParams.set("services", filters.services);
    if (filters.priceRange) newParams.set("priceRange", filters.priceRange);
    
    setSearchParams(newParams);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFavorite = (escortId) => {
    if (!user) {
      showToast("error", "Please log in to add favorites");
      navigate("/signin");
      return;
    }
    
    // TODO: Implement favorite functionality
    showToast("success", "Added to favorites!");
  };

  const handleEscortClick = (escortId) => {
    navigate(`/escort/${escortId}`);
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Escorts</h1>
          
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
              <Button type="submit">Search</Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <Input
                      placeholder="City or area"
                      value={filters.location}
                      onChange={(e) => handleFilterChange("location", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age Range
                    </label>
                    <select
                      value={filters.age}
                      onChange={(e) => handleFilterChange("age", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Any Age</option>
                      <option value="18-25">18-25</option>
                      <option value="26-35">26-35</option>
                      <option value="36-45">36-45</option>
                      <option value="46+">46+</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Services
                    </label>
                    <select
                      value={filters.services}
                      onChange={(e) => handleFilterChange("services", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Any Service</option>
                      <option value="in-call">In-call</option>
                      <option value="out-call">Out-call</option>
                      <option value="massage">Massage</option>
                      <option value="gfe">GFE</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range
                    </label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Any Price</option>
                      <option value="0-100">$0-$100</option>
                      <option value="100-200">$100-$200</option>
                      <option value="200-300">$200-$300</option>
                      <option value="300+">$300+</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results */}
        {error ? (
          <Card>
            <CardContent className="text-center p-6">
              <h2 className="text-xl font-semibold mb-2">Error Loading Escorts</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchEscorts}>Try Again</Button>
            </CardContent>
          </Card>
        ) : escorts.length === 0 ? (
          <Card>
            <CardContent className="text-center p-6">
              <h2 className="text-xl font-semibold mb-2">No Escorts Found</h2>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters.
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setFilters({});
                setSearchParams({});
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {escorts.map((escort) => (
              <Card 
                key={escort._id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleEscortClick(escort._id)}
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    {escort.gallery && escort.gallery.length > 0 ? (
                      <img
                        src={escort.gallery[0].url}
                        alt={escort.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Photo
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite(escort._id);
                      }}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    
                    {/* Verification Badge */}
                    {escort.isVerified && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg truncate">
                        {escort.name}
                      </h3>
                      {escort.subscriptionTier && escort.subscriptionTier !== "free" && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {escort.subscriptionTier}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {escort.location?.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{escort.location.city}</span>
                        </div>
                      )}
                      
                      {escort.age && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{escort.age} years old</span>
                        </div>
                      )}
                      
                      {escort.rates?.hourly && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>${escort.rates.hourly}/hour</span>
                        </div>
                      )}
                    </div>
                    
                    {escort.services && escort.services.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {escort.services.slice(0, 3).map((service, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                          {escort.services.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{escort.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EscortList;
