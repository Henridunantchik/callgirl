import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  Car, 
  MapPin, 
  Phone, 
  CreditCard, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Share2
} from "lucide-react";
import { showToast } from "../helpers/showToast";
import { useAuth } from "../contexts/AuthContext";

const TransportPayment = ({ escort, onSuccess, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [transportData, setTransportData] = useState({
    escortId: escort?._id,
    city: "Kampala",
    pickupLocation: "",
    destinationLocation: "",
    paymentMethod: "M-PESA",
    senderPhone: user?.phoneNumber || "",
  });
  const [transportLink, setTransportLink] = useState("");
  const [amountBreakdown, setAmountBreakdown] = useState(null);

  // City rates
  const cityRates = {
    Kampala: { amount: 20000, currency: "UGX" },
    Nairobi: { amount: 1500, currency: "KES" },
    "Dar es Salaam": { amount: 5000, currency: "TZS" },
    Kigali: { amount: 2000, currency: "RWF" },
    Bujumbura: { amount: 5000, currency: "BIF" },
    Other: { amount: 20000, currency: "UGX" },
  };

  const handleInputChange = (field, value) => {
    setTransportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createTransportRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/transport/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(transportData),
      });

      const data = await response.json();

      if (data.success) {
        setTransportLink(data.data.transportLink);
        setAmountBreakdown(data.data.amountBreakdown);
        setStep(2);
        showToast("Transport request created successfully!", "success");
      } else {
        showToast(data.message || "Failed to create transport request", "error");
      }
    } catch (error) {
      console.error("Error creating transport request:", error);
      showToast("Failed to create transport request", "error");
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    setLoading(true);
    try {
      const transportId = transportLink.split("/").pop();
      const response = await fetch(`/api/transport/${transportId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to PesaPal payment page
        window.location.href = data.data.redirectUrl;
      } else {
        showToast(data.message || "Failed to process payment", "error");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      showToast("Failed to process payment", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyTransportLink = () => {
    navigator.clipboard.writeText(transportLink);
    showToast("Transport link copied to clipboard!", "success");
  };

  const shareTransportLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Transport Money Request",
        text: `Send transport money to ${escort?.firstName} ${escort?.lastName}`,
        url: transportLink,
      });
    } else {
      copyTransportLink();
    }
  };

  const currentRate = cityRates[transportData.city];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Send Transport Money
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            {/* Escort Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={escort?.profileImage || "/user.png"}
                alt={escort?.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold">
                  {escort?.firstName} {escort?.lastName}
                </h3>
                <p className="text-sm text-gray-600">{escort?.phoneNumber}</p>
              </div>
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select
                value={transportData.city}
                onValueChange={(value) => handleInputChange("city", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kampala">Kampala (20,000 UGX)</SelectItem>
                  <SelectItem value="Nairobi">Nairobi (1,500 KES)</SelectItem>
                  <SelectItem value="Dar es Salaam">Dar es Salaam (5,000 TZS)</SelectItem>
                  <SelectItem value="Kigali">Kigali (2,000 RWF)</SelectItem>
                  <SelectItem value="Bujumbura">Bujumbura (5,000 BIF)</SelectItem>
                  <SelectItem value="Other">Other (20,000 UGX)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Details */}
            <div className="space-y-2">
              <Label htmlFor="pickupLocation">Pickup Location</Label>
              <Textarea
                id="pickupLocation"
                placeholder="Enter pickup location"
                value={transportData.pickupLocation}
                onChange={(e) => handleInputChange("pickupLocation", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationLocation">Destination Location</Label>
              <Textarea
                id="destinationLocation"
                placeholder="Enter destination location"
                value={transportData.destinationLocation}
                onChange={(e) => handleInputChange("destinationLocation", e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={transportData.paymentMethod}
                onValueChange={(value) => handleInputChange("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M-PESA">M-PESA</SelectItem>
                  <SelectItem value="AIRTEL">Airtel Money</SelectItem>
                  <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                  <SelectItem value="VISA">VISA Card</SelectItem>
                  <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="senderPhone">Your Phone Number</Label>
              <Input
                id="senderPhone"
                type="tel"
                placeholder="Enter your phone number"
                value={transportData.senderPhone}
                onChange={(e) => handleInputChange("senderPhone", e.target.value)}
              />
            </div>

            {/* Amount Preview */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Transport Cost:</span>
                <span className="font-bold">
                  {currentRate.amount.toLocaleString()} {currentRate.currency}
                </span>
              </div>
            </div>

            <Button 
              onClick={createTransportRequest} 
              disabled={loading || !transportData.pickupLocation || !transportData.destinationLocation || !transportData.senderPhone}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Request...
                </>
              ) : (
                "Create Transport Request"
              )}
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Success Message */}
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Transport request created successfully!
              </span>
            </div>

            {/* Amount Breakdown */}
            {amountBreakdown && (
              <div className="space-y-2">
                <h4 className="font-semibold">Amount Breakdown:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Transport Cost:</span>
                    <span>{amountBreakdown.transportAmount.toLocaleString()} {currentRate.currency}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Commission (10%):</span>
                    <span>{amountBreakdown.platformCommission.toLocaleString()} {currentRate.currency}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>PesaPal Commission (3%):</span>
                    <span>{amountBreakdown.pesapalCommission.toLocaleString()} {currentRate.currency}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>{amountBreakdown.totalAmount.toLocaleString()} {currentRate.currency}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Escort Receives:</span>
                    <span>{amountBreakdown.escortAmount.toLocaleString()} {currentRate.currency}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Transport Link */}
            <div className="space-y-2">
              <Label>Transport Link</Label>
              <div className="flex gap-2">
                <Input
                  value={transportLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyTransportLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareTransportLink}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={processPayment}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </Button>
            </div>

            {/* Instructions */}
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">How it works:</h4>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Click "Pay Now" to proceed to PesaPal</li>
                <li>Enter your phone number (M-PESA/Airtel/MTN)</li>
                <li>You'll receive a confirmation SMS</li>
                <li>Enter your PIN to complete payment</li>
                <li>Transport money will be sent to the escort</li>
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransportPayment;
