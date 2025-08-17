import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { XCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { paymentAPI } from '../services/api';
import { showToast } from '../helpers/showToast';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('pesapal_merchant_reference');
  const trackingId = searchParams.get('pesapal_transaction_tracking_id');
  const errorCode = searchParams.get('error_code');
  const errorMessage = searchParams.get('error_message');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (orderId) {
        try {
          const response = await paymentAPI.checkPesaPalStatus(orderId);
          
          if (response.data.success) {
            setPaymentDetails(response.data.data);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  const handleRetryPayment = () => {
    // Navigate back to the booking page or payment page
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // You can implement this to open a support chat or email
    window.open('mailto:support@callgirls.com?subject=Payment Issue', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Payment Failed
          </CardTitle>
          <p className="text-gray-600 mt-2">
            We couldn't process your payment
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Details */}
          <div className="bg-red-50 p-4 rounded-lg space-y-2">
            {errorCode && (
              <div className="flex justify-between">
                <span className="text-gray-600">Error Code:</span>
                <span className="font-mono text-sm text-red-600">{errorCode}</span>
              </div>
            )}
            {errorMessage && (
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {errorMessage}
              </div>
            )}
            {orderId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm">{orderId}</span>
              </div>
            )}
            {trackingId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking ID:</span>
                <span className="font-mono text-sm">{trackingId}</span>
              </div>
            )}
          </div>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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
                <span className="text-red-600 font-semibold capitalize">
                  {paymentDetails.status}
                </span>
              </div>
            </div>
          )}

          {/* Failure Message */}
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Don't worry! Your booking hasn't been confirmed yet. You can try the payment again or contact our support team for assistance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleRetryPayment} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Payment Again
            </Button>
            
            <Button 
              onClick={handleContactSupport} 
              className="w-full"
              variant="outline"
            >
              Contact Support
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

          {/* Common Issues */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Common Issues:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Insufficient funds in your account</li>
              <li>• Network connectivity issues</li>
              <li>• Incorrect payment details</li>
              <li>• Transaction timeout</li>
            </ul>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>If you continue to have issues, please contact our support team</p>
            <p>Email: support@callgirls.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailure;
