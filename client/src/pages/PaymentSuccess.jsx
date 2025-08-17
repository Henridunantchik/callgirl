import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, ArrowLeft, Home, Receipt } from 'lucide-react';
import { paymentAPI } from '../services/api';
import { showToast } from '../helpers/showToast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('pesapal_merchant_reference');
  const trackingId = searchParams.get('pesapal_transaction_tracking_id');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (orderId) {
        try {
          const response = await paymentAPI.checkPesaPalStatus(orderId);
          
          if (response.data.success) {
            setPaymentDetails(response.data.data);
            showToast('Payment completed successfully!', 'success');
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          showToast('Error verifying payment status', 'error');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  const handleViewBookings = () => {
    navigate('/client/bookings');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Payment Successful!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Your payment has been processed successfully
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm">{orderId}</span>
              </div>
              {trackingId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking ID:</span>
                  <span className="font-mono text-sm">{trackingId}</span>
                </div>
              )}
              {paymentDetails.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">
                    {paymentDetails.currency} {paymentDetails.amount}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-semibold capitalize">
                  {paymentDetails.status}
                </span>
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Thank you for your payment! Your booking has been confirmed and you will receive a confirmation email shortly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleViewBookings} 
              className="w-full"
              variant="default"
            >
              <Receipt className="mr-2 h-4 w-4" />
              View My Bookings
            </Button>
            
            <Button 
              onClick={handleGoHome} 
              className="w-full"
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>You will receive a confirmation email with booking details</p>
            <p>For support, contact us at support@callgirls.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
