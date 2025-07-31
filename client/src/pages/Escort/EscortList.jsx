import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import EscortCard from '../../components/EscortCard';
import SearchFilters from '../../components/SearchFilters';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
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
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EscortList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [escorts, setEscorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    minPrice: parseInt(searchParams.get('minPrice')) || 0,
    maxPrice: parseInt(searchParams.get('maxPrice')) || 1000,
    services: searchParams.get('services')?.split(',') || [],
    verified: searchParams.get('verified') === 'true',
    online: searchParams.get('online') === 'true',
  });

  // Mock data for demonstration
  const mockEscorts = [
    {
      _id: '1',
      name: 'Sophia',
      alias: 'Sophia',
      age: 25,
      height: 165,
      bodyType: 'Slim',
      ethnicity: 'Caucasian',
      location: { city: 'New York', area: 'Manhattan' },
      rates: { hourly: 300 },
      services: ['In-call', 'Out-call', 'GFE'],
      gallery: [
        { url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop', isPrivate: false }
      ],
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
      isOnline: true,
      isVerified: true,
      verification: { idVerified: true, selfieVerified: true },
      rating: 4.8,
      reviewCount: 127,
      subscriptionPlan: 'premium',
      lastSeen: new Date().toISOString(),
    },
    {
      _id: '2',
      name: 'Isabella',
      alias: 'Bella',
      age: 28,
      height: 170,
      bodyType: 'Curvy',
      ethnicity: 'Hispanic',
      location: { city: 'Los Angeles', area: 'Hollywood' },
      rates: { hourly: 400 },
      services: ['In-call', 'Massage', 'PSE'],
      gallery: [
        { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop', isPrivate: false }
      ],
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
      isOnline: false,
      isVerified: true,
      verification: { idVerified: true, selfieVerified: true },
      rating: 4.9,
      reviewCount: 89,
      subscriptionPlan: 'vip',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '3',
      name: 'Emma',
      alias: 'Emma',
      age: 23,
      height: 160,
      bodyType: 'Petite',
      ethnicity: 'Asian',
      location: { city: 'Miami', area: 'South Beach' },
      rates: { hourly: 350 },
      services: ['In-call', 'Out-call', 'Duo'],
      gallery: [
        { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop', isPrivate: false }
      ],
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
      isOnline: true,
      isVerified: false,
      verification: { idVerified: false, selfieVerified: false },
      rating: 4.5,
      reviewCount: 45,
      subscriptionPlan: 'standard',
      lastSeen: new Date().toISOString(),
    },
    {
      _id: '4',
      name: 'Olivia',
      alias: 'Liv',
      age: 26,
      height: 175,
      bodyType: 'Athletic',
      ethnicity: 'Black',
      location: { city: 'Chicago', area: 'Downtown' },
      rates: { hourly: 450 },
      services: ['In-call', 'Travel', 'Weekend'],
      gallery: [
        { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop', isPrivate: false }
      ],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
      isOnline: true,
      isVerified: true,
      verification: { idVerified: true, selfieVerified: true },
      rating: 4.7,
      reviewCount: 203,
      subscriptionPlan: 'premium',
      lastSeen: new Date().toISOString(),
    },
    {
      _id: '5',
      name: 'Ava',
      alias: 'Ava',
      age: 24,
      height: 168,
      bodyType: 'Average',
      ethnicity: 'Mixed',
      location: { city: 'Las Vegas', area: 'Strip' },
      rates: { hourly: 500 },
      services: ['In-call', 'Party', 'Overnight'],
      gallery: [
        { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', isPrivate: false }
      ],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      isOnline: false,
      isVerified: true,
      verification: { idVerified: true, selfieVerified: true },
      rating: 4.6,
      reviewCount: 156,
      subscriptionPlan: 'vip',
      lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '6',
      name: 'Mia',
      alias: 'Mia',
      age: 27,
      height: 172,
      bodyType: 'Curvy',
      ethnicity: 'Caucasian',
      location: { city: 'San Francisco', area: 'Mission' },
      rates: { hourly: 380 },
      services: ['In-call', 'Out-call', 'Dinner Date'],
      gallery: [
        { url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop', isPrivate: false }
      ],
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop',
      isOnline: true,
      isVerified: false,
      verification: { idVerified: false, selfieVerified: false },
      rating: 4.4,
      reviewCount: 78,
      subscriptionPlan: 'standard',
      lastSeen: new Date().toISOString(),
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEscorts(mockEscorts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 1000) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.services.length > 0) params.set('services', filters.services.join(','));
    if (filters.verified) params.set('verified', 'true');
    if (filters.online) params.set('online', 'true');
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearch = (searchTerm) => {
    // Implement search functionality
    console.log('Searching for:', searchTerm);
  };

  const handleFavorite = (escortId) => {
    // Implement favorite functionality
    console.log('Favorited escort:', escortId);
  };

  const handleContact = (escort, method) => {
    // Implement contact functionality
    console.log('Contacting escort:', escort.alias, 'via', method);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({
      location: '',
      minPrice: 0,
      maxPrice: 1000,
      services: [],
      verified: false,
      online: false,
    });
  };

  const sortEscorts = (escortList) => {
    switch (sortBy) {
      case 'price-low':
        return [...escortList].sort((a, b) => a.rates.hourly - b.rates.hourly);
      case 'price-high':
        return [...escortList].sort((a, b) => b.rates.hourly - a.rates.hourly);
      case 'rating':
        return [...escortList].sort((a, b) => b.rating - a.rating);
      case 'newest':
        return [...escortList].sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
      case 'online':
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

  return (
    <>
      <Helmet>
        <title>Escorts Directory - Call Girls</title>
        <meta name="description" content="Find verified escorts in your area. Browse profiles, read reviews, and book appointments safely and discreetly." />
        <meta name="keywords" content="escorts, call girls, adult services, verified profiles" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Companion
          </h1>
          <p className="text-gray-600">
            Browse verified escorts in your area. Safe, discreet, and professional.
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
                if (e.key === 'Enter') {
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
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
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
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
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
                <Button onClick={handleFiltersReset}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EscortList; 