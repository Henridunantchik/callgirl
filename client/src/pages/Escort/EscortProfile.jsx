import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Mail, 
  Shield, 
  Crown,
  Eye,
  Calendar,
  DollarSign,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Share2,
  Flag,
  Camera,
  Video,
  Info,
  Languages,
  Ruler,
  Scale,
  Palette,
  Eye as EyeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EscortProfile = () => {
  const { id } = useParams();
  const [escort, setEscort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMethod, setContactMethod] = useState('');

  // Mock data for demonstration
  const mockEscort = {
    _id: id,
    name: 'Sophia',
    alias: 'Sophia',
    age: 25,
    height: 165,
    weight: 55,
    bodyType: 'Slim',
    measurements: {
      bust: 34,
      waist: 24,
      hips: 34,
      cupSize: 'B'
    },
    languages: ['English', 'Spanish'],
    ethnicity: 'Caucasian',
    nationality: 'American',
    religion: 'Not specified',
    hairColor: 'Blonde',
    eyeColor: 'Blue',
    tattoos: false,
    piercings: true,
    smoking: false,
    drinking: 'Socially',
    location: { 
      city: 'New York', 
      area: 'Manhattan',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    isVerified: true,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    isActive: true,
    subscriptionPlan: 'premium',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
    bio: 'Hi there! I\'m Sophia, a professional and discreet companion who loves to make your time special. I\'m well-educated, well-traveled, and passionate about creating memorable experiences. I enjoy good conversation, fine dining, and ensuring your comfort and satisfaction. I\'m available for both in-call and out-call services, and I\'m happy to discuss your specific needs and preferences.',
    preferredClients: ['Men', 'Women', 'Couples'],
    services: ['In-call', 'Out-call', 'GFE', 'Massage', 'Dinner Date', 'Travel'],
    rates: {
      hourly: 300,
      halfDay: 800,
      overnight: 1500,
      weekend: 2500,
      travel: 500
    },
    availability: {
      schedule: {
        monday: { available: true, hours: '10:00-22:00' },
        tuesday: { available: true, hours: '10:00-22:00' },
        wednesday: { available: true, hours: '10:00-22:00' },
        thursday: { available: true, hours: '10:00-22:00' },
        friday: { available: true, hours: '10:00-23:00' },
        saturday: { available: true, hours: '10:00-23:00' },
        sunday: { available: false, hours: '' }
      },
      nextAvailable: new Date().toISOString()
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop', isPrivate: false, isWatermarked: false, order: 1 },
      { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop', isPrivate: false, isWatermarked: false, order: 2 },
      { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop', isPrivate: false, isWatermarked: false, order: 3 },
      { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop', isPrivate: true, isWatermarked: true, order: 4 },
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', isPrivate: true, isWatermarked: true, order: 5 }
    ],
    videos: [
      { url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', type: 'intro', isPrivate: false }
    ],
    verification: {
      idVerified: true,
      idDocument: 'verified',
      selfieVerified: true,
      videoVerified: true
    },
    contactOptions: {
      whatsapp: '+1234567890',
      telegram: '@sophia_escort',
      email: 'sophia@example.com',
      phone: '+1234567890'
    },
    settings: {
      allowMessages: true,
      requireVerification: true,
      showOnlineStatus: true,
      allowReviews: true
    },
    rating: 4.8,
    reviewCount: 127,
    stats: {
      profileViews: 15420,
      favorites: 892,
      responseRate: 98,
      responseTime: '5 minutes'
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEscort(mockEscort);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleContact = (method) => {
    setContactMethod(method);
    setShowContactModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getVerificationBadge = () => {
    if (escort?.verification?.idVerified && escort?.verification?.selfieVerified) {
      return (
        <Badge variant="default" className="bg-green-500 text-white">
          <Shield className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return null;
  };

  const getPremiumBadge = () => {
    if (escort?.subscriptionPlan === 'premium' || escort?.subscriptionPlan === 'vip') {
      return (
        <Badge variant="secondary" className="bg-yellow-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-96 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 rounded w-1/3"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!escort) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Escort Not Found</h2>
        <p className="text-gray-600 mb-6">The escort profile you're looking for doesn't exist or has been removed.</p>
        <Link to="/escorts">
          <Button>Browse All Escorts</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{escort.alias} - Escort Profile | Call Girls</title>
        <meta name="description" content={`Meet ${escort.alias}, a verified escort in ${escort.location.city}. ${escort.bio.substring(0, 150)}...`} />
        <meta property="og:title" content={`${escort.alias} - Escort Profile`} />
        <meta property="og:description" content={`Meet ${escort.alias}, a verified escort in ${escort.location.city}`} />
        <meta property="og:image" content={escort.gallery[0]?.url} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <Link to="/escorts" className="hover:text-gray-700">Escorts</Link>
            <span>/</span>
            <span className="text-gray-900">{escort.alias}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="relative">
                  {/* Main Image */}
                  <div className="relative h-96 overflow-hidden rounded-t-lg">
                    <img
                      src={escort.gallery[selectedImage]?.url || escort.avatar}
                      alt={escort.alias}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {getVerificationBadge()}
                      {getPremiumBadge()}
                    </div>

                    {/* Online Status */}
                    <div className="absolute top-4 right-4">
                      {escort.isOnline ? (
                        <Badge variant="outline" className="border-green-500 text-green-500 bg-white/90">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          Online
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-400 text-gray-400 bg-white/90">
                          <Clock className="w-3 h-3 mr-1" />
                          Last seen {new Date(escort.lastSeen).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 mt-12 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 hover:bg-white text-gray-700"
                        onClick={handleFavorite}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 hover:bg-white text-gray-700"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 hover:bg-white text-gray-700"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto">
                      {escort.gallery.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                            selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={`${escort.alias} - Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {image.isPrivate && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <EyeIcon className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews ({escort.reviewCount})</TabsTrigger>
                    <TabsTrigger value="rates">Rates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="gallery" className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {escort.gallery.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`${escort.alias} - Photo ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {image.isPrivate && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                              <div className="text-center text-white">
                                <EyeIcon className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm">Private Photo</p>
                                <p className="text-xs">Unlock with premium</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="about" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">About Me</h3>
                        <p className="text-gray-700 leading-relaxed">{escort.bio}</p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Physical Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{escort.height}cm</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{escort.weight}kg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{escort.hairColor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <EyeIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{escort.eyeColor}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Services</h3>
                        <div className="flex flex-wrap gap-2">
                          {escort.services.map((service, index) => (
                            <Badge key={index} variant="secondary">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Languages</h3>
                        <div className="flex items-center gap-2">
                          <Languages className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{escort.languages.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-500">{escort.rating}</div>
                            <div className="flex items-center justify-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(escort.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-gray-600">{escort.reviewCount} reviews</div>
                          </div>
                        </div>
                        <Button>Write a Review</Button>
                      </div>

                      <Separator />

                      {/* Mock Reviews */}
                      <div className="space-y-4">
                        {[1, 2, 3].map((review) => (
                          <div key={review} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                <span className="font-medium">Client {review}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm">
                              Amazing experience with {escort.alias}! She was professional, beautiful, and made me feel very comfortable. Highly recommended!
                            </p>
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(Date.now() - review * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="rates" className="p-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">Hourly</h4>
                                <p className="text-sm text-gray-600">1 hour session</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-600">
                                  {formatPrice(escort.rates.hourly)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">Half Day</h4>
                                <p className="text-sm text-gray-600">4 hours</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-600">
                                  {formatPrice(escort.rates.halfDay)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">Overnight</h4>
                                <p className="text-sm text-gray-600">8+ hours</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-600">
                                  {formatPrice(escort.rates.overnight)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">Weekend</h4>
                                <p className="text-sm text-gray-600">48 hours</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-green-600">
                                  {formatPrice(escort.rates.weekend)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Booking Information</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Deposit required for bookings over 2 hours</li>
                          <li>• Cancellation policy: 24 hours notice required</li>
                          <li>• Travel fee applies for out-call services</li>
                          <li>• Payment accepted: Cash, Credit Card, Crypto</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{escort.alias}</h1>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-gray-600">{escort.age} years old</span>
                    <span>•</span>
                    <span className="text-gray-600">{escort.location.city}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(escort.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {escort.rating} ({escort.reviewCount})
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{escort.stats.profileViews.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{escort.stats.favorites}</div>
                    <div className="text-xs text-gray-600">Favorites</div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Contact Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => handleContact('message')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleContact('call')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleContact('whatsapp')}
                  >
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(escort.availability.schedule).map(([day, schedule]) => (
                    <div key={day} className="flex justify-between items-center">
                      <span className="capitalize text-sm">{day}</span>
                      <span className="text-sm text-gray-600">
                        {schedule.available ? schedule.hours : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Always meet in public first</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Verify escort's identity</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use protection at all times</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Trust your instincts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default EscortProfile; 