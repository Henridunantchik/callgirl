import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Checkbox } from "../../components/ui/checkbox";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  User,
  MapPin,
  DollarSign,
  Camera,
  FileText,
} from "lucide-react";
import {
  SUPPORTED_COUNTRIES,
  getCitiesByCountry,
} from "../../helpers/countries";

const EscortRegistration = () => {
  const navigate = useNavigate();
  const { countryCode } = useParams();
  const { user } = useAuth(); // Get current user from AuthContext
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    alias: "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || "",
    country: countryCode || "ug",
    city: "",
    customCity: "",
    services: [],
    hourlyRate: "",
    photos: [],
    agreeToTerms: false,
  });

  const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Location", icon: MapPin },
    { id: 3, title: "Services & Rates", icon: DollarSign },
    { id: 4, title: "Gallery", icon: Camera },
    { id: 5, title: "Terms", icon: FileText },
  ];

  const serviceOptions = [
    "In-call",
    "Out-call",
    "Massage",
    "GFE (Girlfriend Experience)",
    "PSE (Porn Star Experience)",
    "Travel",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service) => {
    const currentServices = formData.services || [];
    const newServices = currentServices.includes(service)
      ? currentServices.filter((s) => s !== service)
      : [...currentServices, service];
    handleInputChange("services", newServices);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.alias ||
        !formData.email ||
        !formData.phone ||
        !formData.age ||
        !formData.city ||
        (formData.city === "other" && !formData.customCity) ||
        !formData.services.length ||
        !formData.hourlyRate
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Create FormData for file uploads
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("alias", formData.alias);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("age", formData.age);
      submitData.append("country", formData.country);
      // Use custom city if "other" is selected, otherwise use selected city
      const finalCity =
        formData.city === "other" ? formData.customCity : formData.city;
      submitData.append("city", finalCity);
      submitData.append("services", JSON.stringify(formData.services));
      submitData.append("hourlyRate", formData.hourlyRate);

      // Add photos if any
      if (formData.photos.length > 0) {
        formData.photos.forEach((photo, index) => {
          submitData.append("gallery", photo);
        });
      }

      const response = await fetch("/api/escort/create", {
        method: "POST",
        credentials: "include",
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create escort profile");
      }

      // Success - redirect to escort dashboard
      navigate("/escort/dashboard");
    } catch (error) {
      console.error("Error creating escort profile:", error);
      alert(error.message);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Our Platform
          </h1>
          <p className="text-gray-600">
            Create your escort profile and start connecting with clients
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, {
                className: "w-5 h-5",
              })}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Legal Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter your legal name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alias">Professional Name *</Label>
                    <Input
                      id="alias"
                      value={formData.alias}
                      onChange={(e) =>
                        handleInputChange("alias", e.target.value)
                      }
                      placeholder="Enter your professional name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="Enter your age"
                    min="18"
                    max="65"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => {
                      handleInputChange("country", e.target.value);
                      handleInputChange("city", ""); // Reset city when country changes
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(SUPPORTED_COUNTRIES).map(
                      ([code, country]) => (
                        <option key={code} value={code}>
                          {country.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <select
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a city</option>
                    {getCitiesByCountry(formData.country).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                    <option value="other">Other (Custom City)</option>
                  </select>
                </div>
                {formData.city === "other" && (
                  <div>
                    <Label htmlFor="customCity">Custom City Name *</Label>
                    <Input
                      id="customCity"
                      value={formData.customCity || ""}
                      onChange={(e) =>
                        handleInputChange("customCity", e.target.value)
                      }
                      placeholder="Enter your city name"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label>Services Offered *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {serviceOptions.map((service) => (
                      <Badge
                        key={service}
                        variant={
                          formData.services?.includes(service)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => handleServiceToggle(service)}
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      handleInputChange("hourlyRate", e.target.value)
                    }
                    placeholder="Enter hourly rate"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>Profile Photos *</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload at least 3 photos. First photo will be your main
                    profile picture.
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload photos or drag and drop
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        handleInputChange("photos", files);
                      }}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload">
                      <Button variant="outline" asChild>
                        <span>Choose Photos</span>
                      </Button>
                    </label>
                    {formData.photos.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          {formData.photos.length} photo(s) selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      handleInputChange("agreeToTerms", checked)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="agreeToTerms"
                      className="text-sm font-medium"
                    >
                      I agree to the Terms of Service and confirm I am 18 years
                      or older
                    </Label>
                    <p className="text-xs text-gray-600">
                      I have read and agree to the platform&apos;s terms of
                      service and community guidelines.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>Complete Registration</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EscortRegistration;
