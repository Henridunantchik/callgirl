import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AlertTriangle, Shield, Calendar, CheckCircle } from "lucide-react";

const AgeVerification = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const handleVerify = () => {
    setIsVerified(true);
    // In a real app, you might want to store this in localStorage or a cookie
    localStorage.setItem("ageVerified", "true");
  };

  const handleContinue = () => {
    navigate("/escorts");
  };

  const handleDecline = () => {
    navigate("/");
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Age Verified</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Thank you for confirming your age. You can now access our
              platform.
            </p>
            <Button onClick={handleContinue} className="w-full">
              Continue to Escorts Directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Age Verification Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {showWarning && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">
                    Important Notice
                  </h4>
                  <p className="text-sm text-red-800">
                    This website contains adult content and is intended for
                    individuals 18 years of age or older.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                You must be 18 or older to continue
              </span>
            </div>

            <p className="text-sm text-gray-600">
              By clicking "I am 18 or older", you confirm that you are at least
              18 years of age and legally able to view adult content in your
              jurisdiction.
            </p>

            <div className="space-y-3">
              <Button onClick={handleVerify} className="w-full">
                I am 18 or older
              </Button>
              <Button
                variant="outline"
                onClick={handleDecline}
                className="w-full"
              >
                I am under 18
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>
              If you are under 18, please leave this site immediately. We are
              committed to protecting minors and complying with all applicable
              laws.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgeVerification;
