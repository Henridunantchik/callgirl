import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/user/user.slice";
import { useForm } from "react-hook-form";
import Loading from "@/components/Loading";
import Dropzone from "react-dropzone";
import { showToast } from "@/helpers/showToast";
import { getEvn } from "@/helpers/getEnv";
import { userAPI } from "@/services/api";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filePreview, setPreview] = useState();
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    personal: true,
    services: true,
    about: true,
    gallery: true,
    videos: true,
  });
  const user = useSelector((state) => state.user.user);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const dispatch = useDispatch();

  // Profile completion calculation with detailed breakdown
  const calculateProfileCompletion = (userData) => {
    if (!userData?.user) return { percentage: 0, breakdown: {} };
    const user = userData.user;
    const isEscort = user.role === "escort";

    const fieldConfig = [
      { key: "name", field: user.name, weight: 5, label: "Full Name" },
      { key: "email", field: user.email, weight: 5, label: "Email" },
      { key: "phone", field: user.phone, weight: 5, label: "Phone" },
      ...(isEscort
        ? [
            {
              key: "alias",
              field: user.alias,
              weight: 3,
              label: "Professional Name",
            },
            { key: "age", field: user.age, weight: 3, label: "Age" },
            { key: "gender", field: user.gender, weight: 3, label: "Gender" },
            {
              key: "city",
              field: user.location?.city,
              weight: 3,
              label: "City",
            },
            {
              key: "subLocation",
              field: user.location?.subLocation,
              weight: 2,
              label: "Neighborhood",
            },
            {
              key: "hourly",
              field: user.rates?.hourly,
              weight: 3,
              label: "Hourly Rate",
            },
            {
              key: "services",
              field: user.services,
              weight: 4,
              label: "Services",
            },
            { key: "bio", field: user.bio, weight: 4, label: "Bio" },
            {
              key: "bodyType",
              field: user.bodyType,
              weight: 2,
              label: "Body Type",
            },
            {
              key: "ethnicity",
              field: user.ethnicity,
              weight: 2,
              label: "Ethnicity",
            },
            { key: "height", field: user.height, weight: 2, label: "Height" },
            { key: "weight", field: user.weight, weight: 2, label: "Weight" },
            {
              key: "hairColor",
              field: user.hairColor,
              weight: 2,
              label: "Hair Color",
            },
            {
              key: "eyeColor",
              field: user.eyeColor,
              weight: 2,
              label: "Eye Color",
            },
            {
              key: "experience",
              field: user.experience,
              weight: 3,
              label: "Experience",
            },
            {
              key: "gallery",
              field: user.gallery?.length > 0,
              weight: 5,
              label: "Gallery Photos",
            },
          ]
        : []),
    ];

    let totalWeight = 0;
    let completedWeight = 0;
    const breakdown = {};

    fieldConfig.forEach(({ key, field, weight, label }) => {
      totalWeight += weight;
      const isValid =
        field &&
        field !== "" &&
        field !== "Select gender" &&
        field !== "Select body type" &&
        field !== "Select ethnicity" &&
        field !== "Select hair color" &&
        field !== "Select eye color";

      const isCompleted = Array.isArray(field) ? field.length > 0 : isValid;

      if (isCompleted) {
        completedWeight += weight;
        breakdown[key] = { completed: true, weight, label };
      } else {
        breakdown[key] = { completed: false, weight, label };
      }
    });

    const percentage =
      totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

    return { percentage, breakdown, totalWeight, completedWeight };
  };

  const profileCompletion = calculateProfileCompletion(userData);
  const { percentage, breakdown, totalWeight, completedWeight } =
    profileCompletion;

  // Fetch fresh user data on page load
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log("=== PROFILE PAGE DEBUG ===");
        console.log("Fetching fresh user data...");

        // Get fresh user data from API
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fresh user data received:", data);
          setUserData({ success: true, user: data.user });
        } else {
          console.error("Failed to fetch user data");
          // Fallback to Redux data
          if (user && user._id) {
            setUserData({ success: true, user: user });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to Redux data
        if (user && user._id) {
          setUserData({ success: true, user: user });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const isEscort = userData?.user?.role === "escort" || user?.role === "escort";
  const isClient = userData?.user?.role === "client" || user?.role === "client";

  console.log("=== PROFILE DEBUG ===");
  console.log("userData:", userData);
  console.log("user:", user);
  console.log("isEscort:", isEscort);
  console.log("isClient:", isClient);
  console.log("current pathname:", location.pathname);

  // Redirect logic: if escort is on /profile, redirect to /escort/profile
  useEffect(() => {
    if (
      isEscort &&
      location.pathname.includes("/profile") &&
      !location.pathname.includes("/escort/profile")
    ) {
      // Extract country code from current path
      const pathParts = location.pathname.split("/");
      const countryCode = pathParts[1]; // e.g., "ug" from "/ug/profile"
      navigate(`/${countryCode}/escort/profile`, { replace: true });
    }
  }, [isEscort, location.pathname, navigate]);

  // Form schema
  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(10, "Phone number must be at least 10 digits."),
    alias: z.string().optional(),
    age: z.string().optional(),
    gender: z.string().optional(),
    city: z.string().optional(),
    neighborhood: z.string().optional(),
    pricingType: z.string().optional(),
    rates: z.object({
      hourly: z.string().optional(),
    }),
    services: z.array(z.string()).optional(),
    bio: z.string().optional(),
    bodyType: z.string().optional(),
    ethnicity: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    hairColor: z.string().optional(),
    eyeColor: z.string().optional(),
    experience: z.string().optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      alias: "",
      age: "",
      gender: "",
      city: "",
      neighborhood: "",
      pricingType: "",
      rates: { hourly: "" },
      services: [],
      bio: "",
      bodyType: "",
      ethnicity: "",
      height: "",
      weight: "",
      hairColor: "",
      eyeColor: "",
      experience: "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (userData && userData.success) {
      const user = userData.user;
      console.log("Pre-filling form with user data:", user);
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        alias: user.alias || "",
        age: user.age ? user.age.toString() : "",
        gender: user.gender || "",
        city: user.location?.city || "",
        neighborhood: user.location?.subLocation || "",
        pricingType: user.isStandardPricing ? "standard" : "discutable",
        rates: {
          hourly: user.rates?.hourly ? user.rates.hourly.toString() : "",
        },
        services: user.services || [],
        bio: user.bio || "",
        bodyType: user.bodyType || "",
        ethnicity: user.ethnicity || "",
        height: user.height ? user.height.toString() : "",
        weight: user.weight ? user.weight.toString() : "",
        hairColor: user.hairColor || "",
        eyeColor: user.eyeColor || "",
        experience: user.experience || "",
      });
    }
  }, [userData, form]);

  // Profile update with robust error handling and retry logic
  async function onSubmit(values) {
    try {
      setUpdating(true);
      showToast("Saving profile changes...", "info");
      console.log("=== PROFILE UPDATE DEBUG ===");
      console.log("Form values:", values);
      console.log("Starting profile update...");

      // Prepare data for backend with validation
      const updateData = {
        name: values.name?.trim(),
        email: values.email?.trim(),
        phone: values.phone?.trim(),
        alias: values.alias?.trim(),
        age: values.age ? parseInt(values.age) : null,
        gender: values.gender,
        location: {
          city: values.city?.trim(),
          subLocation: values.neighborhood?.trim(),
        },
        rates: {
          hourly: values.rates.hourly ? parseInt(values.rates.hourly) : null,
        },
        isStandardPricing: values.pricingType === "standard",
        services: values.services || [],
        bio: values.bio?.trim(),
        bodyType: values.bodyType,
        ethnicity: values.ethnicity,
        height: values.height ? parseInt(values.height) : null,
        weight: values.weight ? parseInt(values.weight) : null,
        hairColor: values.hairColor,
        eyeColor: values.eyeColor,
        experience: values.experience?.trim(),
      };

      // Progressive saving - only validate fields that are being updated
      const updatedFields = Object.keys(updateData).filter(
        (key) =>
          updateData[key] !== undefined &&
          updateData[key] !== null &&
          updateData[key] !== ""
      );

      console.log("Fields being updated:", updatedFields);

      // Only validate required fields if they're being updated
      const requiredFields = ["name", "email", "phone"];
      const missingRequiredFields = requiredFields.filter(
        (field) => updatedFields.includes(field) && !updateData[field]
      );

      if (missingRequiredFields.length > 0) {
        showToast(
          `Missing required fields: ${missingRequiredFields.join(", ")}`,
          "error"
        );
        return;
      }

      // Only send fields that have values (progressive saving)
      const dataToSend = {};
      updatedFields.forEach((field) => {
        if (
          updateData[field] !== undefined &&
          updateData[field] !== null &&
          updateData[field] !== ""
        ) {
          dataToSend[field] = updateData[field];
        }
      });

      console.log(
        "Progressive save - sending only updated fields:",
        dataToSend
      );

      // Robust API call with retry logic
      console.log("Making API call to update profile...");
      console.log("API endpoint: /api/user/update");
      console.log("Request data:", dataToSend);

      let response;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          if (retryCount === 0) {
            // First try with API service
            response = await userAPI.updateUserProfile(dataToSend);
            console.log(
              "Profile updated successfully via API service:",
              response.data
            );
          } else {
            // Retry with direct fetch
            console.log(`Retry ${retryCount}: Using direct fetch...`);
            const fetchResponse = await fetch(
              "/api/user/update",
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(dataToSend),
              }
            );

            if (!fetchResponse.ok) {
              const errorText = await fetchResponse.text();
              throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
            }

            response = { data: await fetchResponse.json() };
            console.log(
              "Profile updated successfully via direct fetch:",
              response.data
            );
          }
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          console.error(`Attempt ${retryCount} failed:`, error);

          if (retryCount > maxRetries) {
            throw error; // Re-throw after all retries exhausted
          }

          // Wait before retry
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

      // Update Redux store with new data
      if (response.data.success && response.data.user) {
        console.log("Updating Redux store with new user data");
        dispatch(setUser(response.data.user));

        // Also update local user data
        setUserData({ success: true, user: response.data.user });
      }

      const updatedFieldsList = updatedFields.map((field) => {
        const fieldLabels = {
          name: "Full Name",
          email: "Email",
          phone: "Phone",
          alias: "Professional Name",
          age: "Age",
          gender: "Gender",
          city: "City",
          subLocation: "Neighborhood",
          hourly: "Hourly Rate",
          services: "Services",
          bio: "Bio",
          bodyType: "Body Type",
          ethnicity: "Ethnicity",
          height: "Height",
          weight: "Weight",
          hairColor: "Hair Color",
          eyeColor: "Eye Color",
          experience: "Experience",
        };
        return fieldLabels[field] || field;
      });

      showToast(
        `${updatedFieldsList.join(", ")} updated successfully!`,
        "success"
      );

      // Refresh profile completion calculation
      const newCompletion = calculateProfileCompletion({
        success: true,
        user: response.data.user,
      });
      console.log("New profile completion:", newCompletion.percentage + "%");
    } catch (error) {
      console.error("Failed to update profile:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error config:", error.config);

      let errorMessage = "Failed to update profile";
      if (
        error.code === "ECONNREFUSED" ||
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED"
      ) {
        errorMessage =
          "Server connection failed. Please check your internet connection and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "error");
    } finally {
      setUpdating(false);
    }
  }

  const handleFileSelection = async (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      // Upload avatar to server
      try {
        console.log("Uploading avatar...");
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/user/update", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Avatar uploaded successfully:", data);
          showToast("Avatar uploaded successfully!", "success");

          // Update user data with new avatar
          if (data.user) {
            setUserData((prev) => ({
              ...prev,
              user: { ...prev.user, avatar: data.user.avatar },
            }));
          }
        } else {
          console.error("Failed to upload avatar");
          showToast("Failed to upload avatar", "error");
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        showToast("Failed to upload avatar", "error");
      }
    }
  };

  const handleGalleryUpload = async (files) => {
    if (files && files.length > 0) {
      try {
        setUploadingGallery(true);
        showToast(`Uploading ${files.length} photo(s)...`, "info");

        const formData = new FormData();

        // Add all files to form data
        files.forEach((file, index) => {
          formData.append("images", file);
        });

        console.log(`Starting upload of ${files.length} images...`);
        const startTime = Date.now();

        const response = await fetch(
          "/api/escort/gallery/" + user?._id,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          }
        );

        const uploadTime = Date.now() - startTime;
        console.log(`Upload completed in ${uploadTime}ms`);

        if (response.ok) {
          const data = await response.json();
          showToast("Gallery photos uploaded successfully!", "success");

          // Refresh user data to show new gallery
          const userResponse = await fetch(
            "http://localhost:5000/api/auth/me",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserData({ success: true, user: userData.user });
          }
        } else {
          const errorData = await response.json();
          showToast("Failed to upload gallery photos", "error");
        }
      } catch (error) {
        showToast("Failed to upload gallery photos", "error");
      } finally {
        setUploadingGallery(false);
      }
    }
  };

  const handleVideoUpload = async (files) => {
    if (files && files.length > 0) {
      try {
        setUploadingVideos(true);
        showToast(`Uploading ${files.length} video(s)...`, "info");

        const formData = new FormData();

        // Add all video files to form data
        files.forEach((file, index) => {
          formData.append("videos", file);
        });

        const response = await fetch(
          "/api/escort/video/" + user?._id,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          showToast("Videos uploaded successfully!", "success");

          // Refresh user data to show new videos
          const userResponse = await fetch(
            "http://localhost:5000/api/auth/me",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserData({ success: true, user: userData.user });
          }
        } else {
          const errorData = await response.json();
          showToast("Failed to upload videos", "error");
        }
      } catch (error) {
        showToast("Failed to upload videos", "error");
      } finally {
        setUploadingVideos(false);
      }
    }
  };

  const handleGalleryImageDelete = async (imageId) => {
    try {
      setDeletingImage(imageId);

      console.log("=== DELETE GALLERY IMAGE ===");
      console.log("Image ID:", imageId);
      console.log("User ID:", user?._id);

      const deleteUrl = `/api/escort/gallery/${user?._id}/${imageId}`;
      console.log("Delete URL:", deleteUrl);

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        let data;
        try {
          data = await response.json();
          console.log("Delete success:", data);
        } catch (jsonError) {
          console.log("Response is not JSON, but deletion was successful");
          data = { success: true, message: "Image deleted successfully" };
        }

        // Refresh user data
        const userResponse = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserData({ success: true, user: userData.user });
          showToast("Image deleted successfully!", "success");
        } else {
          console.error("Failed to refresh user data:", userResponse.status);
          showToast("Image deleted but failed to refresh data", "warning");
        }
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          errorData = { message: "Unknown error occurred" };
        }
        console.error("Delete failed:", errorData);
        showToast(
          `Failed to delete image: ${errorData.message || "Unknown error"}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast(`Failed to delete image: ${error.message}`, "error");
    } finally {
      setDeletingImage(null);
    }
  };

  const handleVideoDelete = async (videoId) => {
    try {
      setDeletingVideo(videoId);

      const response = await fetch(
        `http://localhost:5000/api/escort/video/${user?._id}/${videoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        // Refresh user data
        const userResponse = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserData({ success: true, user: userData.user });
          showToast("Video deleted successfully!", "success");
        }
      } else {
        showToast("Failed to delete video", "error");
      }
    } catch (error) {
      showToast("Failed to delete video", "error");
    } finally {
      setDeletingVideo(null);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) return <Loading />;
  if (!user?._id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            User Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            Please log in to access your profile.
          </p>
          <Button onClick={() => navigate("/sign-in")}>Go to Sign In</Button>
        </div>
      </div>
    );
  }

  // Ensure only clients can access this page
  if (isEscort) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            This page is only available for client profiles.
          </p>
          <Button
            onClick={() => {
              const pathParts = location.pathname.split("/");
              const countryCode = pathParts[1];
              navigate(`/${countryCode}/escort/profile`);
            }}
          >
            Go to Escort Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEscort ? "Escort Profile Management" : "Client Profile"}
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            {isEscort
              ? "Manage your escort profile, gallery, services, and settings"
              : "Update your personal information and preferences"}
          </p>
        </div>

        {/* Profile Completion - Only for Escorts */}
        {isEscort && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Profile Completion
                </h3>
                <p className="text-sm text-gray-600">
                  Complete your profile to get more bookings
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {percentage}%
                </div>
                <div className="text-xs text-gray-500">
                  Complete ({completedWeight}/{totalWeight} points)
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  profileCompletion >= 80
                    ? "bg-green-500"
                    : profileCompletion >= 60
                    ? "bg-yellow-500"
                    : profileCompletion >= 40
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>

            {profileCompletion < 100 && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    Add photos (+40% bookings)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    Complete bio (+3x inquiries)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Picture */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isEscort ? "Escort Profile Picture" : "Profile Picture"}
                </h3>
                <div className="relative">
                  <Dropzone onDrop={handleFileSelection}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <div className="relative group cursor-pointer">
                          <Avatar className="w-24 h-24 mx-auto border-2 border-gray-200">
                            <AvatarImage
                              src={
                                filePreview
                                  ? filePreview
                                  : userData?.user?.avatar
                              }
                            />
                            <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </div>
                          </Avatar>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </div>
              </div>

              {/* Escort-specific status info */}
              {isEscort && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Verification:</span>
                    <Badge
                      variant={
                        userData?.user?.isVerified ? "default" : "secondary"
                      }
                    >
                      {userData?.user?.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge
                      variant={userData?.user?.isOnline ? "default" : "outline"}
                    >
                      {userData?.user?.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Client-specific info */}
              {isClient && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Type:</span>
                    <Badge variant="default" className="bg-blue-500 text-white">
                      Client Account
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since:</span>
                    <span className="text-sm text-gray-600">
                      {userData?.user?.createdAt
                        ? new Date(userData.user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.log("Form validation errors:", errors);
                  })}
                  className="space-y-0"
                >
                  {/* Basic Information Section */}
                  <div className="border-b border-gray-200">
                    <div className="p-6">
                      <div
                        className="flex items-center justify-between mb-4 cursor-pointer"
                        onClick={() => toggleSection("basic")}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Basic Information
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedSections.basic ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      {expandedSections.basic && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your full name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Escort-specific fields */}
                          {isEscort && (
                            <FormField
                              control={form.control}
                              name="alias"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Professional Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Your professional name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your email"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your phone number"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Escort-specific personal details */}
                          {isEscort && (
                            <>
                              <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Age</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Enter your age"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                      Gender
                                      {!field.value && (
                                        <span className="text-red-500 text-xs">
                                          *Required
                                        </span>
                                      )}
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger
                                          className={
                                            !field.value
                                              ? "border-red-200 bg-red-50"
                                              : ""
                                          }
                                        >
                                          <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="female">
                                          Female
                                        </SelectItem>
                                        <SelectItem value="male">
                                          Male
                                        </SelectItem>
                                        <SelectItem value="transgender">
                                          Transgender
                                        </SelectItem>
                                        <SelectItem value="other">
                                          Other
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter your city"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="neighborhood"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Neighborhood/Sub-city</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Enter your neighborhood or sub-city"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="pricingType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Pricing Type</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select pricing type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="standard">
                                          Standard Rate
                                        </SelectItem>
                                        <SelectItem value="discutable">
                                          Negotiable Rate
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="rates.hourly"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Hourly Rate ($)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Enter hourly rate"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Details Section - Only for Escorts */}
                  {isEscort && (
                    <div className="border-b border-gray-200">
                      <div className="p-6">
                        <div
                          className="flex items-center justify-between mb-4 cursor-pointer"
                          onClick={() => toggleSection("personal")}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Personal Details
                          </h3>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedSections.personal ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {expandedSections.personal && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="bodyType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Body Type
                                    {!field.value && (
                                      <span className="text-orange-500 text-xs">
                                        *Recommended
                                      </span>
                                    )}
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        className={
                                          !field.value
                                            ? "border-orange-200 bg-orange-50"
                                            : ""
                                        }
                                      >
                                        <SelectValue placeholder="Select body type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="slim">Slim</SelectItem>
                                      <SelectItem value="athletic">
                                        Athletic
                                      </SelectItem>
                                      <SelectItem value="curvy">
                                        Curvy
                                      </SelectItem>
                                      <SelectItem value="plus-size">
                                        Plus Size
                                      </SelectItem>
                                      <SelectItem value="average">
                                        Average
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="ethnicity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Ethnicity
                                    {!field.value && (
                                      <span className="text-orange-500 text-xs">
                                        *Recommended
                                      </span>
                                    )}
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        className={
                                          !field.value
                                            ? "border-orange-200 bg-orange-50"
                                            : ""
                                        }
                                      >
                                        <SelectValue placeholder="Select ethnicity" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="african">
                                        African
                                      </SelectItem>
                                      <SelectItem value="asian">
                                        Asian
                                      </SelectItem>
                                      <SelectItem value="caucasian">
                                        Caucasian
                                      </SelectItem>
                                      <SelectItem value="hispanic">
                                        Hispanic
                                      </SelectItem>
                                      <SelectItem value="middle-eastern">
                                        Middle Eastern
                                      </SelectItem>
                                      <SelectItem value="mixed">
                                        Mixed
                                      </SelectItem>
                                      <SelectItem value="other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="height"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Height (cm)
                                    {!field.value && (
                                      <span className="text-orange-500 text-xs">
                                        *Recommended
                                      </span>
                                    )}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Enter height in cm"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      className={
                                        !field.value
                                          ? "border-orange-200 bg-orange-50"
                                          : ""
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="weight"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Weight (kg)
                                    {!field.value && (
                                      <span className="text-orange-500 text-xs">
                                        *Recommended
                                      </span>
                                    )}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Enter weight in kg"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                      className={
                                        !field.value
                                          ? "border-orange-200 bg-orange-50"
                                          : ""
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="hairColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Hair Color
                                    {!field.value && (
                                      <span className="text-orange-500 text-xs">
                                        *Recommended
                                      </span>
                                    )}
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        className={
                                          !field.value
                                            ? "border-orange-200 bg-orange-50"
                                            : ""
                                        }
                                      >
                                        <SelectValue placeholder="Select hair color" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="black">
                                        Black
                                      </SelectItem>
                                      <SelectItem value="brown">
                                        Brown
                                      </SelectItem>
                                      <SelectItem value="blonde">
                                        Blonde
                                      </SelectItem>
                                      <SelectItem value="red">Red</SelectItem>
                                      <SelectItem value="gray">Gray</SelectItem>
                                      <SelectItem value="other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="eyeColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Eye Color
                                    {!field.value && (
                                      <span className="text-orange-500 text-xs">
                                        *Recommended
                                      </span>
                                    )}
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger
                                        className={
                                          !field.value
                                            ? "border-orange-200 bg-orange-50"
                                            : ""
                                        }
                                      >
                                        <SelectValue placeholder="Select eye color" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="brown">
                                        Brown
                                      </SelectItem>
                                      <SelectItem value="blue">Blue</SelectItem>
                                      <SelectItem value="green">
                                        Green
                                      </SelectItem>
                                      <SelectItem value="hazel">
                                        Hazel
                                      </SelectItem>
                                      <SelectItem value="gray">Gray</SelectItem>
                                      <SelectItem value="other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Services Section - Only for Escorts */}
                  {isEscort && (
                    <div className="border-b border-gray-200">
                      <div className="p-6">
                        <div
                          className="flex items-center justify-between mb-4 cursor-pointer"
                          onClick={() => toggleSection("services")}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-indigo-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                            Services & Specializations
                          </h3>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedSections.services ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {expandedSections.services && (
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="services"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Services Offered
                                    {(!field.value ||
                                      field.value.length === 0) && (
                                      <span className="text-red-500 text-xs">
                                        *Required
                                      </span>
                                    )}
                                  </FormLabel>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                      "In-call",
                                      "Out-call",
                                      "Massage",
                                      "GFE",
                                      "PSE",
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
                                    ].map((service) => (
                                      <div
                                        key={service}
                                        className="flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          id={service}
                                          checked={
                                            field.value?.includes(service) ||
                                            false
                                          }
                                          onCheckedChange={(checked) => {
                                            const updatedServices = checked
                                              ? [
                                                  ...(field.value || []),
                                                  service,
                                                ]
                                              : (field.value || []).filter(
                                                  (s) => s !== service
                                                );
                                            field.onChange(updatedServices);
                                          }}
                                        />
                                        <Label
                                          htmlFor={service}
                                          className="text-sm"
                                        >
                                          {service}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="experience"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    Experience
                                    {!field.value && (
                                      <span className="text-orange-500 text-xs">
                                        *Recommended
                                      </span>
                                    )}
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe your experience in the industry..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Gallery Section - Only for Escorts */}
                  {isEscort && (
                    <div className="border-b border-gray-200">
                      <div className="p-6">
                        <div
                          className="flex items-center justify-between mb-4 cursor-pointer"
                          onClick={() => toggleSection("gallery")}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Gallery Photos
                          </h3>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedSections.gallery ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {expandedSections.gallery && (
                          <div className="space-y-4">
                            {/* Gallery Upload */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm font-medium">
                                  Public Gallery Photos (Max 10 photos)
                                  <span className="text-xs text-gray-500 ml-1">
                                    (Visible to all clients)
                                  </span>
                                </Label>
                                <span className="text-xs text-gray-500">
                                  {userData?.user?.gallery?.length || 0}/10
                                  photos
                                </span>
                              </div>
                              <Dropzone
                                onDrop={handleGalleryUpload}
                                accept="image/*"
                                multiple
                                maxFiles={10}
                                disabled={
                                  userData?.user?.gallery?.length >= 10 ||
                                  uploadingGallery
                                }
                              >
                                {({
                                  getRootProps,
                                  getInputProps,
                                  isDragActive,
                                }) => (
                                  <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                                      uploadingGallery
                                        ? "border-blue-400 bg-blue-50"
                                        : isDragActive
                                        ? "border-blue-400 bg-blue-50"
                                        : "border-gray-300 hover:border-gray-400"
                                    } ${
                                      userData?.user?.gallery?.length >= 10 ||
                                      uploadingGallery
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <input {...getInputProps()} />
                                    {uploadingGallery ? (
                                      <div className="w-8 h-8 mx-auto mb-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                      </div>
                                    ) : (
                                      <svg
                                        className="w-8 h-8 mx-auto text-gray-400 mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                      </svg>
                                    )}
                                    <p className="text-sm text-gray-600">
                                      {uploadingGallery
                                        ? "Uploading photos..."
                                        : userData?.user?.gallery?.length >= 10
                                        ? "Gallery is full (10 photos max)"
                                        : "Click to upload gallery photos"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Drag & drop or click to select photos
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1 font-medium">
                                      💡 These photos will be visible to all
                                      clients in your public profile
                                    </p>
                                  </div>
                                )}
                              </Dropzone>
                            </div>

                            {/* Gallery Display */}
                            {userData?.user?.gallery &&
                              userData.user.gallery.length > 0 && (
                                <div className="grid grid-cols-3 gap-3">
                                  {userData.user.gallery.map((image, index) => {
                                    // Simple direct display of base64 images
                                    const imageUrl = image.url || image;
                                    console.log(
                                      `Gallery image ${index}:`,
                                      image
                                    );

                                    return (
                                      <div
                                        key={index}
                                        className="relative group"
                                      >
                                        <img
                                          src={imageUrl}
                                          alt={`Gallery photo ${index + 1}`}
                                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                          style={{ minHeight: "128px" }}
                                          onError={(e) => {
                                            // Show error placeholder
                                            e.target.style.display = "none";
                                            const fallbackDiv =
                                              document.createElement("div");
                                            fallbackDiv.className =
                                              "w-full h-32 bg-gray-200 rounded-lg border-2 border-gray-200 flex items-center justify-center";
                                            fallbackDiv.innerHTML = `<span class="text-gray-500 text-sm">Photo ${
                                              index + 1
                                            }</span>`;
                                            e.target.parentNode.appendChild(
                                              fallbackDiv
                                            );
                                          }}
                                        />
                                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                          {index === 0 ? "Main" : index + 1}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            console.log("Button clicked!");
                                            console.log("Image:", image);
                                            console.log("Image ID:", image._id);
                                            console.log("Index:", index);
                                            // Use _id if available, otherwise use index
                                            const imageId = image._id || index;
                                            console.log(
                                              "Final imageId to send:",
                                              imageId
                                            );
                                            handleGalleryImageDelete(imageId);
                                          }}
                                          disabled={
                                            deletingImage ===
                                            (image._id || index)
                                          }
                                          className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 ${
                                            deletingImage ===
                                            (image._id || index)
                                              ? "bg-gray-400 cursor-not-allowed"
                                              : "bg-red-500 cursor-pointer hover:bg-red-600"
                                          }`}
                                        >
                                          {deletingImage ===
                                          (image._id || index) ? (
                                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                          ) : (
                                            "×"
                                          )}
                                        </button>
                                        <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                          <svg
                                            className="w-4 h-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                          </svg>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                            <p className="text-xs text-gray-500">
                              {userData?.user?.gallery?.length || 0} photo(s)
                              uploaded
                            </p>

                            {/* No photos message */}
                            {(!userData?.user?.gallery ||
                              userData.user.gallery.length === 0) && (
                              <div className="text-center py-8 text-gray-500">
                                <svg
                                  className="w-12 h-12 mx-auto text-gray-300 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                                  />
                                </svg>
                                <p className="text-sm">
                                  No photos uploaded yet
                                </p>
                                <p className="text-xs">
                                  Upload photos to showcase your profile
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Videos Section - Only for Escorts */}
                  {isEscort && (
                    <div className="border-b border-gray-200">
                      <div className="p-6">
                        <div
                          className="flex items-center justify-between mb-4 cursor-pointer"
                          onClick={() => toggleSection("videos")}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Public Videos (Max 5 videos)
                            <span className="text-sm text-gray-500 ml-2">
                              (Visible to all clients)
                            </span>
                          </h3>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedSections.videos ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {expandedSections.videos && (
                          <div className="space-y-4">
                            {/* Video Upload */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm font-medium">
                                  Public Videos (Max 5 videos)
                                  <span className="text-xs text-gray-500 ml-1">
                                    (Visible to all clients)
                                  </span>
                                </Label>
                                <span className="text-xs text-gray-500">
                                  {userData?.user?.videos?.length || 0}/5 videos
                                </span>
                              </div>
                              <Dropzone
                                onDrop={handleVideoUpload}
                                accept="video/*"
                                multiple
                                maxFiles={5}
                                disabled={
                                  userData?.user?.videos?.length >= 5 ||
                                  uploadingVideos
                                }
                              >
                                {({
                                  getRootProps,
                                  getInputProps,
                                  isDragActive,
                                }) => (
                                  <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                                      uploadingVideos
                                        ? "border-purple-400 bg-purple-50"
                                        : isDragActive
                                        ? "border-purple-400 bg-purple-50"
                                        : "border-gray-300 hover:border-gray-400"
                                    } ${
                                      userData?.user?.videos?.length >= 5 ||
                                      uploadingVideos
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <input {...getInputProps()} />
                                    {uploadingVideos ? (
                                      <div className="w-8 h-8 mx-auto mb-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                      </div>
                                    ) : (
                                      <svg
                                        className="w-8 h-8 mx-auto text-gray-400 mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                      </svg>
                                    )}
                                    <p className="text-sm text-gray-600">
                                      {uploadingVideos
                                        ? "Uploading videos..."
                                        : userData?.user?.videos?.length >= 5
                                        ? "Video gallery is full (5 videos max)"
                                        : "Click to upload videos"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Drag & drop or click to select videos
                                    </p>
                                    <p className="text-xs text-purple-600 mt-1 font-medium">
                                      💡 These videos will be visible to all
                                      clients in your public profile
                                    </p>
                                  </div>
                                )}
                              </Dropzone>
                            </div>

                            {/* Video Display */}
                            {userData?.user?.videos &&
                            userData.user.videos.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {userData.user.videos.map((video, index) => (
                                  <div key={index} className="relative group">
                                    <video
                                      src={video.url}
                                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                      controls
                                    />
                                    <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                                      Video {index + 1}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleVideoDelete(video._id)
                                      }
                                      disabled={deletingVideo === video._id}
                                      className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                                        deletingVideo === video._id
                                          ? "bg-gray-400 cursor-not-allowed"
                                          : "bg-red-500 cursor-pointer hover:bg-red-600"
                                      }`}
                                    >
                                      {deletingVideo === video._id ? (
                                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                        "×"
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <svg
                                  className="w-12 h-12 mx-auto text-gray-400 mb-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                <p className="text-sm">
                                  No videos uploaded yet
                                </p>
                                <p className="text-xs">
                                  Upload videos to showcase your profile
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* About Me Section - For All Users */}
                  <div className="border-b border-gray-200">
                    <div className="p-6">
                      <div
                        className="flex items-center justify-between mb-4 cursor-pointer"
                        onClick={() => toggleSection("about")}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          About Me
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedSections.about ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      {expandedSections.about && (
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                {isEscort ? "Professional Bio" : "About Me"}
                                {!field.value && (
                                  <span className="text-red-500 text-xs">
                                    *Required
                                  </span>
                                )}
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={
                                    isEscort
                                      ? "Tell clients about yourself, your services, and what makes you special..."
                                      : "Tell us about yourself and what you're looking for..."
                                  }
                                  className={`min-h-[120px] ${
                                    !field.value
                                      ? "border-red-200 bg-red-50"
                                      : ""
                                  }`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="p-6">
                    <Button
                      type="submit"
                      disabled={updating}
                      onClick={() =>
                        console.log("Save Changes button clicked!")
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {updating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
