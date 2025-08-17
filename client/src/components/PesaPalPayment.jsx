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
import { paymentAPI } from "../services/api";
import { showToast } from "../helpers/showToast";
import { Loader2, CreditCard, Smartphone, Building } from "lucide-react";

const PesaPalPayment = ({
  amount,
  currency = "USD",
  bookingId,
  onSuccess,
  onFailure,
  type = "booking",
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pesapal");

  const handlePayment = async () => {
    if (!amount || amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        bookingId,
        paymentMethod,
        type,
      };

      const response = await paymentAPI.createPaymentIntent(paymentData);

      if (response.data.success) {
        const { redirectUrl, orderId } = response.data.data;

        // Store order ID in localStorage for status checking
        localStorage.setItem("pesapal_order_id", orderId);

        // Redirect to PesaPal payment page
        window.location.href = redirectUrl;
      } else {
        showToast("Failed to create payment order", "error");
        onFailure && onFailure("Failed to create payment order");
      }
    } catch (error) {
      console.error("Payment creation error:", error);
      showToast(
        error.response?.data?.message || "Payment creation failed",
        "error"
      );
      onFailure && onFailure("Payment creation failed");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (orderId) => {
    try {
      const response = await paymentAPI.checkPesaPalStatus(orderId);

      if (response.data.success) {
        const { status } = response.data.data;

        if (status === "completed") {
          showToast("Payment completed successfully!", "success");
          onSuccess && onSuccess(response.data.data);
        } else if (status === "failed") {
          showToast("Payment failed", "error");
          onFailure && onFailure("Payment failed");
        } else {
          showToast("Payment is still processing...", "info");
        }
      }
    } catch (error) {
      console.error("Status check error:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          PesaPal Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {currency} {amount}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {type === "booking"
              ? "Booking Payment"
              : type === "subscription"
              ? "Subscription Payment"
              : "Payment"}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <Label htmlFor="payment-method">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pesapal">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  PesaPal (All Methods)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Methods Info */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-800 font-medium mb-2">
            Available Payment Methods:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
            <div className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              M-Pesa
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              Airtel Money
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              MTN Mobile Money
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Credit/Debit Cards
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <Button onClick={handlePayment} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${currency} ${amount}`
          )}
        </Button>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 text-center">
          Your payment is secured by PesaPal's encryption technology
        </div>
      </CardContent>
    </Card>
  );
};

export default PesaPalPayment;
