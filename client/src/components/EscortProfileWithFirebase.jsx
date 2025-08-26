import React, { useState, useEffect } from "react";
import {
  Camera,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  Clock,
  Star,
} from "lucide-react";
import FirebaseFileUpload from "./FirebaseFileUpload";
import FirebaseMessaging from "./FirebaseMessaging";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";

const EscortProfileWithFirebase = ({
  escortId,
  currentUserId,
  escortData = {},
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showMessaging, setShowMessaging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Données d'exemple pour l'escort
  const escort = {
    id: escortId,
    name: escortData.name || "Sophia",
    age: escortData.age || 25,
    location: escortData.location || "Paris, France",
    rating: escortData.rating || 4.8,
    reviews: escortData.reviews || 127,
    description:
      escortData.description ||
      "Escort professionnelle et discrète, disponible pour des rencontres de qualité.",
    services: escortData.services || ["Massage", "Accompagnement", "VIP"],
    languages: escortData.languages || ["Français", "Anglais"],
    availability: escortData.availability || "24/7",
    hourlyRate: escortData.hourlyRate || 200,
    ...escortData,
  };

  const handleUploadComplete = (uploadedFile) => {
    setUploadedFiles((prev) => [...prev, uploadedFile]);
    console.log("Fichier uploadé:", uploadedFile);
  };

  const handleMessageSent = (message) => {
    console.log("Message envoyé:", message);
    // Ici vous pouvez ajouter une notification ou autre logique
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* En-tête du profil */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Photo de profil */}
          <div className="relative">
            <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-200">
              <img
                src={escort.avatar || "https://via.placeholder.com/200x200"}
                alt={escort.name}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              size="sm"
              className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>

          {/* Informations principales */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {escort.name}, {escort.age} ans
                </h1>
                <div className="flex items-center space-x-4 text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {escort.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {escort.availability}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="font-semibold">{escort.rating}</span>
                    <span className="text-gray-500 ml-1">
                      ({escort.reviews} avis)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  €{escort.hourlyRate}/h
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowMessaging(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contacter
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Favoris
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
            </div>

            {/* Services et langues */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Services proposés
                </h3>
                <div className="flex flex-wrap gap-2">
                  {escort.services.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Langues parlées
                </h3>
                <div className="flex flex-wrap gap-2">
                  {escort.languages.map((language, index) => (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="gallery">Galerie</TabsTrigger>
          <TabsTrigger value="reviews">Avis</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Onglet Profil */}
        <TabsContent value="profile" className="mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              À propos de {escort.name}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              {escort.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Informations personnelles
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div>
                    <span className="font-medium">Âge:</span> {escort.age} ans
                  </div>
                  <div>
                    <span className="font-medium">Localisation:</span>{" "}
                    {escort.location}
                  </div>
                  <div>
                    <span className="font-medium">Disponibilité:</span>{" "}
                    {escort.availability}
                  </div>
                  <div>
                    <span className="font-medium">Tarif:</span> €
                    {escort.hourlyRate}/heure
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Préférences
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div>
                    <span className="font-medium">Type de clientèle:</span> Tous
                    publics
                  </div>
                  <div>
                    <span className="font-medium">Environnement:</span>{" "}
                    Domicile, Hôtel
                  </div>
                  <div>
                    <span className="font-medium">Durée minimum:</span> 1 heure
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Galerie */}
        <TabsContent value="gallery" className="mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Galerie photos</h2>
              {currentUserId === escortId && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Ajouter des photos
                </Button>
              )}
            </div>

            {currentUserId === escortId && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Upload de photos</h3>
                <FirebaseFileUpload
                  onUploadComplete={handleUploadComplete}
                  folder="gallery"
                  maxFiles={10}
                  maxSize={5 * 1024 * 1024} // 5MB
                  acceptedTypes={["image/*"]}
                  showPreview={true}
                  multiple={true}
                  userId={escortId}
                />
              </div>
            )}

            {/* Affichage des photos existantes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-200"
                >
                  <img
                    src={file.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}

              {/* Photos d'exemple */}
              {uploadedFiles.length === 0 && (
                <>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img
                      src="https://via.placeholder.com/300x300"
                      alt="Photo 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img
                      src="https://via.placeholder.com/300x300"
                      alt="Photo 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img
                      src="https://via.placeholder.com/300x300"
                      alt="Photo 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Onglet Avis */}
        <TabsContent value="reviews" className="mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Avis clients</h2>
            <div className="space-y-4">
              {/* Avis d'exemple */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <span className="font-medium">Client anonyme</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="ml-1">5.0</span>
                  </div>
                </div>
                <p className="text-gray-700">
                  Excellente expérience avec {escort.name}. Professionnelle et
                  attentionnée. Je recommande vivement !
                </p>
                <div className="text-sm text-gray-500 mt-2">Il y a 2 jours</div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <span className="font-medium">Client anonyme</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="ml-1">4.5</span>
                  </div>
                </div>
                <p className="text-gray-700">
                  Très satisfait de la prestation. {escort.name} est ponctuelle
                  et respectueuse.
                </p>
                <div className="text-sm text-gray-500 mt-2">
                  Il y a 1 semaine
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Onglet Contact */}
        <TabsContent value="contact" className="mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Contacter {escort.name}</h2>

            {showMessaging ? (
              <div className="h-96">
                <FirebaseMessaging
                  currentUserId={currentUserId}
                  otherUserId={escortId}
                  otherUserName={escort.name}
                  otherUserAvatar={escort.avatar}
                  onMessageSent={handleMessageSent}
                  className="h-full"
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Démarrer une conversation
                </h3>
                <p className="text-gray-600 mb-6">
                  Cliquez sur le bouton "Contacter" pour commencer à discuter
                  avec {escort.name}
                </p>
                <Button
                  onClick={() => setShowMessaging(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Commencer à discuter
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EscortProfileWithFirebase;
