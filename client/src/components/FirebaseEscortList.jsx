import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Crown,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";
import FirebaseEscortCard from "./FirebaseEscortCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const FirebaseEscortList = ({
  escorts = [],
  loading = false,
  className = "",
  onFavorite,
  onContact,
  onSearch,
  onFilter,
  showFilters = true,
  showSearch = true,
  itemsPerPage = 12,
  ...props
}) => {
  const [filteredEscorts, setFilteredEscorts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    subscriptionTier: "",
    rating: "",
    priceRange: "",
    services: [],
  });

  useEffect(() => {
    applyFiltersAndSearch();
  }, [escorts, searchTerm, filters]);

  const applyFiltersAndSearch = () => {
    let filtered = [...escorts];

    // Recherche par nom/alias
    if (searchTerm) {
      filtered = filtered.filter(
        (escort) =>
          (escort.alias &&
            escort.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (escort.name &&
            escort.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par localisation
    if (filters.location) {
      filtered = filtered.filter(
        (escort) =>
          escort.location &&
          escort.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filtre par niveau de subscription
    if (filters.subscriptionTier && filters.subscriptionTier !== "all") {
      filtered = filtered.filter(
        (escort) => escort.subscriptionTier === filters.subscriptionTier
      );
    }

    // Filtre par note
    if (filters.rating) {
      filtered = filtered.filter(
        (escort) => escort.rating && escort.rating >= parseFloat(filters.rating)
      );
    }

    // Filtre par prix
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      filtered = filtered.filter((escort) => {
        if (!escort.hourlyRate) return false;
        if (max) {
          return escort.hourlyRate >= min && escort.hourlyRate <= max;
        }
        return escort.hourlyRate >= min;
      });
    }

    setFilteredEscorts(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (onFilter) onFilter({ ...filters, [key]: value });
  };

  const handleResetFilters = () => {
    setFilters({
      location: "",
      subscriptionTier: "",
      rating: "",
      priceRange: "",
      services: [],
    });
    setSearchTerm("");
  };

  const totalPages = Math.ceil(filteredEscorts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEscorts = filteredEscorts.slice(startIndex, endIndex);

  const getSubscriptionStats = () => {
    const stats = {
      total: escorts.length,
      basic: escorts.filter(
        (e) => !e.subscriptionTier || e.subscriptionTier === "basic"
      ).length,
      premium: escorts.filter((e) => e.subscriptionTier === "premium").length,
      featured: escorts.filter((e) => e.subscriptionTier === "featured").length,
      vip: escorts.filter((e) => e.subscriptionTier === "vip").length,
    };
    return stats;
  };

  const subscriptionStats = getSubscriptionStats();

  if (loading) {
    return (
      <div className={`py-8 ${className}`} {...props}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-8 ${className}`} {...props}>
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête avec statistiques */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Découvrez nos escorts
          </h1>
          <p className="text-gray-600 mb-6">
            {filteredEscorts.length} escorts disponibles
          </p>

          {/* Statistiques des subscriptions */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
              <span>Basic: {subscriptionStats.basic}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span>Premium: {subscriptionStats.premium}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
              <span>Featured: {subscriptionStats.featured}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
              <span>VIP: {subscriptionStats.vip}</span>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        {(showSearch || showFilters) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Recherche */}
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher une escorte..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              {/* Filtre localisation */}
              {showFilters && (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Localisation..."
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              )}

              {/* Filtre subscription */}
              {showFilters && (
                <Select
                  value={filters.subscriptionTier}
                  onValueChange={(value) =>
                    handleFilterChange("subscriptionTier", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Filtre note */}
              {showFilters && (
                <Select
                  value={filters.rating}
                  onValueChange={(value) => handleFilterChange("rating", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Note minimum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les notes</SelectItem>
                    <SelectItem value="4.5">4.5+ étoiles</SelectItem>
                    <SelectItem value="4.0">4.0+ étoiles</SelectItem>
                    <SelectItem value="3.5">3.5+ étoiles</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Bouton reset */}
            {showFilters && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  size="sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Résultats */}
        {filteredEscorts.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucune escorte trouvée
            </h3>
            <p className="text-gray-500 mb-4">
              Essayez de modifier vos critères de recherche ou de réinitialiser
              les filtres.
            </p>
            <Button variant="outline" onClick={handleResetFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <>
            {/* Grille des escorts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentEscorts.map((escort) => (
                <FirebaseEscortCard
                  key={escort._id}
                  escort={escort}
                  onFavorite={onFavorite}
                  onContact={onContact}
                  className="h-full"
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>

                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FirebaseEscortList;
