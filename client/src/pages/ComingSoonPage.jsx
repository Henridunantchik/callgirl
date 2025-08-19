import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Calendar, Clock, Construction } from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoonPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Construction className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Coming Soon!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Booking System</span>
          </div>
          
          <p className="text-gray-600 leading-relaxed">
            We're working hard to bring you an amazing booking experience. 
            This feature will allow you to schedule appointments and manage your calendar seamlessly.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-blue-700 mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">Expected Release</span>
            </div>
            <p className="text-blue-600 text-sm">
              Early 2025
            </p>
          </div>
          
          <div className="pt-4">
            <Link to="/ug">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonPage;
