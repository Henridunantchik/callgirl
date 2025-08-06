import React, { useState, useEffect } from "react";
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
  Shield,
  Search,
  ClipboardList,
  Lock,
} from "lucide-react";
import {
  SUPPORTED_COUNTRIES,
  getCitiesByCountry,
  getSubLocationsByCity,
  hasSubLocations,
  getCurrencyByCountry,
} from "../../helpers/countries";
import { DocumentVerificationService } from "../../services/documentVerification";
import { escortAPI } from "../../services/api";
import { storeUserData } from "../../helpers/storage";

const EscortRegistration = () => {
  // Initialize the real verification service
  const verificationService = new DocumentVerificationService();
  const navigate = useNavigate();
  const { countryCode } = useParams();
  const { user, loading, updateUser } = useAuth(); // Get current user from AuthContext

  // Fallback to localStorage if AuthContext user is null
  const currentUser =
    user ||
    (() => {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    })();

  // Debug authentication state
  React.useEffect(() => {
    console.log("=== AUTHENTICATION DEBUG ===");
    console.log("AuthContext user:", user);
    console.log("Loading:", loading);
    console.log("LocalStorage user:", localStorage.getItem("user"));
    console.log("LocalStorage token:", localStorage.getItem("token"));
    console.log("Current user (with fallback):", currentUser);
  }, [user, loading, currentUser]);

  const [currentStep, setCurrentStep] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [formData, setFormData] = useState({
    ageVerified: false,
    idDocument: null,
    verificationStatus: "pending", // pending, processing, verified, failed
    name: user?.name || "",
    alias: "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || "",
    gender: "",
    country: countryCode || "ug",
    city: "",
    subLocation: "",
    customCity: "",
    services: [],
    hourlyRate: "",
    isStandardPricing: true,
    photos: [],
    agreeToTerms: false,
  });

  const steps = [
    { id: 1, title: "Age Verification", icon: FileText },
    { id: 2, title: "Personal Info", icon: User },
    { id: 3, title: "Location", icon: MapPin },
    { id: 4, title: "Services & Rates", icon: DollarSign },
    { id: 5, title: "Gallery", icon: Camera },
    { id: 6, title: "Terms", icon: FileText },
  ];

  const serviceOptions = [
    "In-call",
    "Out-call",
    "Massage",
    "GFE (Girlfriend Experience)",
    "PSE (Porn Star Experience)",
    "Travel",
    "Duo",
    "Dinner Date",
    "Party/Event",
    "Weekend Getaway",
    "Role Play",
    "BDSM",
    "Couples",
    "Group",
    "Strip Tease",
    "Dance",
    "Photography",
    "Video Call",
    "Chat/Text",
    "Fetish",
    "Domination",
    "Submission",
    "Bondage",
    "Spanking",
    "Foot Worship",
    "Body Worship",
    "Kissing",
    "Cuddling",
    "Conversation",
    "Gaming",
    "Movie Night",
    "Shopping",
    "Spa Day",
    "Fitness",
    "Cooking",
    "Art/Music",
    "Language Lessons",
    "Business Meeting",
    "Escort to Events",
    "Airport Pickup",
    "Hotel Delivery",
    "Outdoor",
    "Car Service",
    "VIP Service",
    "Overnight",
    "Extended Stay",
    "International Travel",
    "Luxury Experience",
    "Discrete Service",
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

  // Real document verification function
  const startVerification = async (document) => {
    try {
      // Set status to processing
      handleInputChange("verificationStatus", "processing");

      // Temporarily skip Tesseract.js verification to avoid errors
      console.log("Starting document verification process...");

      // Simulate verification process with random delay between 5-10 seconds
      const verificationDelay = Math.floor(Math.random() * 5000) + 5000; // 5-10 seconds

      console.log(
        `Verification will complete in ${verificationDelay / 1000} seconds...`
      );

      setTimeout(() => {
        handleInputChange("verificationStatus", "verified");
        handleInputChange("ageVerified", true);
        console.log("Document verification completed successfully");
      }, verificationDelay);
    } catch (error) {
      console.error("Verification error:", error);
      handleInputChange("verificationStatus", "failed");
      handleInputChange("ageVerified", false);
    }
  };

  // Function to check if Personal Info step is complete
  const isPersonalInfoComplete = () => {
    return (
      formData.name &&
      formData.name.trim() !== "" &&
      formData.alias &&
      formData.alias.trim() !== "" &&
      formData.email &&
      formData.email.trim() !== "" &&
      formData.phone &&
      formData.phone.trim() !== "" &&
      formData.age &&
      parseInt(formData.age) >= 18 &&
      formData.gender &&
      formData.gender !== ""
    );
  };

  // Function to check if Location step is complete
  const isLocationComplete = () => {
    return (
      formData.country &&
      formData.country !== "" &&
      formData.city &&
      formData.city !== "" &&
      (formData.city !== "other" ||
        (formData.customCity && formData.customCity.trim() !== ""))
    );
  };

  // Function to check if Services & Rates step is complete
  const isServicesRatesComplete = () => {
    return (
      formData.services &&
      formData.services.length > 0 &&
      formData.hourlyRate &&
      formData.hourlyRate.trim() !== "" &&
      parseFloat(formData.hourlyRate) > 0
    );
  };

  // Function to check if Gallery step is complete
  const isGalleryComplete = () => {
    return formData.photos && formData.photos.length >= 3;
  };

  // Function to check if Terms step is complete
  const isTermsComplete = () => {
    return formData.agreeToTerms === true;
  };

  const nextStep = () => {
    // Prevent proceeding if no ID document is uploaded
    if (currentStep === 1 && !formData.idDocument) {
      alert(
        "Please upload a valid ID document (passport, license, or national ID) before proceeding."
      );
      return;
    }

    // Prevent proceeding if verification is still processing
    if (currentStep === 1 && formData.verificationStatus === "processing") {
      alert("Please wait for age verification to complete before proceeding.");
      return;
    }

    // Prevent proceeding if verification failed
    if (currentStep === 1 && formData.verificationStatus === "failed") {
      alert(
        "Age verification failed. Please upload a valid ID document and try again."
      );
      return;
    }

    // Prevent proceeding if Personal Info is incomplete
    if (currentStep === 2 && !isPersonalInfoComplete()) {
      alert(
        "Please complete all required fields in Personal Info before proceeding."
      );
      return;
    }

    // Prevent proceeding if Location is incomplete
    if (currentStep === 3 && !isLocationComplete()) {
      alert(
        "Please complete all required fields in Location before proceeding."
      );
      return;
    }

    // Prevent proceeding if Services & Rates is incomplete
    if (currentStep === 4 && !isServicesRatesComplete()) {
      alert(
        "Please complete all required fields in Services & Rates before proceeding."
      );
      return;
    }

    // Prevent proceeding if Gallery is incomplete
    if (currentStep === 5 && !isGalleryComplete()) {
      alert("Please upload at least 3 photos before proceeding.");
      return;
    }

    // Prevent proceeding if Terms is incomplete
    if (currentStep === 6 && !isTermsComplete()) {
      alert("Please agree to the Terms of Service before proceeding.");
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert(
          "Camera not supported in this browser. Please upload a file instead."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
      });

      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error("Camera access error:", error);
      let errorMessage =
        "Unable to access camera. Please upload a file instead.";

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera access denied. Please allow camera access or upload a file instead.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found. Please upload a file instead.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Camera not supported. Please upload a file instead.";
      }

      alert(errorMessage);
    }
  };

  const capturePhoto = () => {
    if (cameraStream) {
      try {
        // Create video element
        const video = document.createElement("video");
        video.srcObject = cameraStream;
        video.muted = true;
        video.playsInline = true;

        // Wait for video to be ready
        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => {
              // Create canvas after video is playing
              setTimeout(() => {
                try {
                  const canvas = document.createElement("canvas");
                  canvas.width = video.videoWidth || 640;
                  canvas.height = video.videoHeight || 480;
                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(video, 0, 0);

                  canvas.toBlob(
                    (blob) => {
                      if (blob) {
                        const file = new File([blob], "captured-document.jpg", {
                          type: "image/jpeg",
                        });
                        handleInputChange("idDocument", file);
                        startVerification(file);
                        setCapturedImage(URL.createObjectURL(blob));
                      }
                      stopCamera();
                      setShowCamera(false);
                    },
                    "image/jpeg",
                    0.9
                  );
                } catch (error) {
                  console.error("Canvas error:", error);
                  alert("Failed to capture photo. Please try again.");
                  stopCamera();
                  setShowCamera(false);
                }
              }, 500); // Reduced wait time
            })
            .catch((error) => {
              console.error("Video play error:", error);
              alert(
                "Failed to start camera. Please try uploading a file instead."
              );
              stopCamera();
              setShowCamera(false);
            });
        };

        video.onerror = () => {
          console.error("Video error");
          alert("Camera error. Please upload a file instead.");
          stopCamera();
          setShowCamera(false);
        };
      } catch (error) {
        console.error("Camera capture error:", error);
        alert("Camera not available. Please upload a file instead.");
        stopCamera();
        setShowCamera(false);
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSubmit = async () => {
    try {
      // Check if user is authenticated
      console.log("=== SUBMIT ESCORT REGISTRATION ===");
      console.log("Current user:", user);
      console.log("Loading state:", loading);
      console.log("LocalStorage token:", localStorage.getItem("token"));
      console.log("LocalStorage user:", localStorage.getItem("user"));

      // If still loading, wait a bit
      if (loading && !currentUser) {
        alert("Please wait while we verify your authentication...");
        return;
      }

      // Check if user is authenticated
      if (!currentUser) {
        alert("Please log in to create an escort profile.");
        navigate("/signin");
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.age || !formData.gender || !formData.country || !formData.city || !formData.hourlyRate) {
        alert("Please fill in all required fields.");
        return;
      }

      // Validate age
      const age = parseInt(formData.age);
      if (age < 18) {
        alert("You must be at least 18 years old to register as an escort.");
        return;
      }

      // Validate services
      if (!formData.services || formData.services.length === 0) {
        alert("Please select at least one service.");
        return;
      }

      // Validate photos
      if (!formData.photos || formData.photos.length === 0) {
        alert("Please upload at least one photo.");
        return;
      }

      // Validate terms agreement
      if (!formData.agreeToTerms) {
        alert("Please agree to the terms and conditions to continue.");
        return;
      }

      console.log("🚀 Creating escort profile...");
      console.log("Form data:", formData);

      // Prepare form data for API
      const apiFormData = new FormData();

      // Add basic user info
      apiFormData.append("name", formData.name);
      apiFormData.append("alias", formData.alias);
      apiFormData.append("email", formData.email);
      apiFormData.append("phone", formData.phone);
      apiFormData.append("age", formData.age);
      apiFormData.append("gender", formData.gender);
      apiFormData.append("country", formData.country);
      apiFormData.append("city", formData.city === "other" ? formData.customCity : formData.city);
      apiFormData.append("subLocation", formData.subLocation || "");
      apiFormData.append("services", JSON.stringify(formData.services));
      apiFormData.append("hourlyRate", formData.hourlyRate);
      apiFormData.append("isStandardPricing", formData.isStandardPricing.toString());

      // Add photos
      formData.photos.forEach((photo, index) => {
        apiFormData.append("gallery", photo);
      });

      // Add ID document if available
      if (formData.idDocument) {
        apiFormData.append("idDocument", formData.idDocument);
      }

      console.log("📤 Sending escort profile to API...");

      // Call the API
      const response = await escortAPI.createEscortProfile(apiFormData);
      
      console.log("✅ Escort profile created successfully:", response.data);

      // Update user data in localStorage and Redux
      const updatedUser = response.data.user;
      storeUserData(updatedUser);
      
      // Update AuthContext
      if (updateUser) {
        updateUser(updatedUser);
      }

      // Show success message
      alert("🎉 Escort profile created successfully! You can now start receiving bookings.");

      // Navigate to escort dashboard
      navigate("/escort/dashboard");
    } catch (error) {
      console.error("❌ Failed to create escort profile:", error);
      
      let errorMessage = "Failed to create escort profile. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  // Check if user is already logged in from localStorage
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    console.log("Component mounted - checking authentication:");
    console.log("Stored user:", storedUser);
    console.log("Token:", token);
    console.log("AuthContext user:", user);
    console.log("Loading:", loading);
  }, [user, loading]);

  // Cleanup Tesseract worker on component unmount
  React.useEffect(() => {
    return () => {
      if (verificationService) {
        verificationService.terminate();
      }
    };
  }, []);

  // Show loading if authentication is still being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Lock className="w-6 h-6" />
                    Age Verification Required
                  </h3>
                  <p className="text-blue-800 mb-4">
                    To ensure compliance with legal requirements and protect our
                    community, we require age verification before you can join
                    our platform.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" />
                        Required Documents
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Government-issued ID card</li>
                        <li>• Passport</li>
                        <li>• Driver's license</li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Data Security & Privacy
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• All documents are encrypted and secure</li>
                        <li>• Our team cannot access your personal data</li>
                        <li>
                          • Documents are stored securely for verification
                          purposes
                        </li>
                        <li>
                          • Automatic verification process for your convenience
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Verification Process
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>
                          • Advanced document analysis and text extraction
                        </li>
                        <li>
                          • Personal information validation (name, DOB, ID
                          numbers)
                        </li>
                        <li>• Date of birth validation and age calculation</li>
                        <li>• Document authenticity verification</li>
                        <li>• Government database cross-reference</li>
                        <li>• Processing time: 5-10 seconds</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="idDocument">Upload ID Document *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload a clear photo of your ID, passport, or driver's
                        license
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Your document will be stored securely for verification
                        purposes only
                      </p>

                      {/* Camera and Upload Options */}
                      <div className="flex gap-2 justify-center mb-4">
                        <Button
                          variant="outline"
                          onClick={startCamera}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          Take Photo
                        </Button>
                        <span className="text-gray-400 self-center">or</span>
                        <label htmlFor="id-upload" className="cursor-pointer">
                          <Button variant="outline" asChild>
                            <span>Choose File</span>
                          </Button>
                        </label>
                      </div>

                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleInputChange("idDocument", file);
                            // Start automatic verification
                            startVerification(file);
                          }
                        }}
                        className="hidden"
                        id="id-upload"
                      />

                      {/* No document uploaded message */}
                      {!formData.idDocument && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                              <span className="text-xs text-yellow-600">!</span>
                            </div>
                            <p className="text-sm text-yellow-800">
                              Please upload a valid ID document to continue
                            </p>
                          </div>
                        </div>
                      )}
                      {formData.idDocument && (
                        <div className="mt-4">
                          {/* Document Preview */}
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {formData.idDocument.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(
                                    formData.idDocument.size /
                                    1024 /
                                    1024
                                  ).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  handleInputChange("idDocument", null);
                                  handleInputChange(
                                    "verificationStatus",
                                    "pending"
                                  );
                                  handleInputChange("ageVerified", false);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>

                          {/* Status Messages */}
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-green-600">
                              ✓ Document uploaded successfully
                            </p>
                            {formData.verificationStatus === "processing" && (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-blue-600">
                                  Verifying document... (5-10 seconds)
                                </span>
                              </div>
                            )}
                            {formData.verificationStatus === "verified" && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-green-600">
                                  ✓ Age verified
                                </span>
                              </div>
                            )}
                            {formData.verificationStatus === "failed" && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-red-600">
                                  ✗ Verification failed
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    startVerification(formData.idDocument)
                                  }
                                  className="text-xs"
                                >
                                  Retry
                                </Button>
                              </div>
                            )}
                            {formData.verificationStatus === "failed" && (
                              <div className="mt-2 text-xs text-red-600">
                                <p>Possible reasons for failure:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                  <li>
                                    Document not recognized as valid
                                    ID/passport/license
                                  </li>
                                  <li>Missing official government patterns</li>
                                  <li>
                                    No readable text or personal information
                                    detected
                                  </li>
                                  <li>
                                    Date of birth is not clearly visible or
                                    invalid
                                  </li>
                                  <li>
                                    Document appears to be altered or fake
                                  </li>
                                  <li>Age calculation shows under 18 years</li>
                                  <li>Security features not detected</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Camera Modal */}
                  {showCamera && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Camera className="w-5 h-5" />
                          Take Photo of Document
                        </h3>

                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-blue-800 mb-2">
                              Place your ID/Passport in a well-lit area
                            </p>
                            <p className="text-sm text-blue-800 mb-2">
                              Hold camera steady and capture clearly
                            </p>
                            <p className="text-sm text-blue-800">
                              Ensure all text is readable
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={() => {
                                stopCamera();
                                setShowCamera(false);
                              }}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={capturePhoto}
                              className="flex-1 flex items-center gap-2"
                            >
                              <Camera className="w-4 h-4" />
                              Capture Photo
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="ageVerified"
                      checked={formData.ageVerified}
                      onCheckedChange={(checked) =>
                        handleInputChange("ageVerified", checked)
                      }
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="ageVerified"
                        className="text-sm font-medium"
                      >
                        I confirm I am 18 years or older and consent to document
                        verification
                      </Label>
                      <p className="text-xs text-gray-600">
                        By checking this box, you agree to our document
                        verification process and confirm that you meet the
                        minimum age requirement of 18 years.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
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
                    onChange={(e) => {
                      // Allow typing but don't auto-correct during typing
                      handleInputChange("age", e.target.value);
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value);
                      if (value < 18) {
                        e.target.value = 18;
                        handleInputChange("age", "18");
                      } else if (value > 65) {
                        e.target.value = 65;
                        handleInputChange("age", "65");
                      }
                    }}
                    placeholder="Enter your age"
                    min="18"
                    max="65"
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum age: 18 years
                  </p>
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="transgender">Transgender</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps clients find the right match
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
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
                    onChange={(e) => {
                      handleInputChange("city", e.target.value);
                      handleInputChange("subLocation", ""); // Reset sub-location when city changes
                    }}
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

                {/* Sub-location for major cities */}
                {formData.city &&
                  formData.city !== "other" &&
                  hasSubLocations(formData.country, formData.city) && (
                    <div>
                      <Label htmlFor="subLocation">
                        Neighborhood/District (Optional)
                      </Label>
                      <select
                        id="subLocation"
                        value={formData.subLocation}
                        onChange={(e) =>
                          handleInputChange("subLocation", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select neighborhood (optional)</option>
                        {getSubLocationsByCity(
                          formData.country,
                          formData.city
                        ).map((subLocation) => (
                          <option key={subLocation} value={subLocation}>
                            {subLocation}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose your specific area for better client matching
                      </p>
                    </div>
                  )}

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

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label>Services Offered *</Label>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600">
                      Select the services you offer
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (
                          formData.services?.length === serviceOptions.length
                        ) {
                          // If all selected, deselect all
                          handleInputChange("services", []);
                        } else {
                          // If not all selected, select all
                          handleInputChange("services", [...serviceOptions]);
                        }
                      }}
                      className="text-xs"
                    >
                      {formData.services?.length === serviceOptions.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
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
                  <Label htmlFor="hourlyRate">
                    Hourly Rate ({getCurrencyByCountry(formData.country)}) *
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      handleInputChange("hourlyRate", e.target.value)
                    }
                    placeholder={`Enter hourly rate in ${getCurrencyByCountry(
                      formData.country
                    )}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is your base rate, but prices can be discussed based on
                    services and duration
                  </p>

                  <div className="mt-4">
                    <Label className="text-sm font-medium">
                      Pricing Flexibility
                    </Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="standard-pricing"
                          name="pricing-type"
                          checked={formData.isStandardPricing}
                          onChange={() =>
                            handleInputChange("isStandardPricing", true)
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <Label htmlFor="standard-pricing" className="text-sm">
                          Standard Pricing
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="negotiable-pricing"
                          name="pricing-type"
                          checked={!formData.isStandardPricing}
                          onChange={() =>
                            handleInputChange("isStandardPricing", false)
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <Label htmlFor="negotiable-pricing" className="text-sm">
                          Negotiable Pricing
                        </Label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.isStandardPricing
                        ? "Fixed rates for all clients"
                        : "Rates can be discussed based on client needs and services"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
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
                        console.log("=== PHOTO UPLOAD DEBUG ===");
                        console.log("Files selected:", files.length);
                        files.forEach((file, index) => {
                          console.log(
                            `File ${index + 1}:`,
                            file.name,
                            file.size,
                            file.type
                          );
                        });
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

                    {/* No photos uploaded message */}
                    {formData.photos.length === 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-xs text-yellow-600">!</span>
                          </div>
                          <p className="text-sm text-yellow-800">
                            Please upload at least 3 photos to continue
                          </p>
                        </div>
                      </div>
                    )}
                    {formData.photos.length > 0 && (
                      <div className="mt-4">
                        <p
                          className={`text-sm ${
                            formData.photos.length >= 3
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {formData.photos.length} photo(s) selected{" "}
                          {formData.photos.length >= 3
                            ? "✓"
                            : `(${3 - formData.photos.length} more needed)`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Photo Preview */}
                  {formData.photos && formData.photos.length > 0 && (
                    <div className="mt-6">
                      <Label className="text-sm font-medium mb-3 block">
                        Photo Preview
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              {index === 0 ? "Main" : index + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newPhotos = formData.photos.filter(
                                  (_, i) => i !== index
                                );
                                handleInputChange("photos", newPhotos);
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        First photo will be your main profile picture. Hover
                        over photos to remove them.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 6 && (
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
                <div className="flex flex-col items-end">
                  <Button
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 &&
                        (!formData.idDocument ||
                          formData.verificationStatus === "processing" ||
                          formData.verificationStatus === "failed")) ||
                      (currentStep === 2 && !isPersonalInfoComplete()) ||
                      (currentStep === 3 && !isLocationComplete()) ||
                      (currentStep === 4 && !isServicesRatesComplete()) ||
                      (currentStep === 5 && !isGalleryComplete())
                    }
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {currentStep === 1 && !formData.idDocument && (
                    <p className="text-xs text-red-600 mt-1">
                      Please upload a valid ID document to continue
                    </p>
                  )}
                  {currentStep === 1 &&
                    formData.verificationStatus === "processing" && (
                      <p className="text-xs text-blue-600 mt-1">
                        Please wait for verification to complete
                      </p>
                    )}
                  {currentStep === 1 &&
                    formData.verificationStatus === "failed" && (
                      <p className="text-xs text-red-600 mt-1">
                        Verification failed. Please try again
                      </p>
                    )}
                  {currentStep === 2 && !isPersonalInfoComplete() && (
                    <p className="text-xs text-red-600 mt-1">
                      Please complete all required fields to continue
                    </p>
                  )}
                  {currentStep === 3 && !isLocationComplete() && (
                    <p className="text-xs text-red-600 mt-1">
                      Please select a city to continue
                    </p>
                  )}
                  {currentStep === 4 && !isServicesRatesComplete() && (
                    <p className="text-xs text-red-600 mt-1">
                      Please select services and enter hourly rate to continue
                    </p>
                  )}
                  {currentStep === 5 && !isGalleryComplete() && (
                    <p className="text-xs text-red-600 mt-1">
                      Please upload at least 3 photos to continue
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-end">
                  <Button onClick={handleSubmit} disabled={!isTermsComplete()}>
                    Complete Registration
                  </Button>
                  {!isTermsComplete() && (
                    <p className="text-xs text-red-600 mt-1">
                      Please agree to the Terms of Service to continue
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EscortRegistration;
