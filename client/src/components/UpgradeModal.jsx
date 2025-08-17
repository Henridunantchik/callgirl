import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { X, MessageCircle, Phone, Zap, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  currentPlan,
  onWhatsAppContact,
  onMessengerContact 
}) => {
  const [contactMethod, setContactMethod] = useState(null);
  const [formData, setFormData] = useState({
    escortName: "",
    escortPhone: "",
    escortEmail: "",
    paymentProof: "",
  });

  const plans = {
    featured: {
      title: "Featured",
      price: "$12",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-blue-500",
      description: "Plus de visibilité, contact visible, 3x plus de clients",
    },
    premium: {
      title: "Premium",
      price: "$5/mois",
      icon: <Crown className="h-6 w-6" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      description: "Visibilité maximale, badge verified, 5x plus de clients",
    },
  };

  const planData = plans[selectedPlan];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWhatsApp = () => {
    const message = `Bonjour! Je veux devenir ${planData.title}.

Nom: ${formData.escortName}
Téléphone: ${formData.escortPhone}
Email: ${formData.escortEmail}
Plan actuel: ${currentPlan}
Plan demandé: ${selectedPlan}
Prix: ${planData.price}`;

    const whatsappUrl = `https://wa.me/+1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleMessenger = () => {
    // Ici on enverrait la demande via la messagerie existante
    onMessengerContact({
      ...formData,
      requestedPlan: selectedPlan,
      contactMethod: "messenger",
    });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (contactMethod === "whatsapp") {
      handleWhatsApp();
    } else if (contactMethod === "messenger") {
      handleMessenger();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md mx-4"
          >
            <Card className="shadow-xl border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">
                    Devenir {planData.title}
                  </CardTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className={`w-12 h-12 rounded-full ${planData.color} text-white flex items-center justify-center`}>
                    {planData.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {planData.price}
                      {selectedPlan === "premium" && (
                        <span className="text-sm font-normal text-gray-500">/mois</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{planData.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="escortName">Nom complet</Label>
                    <Input
                      id="escortName"
                      name="escortName"
                      value={formData.escortName}
                      onChange={handleInputChange}
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="escortPhone">Téléphone</Label>
                    <Input
                      id="escortPhone"
                      name="escortPhone"
                      value={formData.escortPhone}
                      onChange={handleInputChange}
                      placeholder="Votre numéro de téléphone"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="escortEmail">Email</Label>
                    <Input
                      id="escortEmail"
                      name="escortEmail"
                      type="email"
                      value={formData.escortEmail}
                      onChange={handleInputChange}
                      placeholder="Votre email"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentProof">Preuve de paiement (optionnel)</Label>
                    <Textarea
                      id="paymentProof"
                      name="paymentProof"
                      value={formData.paymentProof}
                      onChange={handleInputChange}
                      placeholder="Collez ici le lien de la capture d'écran ou décrivez votre paiement"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Choisissez votre méthode de contact :</Label>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        type="button"
                        variant={contactMethod === "whatsapp" ? "default" : "outline"}
                        onClick={() => setContactMethod("whatsapp")}
                        className="justify-start h-auto p-4"
                      >
                        <Phone className="h-5 w-5 mr-3 text-green-500" />
                        <div className="text-left">
                          <div className="font-semibold">WhatsApp</div>
                          <div className="text-sm text-gray-600">
                            Contactez-nous directement sur WhatsApp
                          </div>
                        </div>
                      </Button>

                      <Button
                        type="button"
                        variant={contactMethod === "messenger" ? "default" : "outline"}
                        onClick={() => setContactMethod("messenger")}
                        className="justify-start h-auto p-4"
                      >
                        <MessageCircle className="h-5 w-5 mr-3 text-blue-500" />
                        <div className="text-left">
                          <div className="font-semibold">Messagerie</div>
                          <div className="text-sm text-gray-600">
                            Envoyez votre demande via notre messagerie
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={!contactMethod}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                    >
                      Envoyer la demande
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note :</strong> Après envoi de votre demande, nous vous 
                    fournirons les instructions de paiement. Une fois le paiement 
                    effectué, votre profil sera mis à jour dans les 24h.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
