import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/user/user.slice";
import { useForm } from "react-hook-form";
import Loading from "@/components/Loading";
import Dropzone from "react-dropzone";
import { showToast } from "@/helpers/showToast";
import { userAPI, escortAPI } from "@/services/api";
import {
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Camera,
  Video,
  Save,
  User,
  MapPin,
  DollarSign,
  Heart,
  Star,
  Settings,
  Eye,
  EyeOff,
  Languages,
} from "lucide-react";

// Validation schema for escort profile
const escortProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  alias: z.string().min(2, "Professional name must be at least 2 characters"),
  age: z
    .number()
    .min(18, "Must be at least 18 years old")
    .max(99, "Invalid age"),
  gender: z.string().min(1, "Please select gender"),
  city: z.string().min(1, "Please enter your city"),
  neighborhood: z.string().optional(),
  hourlyRate: z.number().min(1, "Hourly rate must be at least 1"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  bodyType: z.string().optional(),
  ethnicity: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  experience: z.string().optional(),
  languages: z.array(z.string()).optional(),
  services: z.array(z.string()).min(1, "Please select at least one service"),
});

const EscortProfileEdit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    location: true,
    personal: true,
    languages: true,
    services: true,
    about: true,
    gallery: true,
    videos: true,
  });

  // Form setup
  const form = useForm({
    resolver: zodResolver(escortProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      telegram: "",
      alias: "",
      age: 18,
      gender: "",
      city: "",
      neighborhood: "",
      hourlyRate: 100,
      bio: "",
      bodyType: "",
      ethnicity: "",
      height: 0,
      weight: 0,
      hairColor: "",
      eyeColor: "",
      experience: "",
      languages: [],
      services: [],
    },
  });

  // Load user data
  useEffect(() => {
    if (user) {
      console.log("=== LOADING USER DATA ===");
      console.log("User data:", user);
      console.log("Body type:", user.bodyType);
      console.log("Hair color:", user.hairColor);
      console.log("Eye color:", user.eyeColor);

      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        whatsapp: user.whatsapp || "",
        telegram: user.telegram || "",
        alias: user.alias || "",
        age: user.age || 18,
        gender: user.gender || "",
        city: user.location?.city || "",
        neighborhood: user.location?.subLocation || "",
        hourlyRate: user.rates?.hourly || 100,
        bio: user.bio || "",
        bodyType: user.bodyType || "",
        ethnicity: user.ethnicity || "",
        height: user.height ? parseInt(user.height) : 0,
        weight: user.weight ? parseInt(user.weight) : 0,
        hairColor: user.hairColor || "",
        eyeColor: user.eyeColor || "",
        experience: user.experience || "",
        languages: user.languages || [],
        services: user.services || [],
      });
    }
  }, [user, form]);

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!user) return { percentage: 0, breakdown: {} };

    const fields = [
      { key: "name", value: user.name, weight: 5 },
      { key: "email", value: user.email, weight: 5 },
      { key: "phone", value: user.phone, weight: 5 },
      { key: "alias", value: user.alias, weight: 3 },
      { key: "age", value: user.age, weight: 3 },
      { key: "gender", value: user.gender, weight: 3 },
      { key: "city", value: user.location?.city, weight: 3 },
      { key: "hourlyRate", value: user.rates?.hourly, weight: 3 },
      { key: "services", value: user.services?.length > 0, weight: 4 },
      { key: "bio", value: user.bio, weight: 4 },
      { key: "gallery", value: user.gallery?.length > 0, weight: 5 },
    ];

    let totalWeight = 0;
    let completedWeight = 0;
    const breakdown = {};

    fields.forEach(({ key, value, weight }) => {
      totalWeight += weight;
      const isCompleted =
        value &&
        (typeof value === "boolean" ? value : value.toString().length > 0);
      if (isCompleted) {
        completedWeight += weight;
        breakdown[key] = "completed";
      } else {
        breakdown[key] = "missing";
      }
    });

    const percentage =
      totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

    return { percentage, breakdown };
  };

  const profileCompletion = calculateProfileCompletion();

  // Save functions for each section
  const saveBasicInfo = async () => {
    const values = form.getValues();
    try {
      setSaving(true);
      showToast("Saving basic information...", "info");

      const updateData = {
        name: values.name?.trim(),
        email: values.email?.trim(),
        phone: values.phone?.trim(),
        whatsapp: values.whatsapp?.trim(),
        telegram: values.telegram?.trim(),
        alias: values.alias?.trim(),
        age: values.age,
        gender: values.gender,
      };

      console.log("=== SAVE BASIC INFO DEBUG ===");
      console.log("Form values:", values);
      console.log("Update data:", updateData);

      const response = await userAPI.updateUserProfile(updateData);
      console.log("API response:", response.data);

      if (response.data.success) {
        dispatch(setUser(response.data.user));
        // Update form with new data using reset to force re-render
        const currentValues = form.getValues();
        form.reset({
          ...currentValues,
          name: response.data.user.name || currentValues.name,
          email: response.data.user.email || currentValues.email,
          phone: response.data.user.phone || currentValues.phone,
          whatsapp: response.data.user.whatsapp || currentValues.whatsapp,
          telegram: response.data.user.telegram || currentValues.telegram,
          alias: response.data.user.alias || currentValues.alias,
          age: response.data.user.age || currentValues.age,
          gender: response.data.user.gender || currentValues.gender,
        });
        showToast("Basic information saved!", "success");
        console.log("✅ Basic info saved successfully");
      } else {
        showToast("Failed to save basic information", "error");
        console.log("❌ API returned success: false");
      }
    } catch (error) {
      console.error("Error saving basic info:", error);
      showToast("Failed to save basic information", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveLocationPricing = async () => {
    const values = form.getValues();
    try {
      setSaving(true);
      showToast("Saving location & pricing...", "info");

      const updateData = {
        location: {
          city: values.city?.trim(),
          subLocation: values.neighborhood?.trim(),
        },
        rates: {
          hourly: values.hourlyRate,
        },
      };

      const response = await userAPI.updateUserProfile(updateData);
      if (response.data.success) {
        dispatch(setUser(response.data.user));
        // Update form with new data using reset to force re-render
        const currentValues = form.getValues();
        form.reset({
          ...currentValues,
          city: response.data.user.location?.city || currentValues.city,
          neighborhood:
            response.data.user.location?.subLocation ||
            currentValues.neighborhood,
          hourlyRate:
            response.data.user.rates?.hourly || currentValues.hourlyRate,
        });
        showToast("Location & pricing saved!", "success");
      }
    } catch (error) {
      console.error("Error saving location:", error);
      showToast("Failed to save location & pricing", "error");
    } finally {
      setSaving(false);
    }
  };

  const savePersonalDetails = async () => {
    const values = form.getValues();
    try {
      setSaving(true);
      showToast("Saving personal details...", "info");

      const updateData = {
        bodyType: values.bodyType,
        ethnicity: values.ethnicity,
        height: values.height,
        weight: values.weight,
        hairColor: values.hairColor,
        eyeColor: values.eyeColor,
        experience: values.experience?.trim(),
      };

      console.log("=== SAVE PERSONAL DETAILS DEBUG ===");
      console.log("Form values:", values);
      console.log("Experience from form:", values.experience);
      console.log("Update data being sent:", updateData);

      const response = await userAPI.updateUserProfile(updateData);
      console.log("=== API RESPONSE DEBUG ===");
      console.log("Full API response:", response.data);
      console.log("User returned from API:", response.data.user);
      console.log("Experience from API:", response.data.user?.experience);

      if (response.data.success) {
        dispatch(setUser(response.data.user));
        // Update form with new data
        console.log("=== UPDATING FORM AFTER SAVE ===");
        console.log("Response user experience:", response.data.user.experience);
        console.log("Current form values:", form.getValues());

        // Update form with new data using reset to force re-render
        const currentValues = form.getValues();
        console.log("=== FORM RESET DEBUG ===");
        console.log("Current form values before reset:", currentValues);
        console.log("Current experience in form:", currentValues.experience);
        console.log("Experience from API:", response.data.user.experience);

        // Keep current form values and only update if API has new data
        const newFormValues = {
          ...currentValues,
          bodyType: response.data.user.bodyType || currentValues.bodyType,
          ethnicity: response.data.user.ethnicity || currentValues.ethnicity,
          height: response.data.user.height
            ? parseInt(response.data.user.height)
            : currentValues.height,
          weight: response.data.user.weight
            ? parseInt(response.data.user.weight)
            : currentValues.weight,
          hairColor: response.data.user.hairColor || currentValues.hairColor,
          eyeColor: response.data.user.eyeColor || currentValues.eyeColor,
          experience: response.data.user.experience || currentValues.experience, // ← Garde la valeur actuelle si API est vide
        };

        console.log("New form values to set:", newFormValues);
        console.log("Final experience value:", newFormValues.experience);

        form.reset(newFormValues);

        console.log(
          "Form reset with experience:",
          response.data.user.experience
        );
        showToast("Personal details saved!", "success");
      }
    } catch (error) {
      console.error("Error saving personal details:", error);
      showToast("Failed to save personal details", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveLanguages = async () => {
    const values = form.getValues();
    try {
      setSaving(true);
      showToast("Saving languages...", "info");

      const updateData = {
        languages: values.languages,
      };

      const response = await userAPI.updateUserProfile(updateData);

      if (response.data.success) {
        dispatch(setUser(response.data.user));
        // Update form with new data using reset to force re-render
        const currentValues = form.getValues();
        form.reset({
          ...currentValues,
          languages: response.data.user.languages || currentValues.languages,
        });
        showToast("Languages saved!", "success");
      } else {
        showToast("Failed to save languages", "error");
      }
    } catch (error) {
      console.error("Error saving languages:", error);
      showToast("Failed to save languages", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveServices = async () => {
    const values = form.getValues();
    try {
      setSaving(true);
      showToast("Saving services...", "info");

      const updateData = {
        services: values.services,
      };

      const response = await userAPI.updateUserProfile(updateData);
      if (response.data.success) {
        dispatch(setUser(response.data.user));
        // Update form with new data using reset to force re-render
        const currentValues = form.getValues();
        form.reset({
          ...currentValues,
          services: response.data.user.services || currentValues.services,
        });
        showToast("Services saved!", "success");
      }
    } catch (error) {
      console.error("Error saving services:", error);
      showToast("Failed to save services", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveBio = async () => {
    const values = form.getValues();
    try {
      setSaving(true);
      showToast("Saving bio...", "info");

      const updateData = {
        bio: values.bio?.trim(),
      };

      const response = await userAPI.updateUserProfile(updateData);
      if (response.data.success) {
        dispatch(setUser(response.data.user));
        // Update form with new data using reset to force re-render
        const currentValues = form.getValues();
        form.reset({
          ...currentValues,
          bio: response.data.user.bio || currentValues.bio,
        });
        showToast("Bio saved!", "success");
      }
    } catch (error) {
      console.error("Error saving bio:", error);
      showToast("Failed to save bio", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission (for the main save button)
  const onSubmit = async (values) => {
    try {
      setSaving(true);
      showToast("Saving all changes...", "info");

      const updateData = {
        name: values.name?.trim(),
        email: values.email?.trim(),
        phone: values.phone?.trim(),
        alias: values.alias?.trim(),
        age: values.age,
        gender: values.gender,
        location: {
          city: values.city?.trim(),
          subLocation: values.neighborhood?.trim(),
        },
        rates: {
          hourly: values.hourlyRate,
        },
        services: values.services,
        bio: values.bio?.trim(),
        bodyType: values.bodyType,
        ethnicity: values.ethnicity,
        height: values.height,
        weight: values.weight,
        hairColor: values.hairColor,
        eyeColor: values.eyeColor,
        experience: values.experience?.trim(),
        languages: values.languages,
      };

      console.log("Submitting escort profile update:", updateData);

      const response = await userAPI.updateUserProfile(updateData);

      if (response.data.success) {
        dispatch(setUser(response.data.user));
        showToast("Profile updated successfully!", "success");
      } else {
        showToast("Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (files) => {
    try {
      setUploadingAvatar(true);
      const file = files[0];

      const formData = new FormData();
      formData.append("file", file);

      const response = await userAPI.uploadAvatar(formData);

      if (response.data.success) {
        dispatch(setUser({ ...user, avatar: response.data.avatar }));
        showToast("Avatar updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      showToast("Failed to upload avatar", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle gallery upload
  const handleGalleryUpload = async (files) => {
    try {
      setUploadingGallery(true);
      showToast("Uploading gallery photos...", "info");

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("gallery", file);
      });

      console.log("=== GALLERY UPLOAD DEBUG ===");
      console.log("User ID:", user._id);
      console.log("Files to upload:", files.length);

      const response = await escortAPI.uploadGallery(user._id, formData);
      console.log("Gallery upload response:", response.data);

      if (response.data.success) {
        dispatch(setUser({ ...user, gallery: response.data.escort.gallery }));
        showToast("Gallery updated successfully!", "success");
        console.log("✅ Gallery uploaded successfully");
      } else {
        showToast("Failed to upload gallery", "error");
        console.log("❌ Gallery upload failed");
      }
    } catch (error) {
      console.error("Error uploading gallery:", error);
      showToast("Failed to upload gallery", "error");
    } finally {
      setUploadingGallery(false);
    }
  };

  // Handle video upload
  const handleVideoUpload = async (files) => {
    try {
      setUploadingVideos(true);
      setVideoUploadProgress(0);
      showToast("Uploading videos...", "info");

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("video", file);
      });

      console.log("=== VIDEO UPLOAD DEBUG ===");
      console.log("User ID:", user._id);
      console.log("Files to upload:", files.length);

      // Simulate realistic progress based on file size
      const totalFiles = files.length;
      let completedFiles = 0;

      // Calculate total file size for progress
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      let uploadedSize = 0;

      const progressInterval = setInterval(() => {
        uploadedSize += totalSize / 20; // Simulate upload progress
        const progress = Math.min(
          Math.round((uploadedSize / totalSize) * 100),
          95
        );
        setVideoUploadProgress(progress);

        if (progress >= 95) {
          clearInterval(progressInterval);
        }
      }, 200);

      const response = await escortAPI.uploadVideo(user._id, formData);
      console.log("Video upload response:", response.data);

      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setVideoUploadProgress(100);

      if (response.data.success) {
        dispatch(setUser({ ...user, videos: response.data.escort.videos }));
        showToast("Videos updated successfully!", "success");
        console.log("✅ Videos uploaded successfully");
      } else {
        showToast("Failed to upload videos", "error");
        console.log("❌ Video upload failed");
      }
    } catch (error) {
      console.error("Error uploading videos:", error);
      showToast("Failed to upload videos", "error");
    } finally {
      setUploadingVideos(false);
      setVideoUploadProgress(0);
    }
  };

  // Save gallery (confirmation function)
  const saveGallery = async () => {
    try {
      setSaving(true);
      showToast("Gallery saved!", "success");
      console.log("✅ Gallery saved successfully");
    } catch (error) {
      console.error("Error saving gallery:", error);
      showToast("Failed to save gallery", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete gallery image
  const deleteGalleryImage = async (imageId) => {
    try {
      setSaving(true);
      showToast("Deleting photo...", "info");

      console.log("=== DELETE GALLERY IMAGE DEBUG ===");
      console.log("User ID:", user._id);
      console.log("Image ID:", imageId);

      const response = await escortAPI.deleteGalleryImage(user._id, imageId);
      console.log("Delete response:", response.data);

      if (response.data.success) {
        // Update user state by removing the deleted image
        const updatedGallery = user.gallery.filter(
          (img) => img._id !== imageId
        );
        dispatch(setUser({ ...user, gallery: updatedGallery }));
        showToast("Photo deleted successfully!", "success");
        console.log("✅ Photo deleted successfully");
      } else {
        showToast("Failed to delete photo", "error");
        console.log("❌ Photo deletion failed");
      }
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      showToast("Failed to delete photo", "error");
    } finally {
      setSaving(false);
    }
  };

  // Save videos (confirmation function)
  const saveVideos = async () => {
    try {
      setSaving(true);
      showToast("Videos saved!", "success");
      console.log("✅ Videos saved successfully");
    } catch (error) {
      console.error("Error saving videos:", error);
      showToast("Failed to save videos", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete video
  const deleteVideo = async (videoId) => {
    try {
      setSaving(true);
      showToast("Deleting video...", "info");

      console.log("=== DELETE VIDEO DEBUG ===");
      console.log("User ID:", user._id);
      console.log("Video ID:", videoId);

      const response = await escortAPI.deleteVideo(user._id, videoId);
      console.log("Delete response:", response.data);

      if (response.data.success) {
        // Update user state by removing the deleted video
        const updatedVideos = user.videos.filter((vid) => vid._id !== videoId);
        dispatch(setUser({ ...user, videos: updatedVideos }));
        showToast("Video deleted successfully!", "success");
        console.log("✅ Video deleted successfully");
      } else {
        showToast("Failed to delete video", "error");
        console.log("❌ Video deletion failed");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      showToast("Failed to delete video", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return <Loading />;
  }

  if (!user || user.role !== "escort") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            This page is only available for escort profiles.
          </p>
          <Button
            onClick={() => {
              const pathParts = window.location.pathname.split("/");
              const countryCode = pathParts[1];
              navigate(`/${countryCode}`);
            }}
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Escort Profile Management
        </h1>
        <p className="text-gray-600">
          Manage your escort profile, gallery, services, and settings
        </p>
      </div>

      {/* Profile Completion */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Complete your profile to get more bookings
          </p>
          <div className="flex items-center gap-4 mb-4">
            <Progress value={profileCompletion.percentage} className="flex-1" />
            <span className="text-sm font-medium">
              {profileCompletion.percentage}%
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Complete (
            {
              Object.values(profileCompletion.breakdown).filter(
                (v) => v === "completed"
              ).length
            }
            /{Object.keys(profileCompletion.breakdown).length} points)
          </p>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("basic")}
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </div>
                {expandedSections.basic ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>
            {expandedSections.basic && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="alias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1234567890" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telegram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telegram Username (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="@username or username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="18" max="99" />
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
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="transgender">
                              Transgender
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={saveBasicInfo}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Basic Info"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Location & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("location")}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location & Pricing
                </div>
                {expandedSections.location ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>
            {expandedSections.location && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate (UGX)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={saveLocationPricing}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Location & Pricing"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("personal")}
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Details
                </div>
                {expandedSections.personal ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>
            {expandedSections.personal && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bodyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Type *Recommended</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select body type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Slim">Slim</SelectItem>
                            <SelectItem value="Athletic">Athletic</SelectItem>
                            <SelectItem value="Average">Average</SelectItem>
                            <SelectItem value="Curvy">Curvy</SelectItem>
                            <SelectItem value="Plus Size">Plus Size</SelectItem>
                            <SelectItem value="BBW">BBW</SelectItem>
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
                        <FormLabel>Ethnicity *Recommended</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ethnicity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="african">African</SelectItem>
                            <SelectItem value="asian">Asian</SelectItem>
                            <SelectItem value="caucasian">Caucasian</SelectItem>
                            <SelectItem value="hispanic">Hispanic</SelectItem>
                            <SelectItem value="middle-eastern">
                              Middle Eastern
                            </SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                        <FormLabel>Height (cm) *Recommended</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="100" max="250" />
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
                        <FormLabel>Weight (kg) *Recommended</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="30" max="200" />
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
                        <FormLabel>Hair Color *Recommended</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select hair color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Black">Black</SelectItem>
                            <SelectItem value="Brown">Brown</SelectItem>
                            <SelectItem value="Blonde">Blonde</SelectItem>
                            <SelectItem value="Red">Red</SelectItem>
                            <SelectItem value="Gray">Gray</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
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
                        <FormLabel>Eye Color *Recommended</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select eye color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Brown">Brown</SelectItem>
                            <SelectItem value="Blue">Blue</SelectItem>
                            <SelectItem value="Green">Green</SelectItem>
                            <SelectItem value="Hazel">Hazel</SelectItem>
                            <SelectItem value="Gray">Gray</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience *Recommended</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe your experience in the industry..."
                          rows={4}
                        />
                      </FormControl>
                      {/* Display saved experience text below */}
                      {form.watch("experience") &&
                        form.watch("experience").trim() && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700 font-medium">
                              Saved Experience:
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {form.watch("experience")}
                            </p>
                          </div>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={savePersonalDetails}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Personal Details"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("languages")}
              >
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Languages
                </div>
                {expandedSections.languages ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>
            {expandedSections.languages && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="languages"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          "English",
                          "French",
                          "Spanish",
                          "German",
                          "Italian",
                          "Portuguese",
                          "Russian",
                          "Chinese",
                          "Japanese",
                          "Korean",
                          "Arabic",
                          "Hindi",
                          "Swahili",
                          "Luganda",
                          "Other",
                        ].map((language) => (
                          <FormField
                            key={language}
                            control={form.control}
                            name="languages"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={language}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(language)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              language,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== language
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {language}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={saveLanguages}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Languages"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("services")}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Services & Specializations
                </div>
                {expandedSections.services ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>
            {expandedSections.services && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="services"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[
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
                        ].map((service) => (
                          <FormField
                            key={service}
                            control={form.control}
                            name="services"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={service}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(service)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              service,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== service
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {service}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={saveServices}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Services"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* About Me */}
          <Card>
            <CardHeader>
              <CardTitle
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("about")}
              >
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  About Me
                </div>
                {expandedSections.about ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>
            {expandedSections.about && (
              <CardContent>
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Bio *Required</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell clients about yourself, your services, and what makes you special..."
                          rows={6}
                        />
                      </FormControl>
                      {/* Display saved bio text below */}
                      {form.watch("bio") && form.watch("bio").trim() && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700 font-medium">
                            Saved Bio:
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {form.watch("bio")}
                          </p>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    onClick={saveBio}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Bio"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Gallery */}
          <Card>
            <CardHeader>
              <CardTitle
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("gallery")}
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Gallery Photos
                </div>
                {expandedSections.gallery ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>
            {expandedSections.gallery && (
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Public Gallery Photos (Max 10 photos)
                  </p>
                  <p className="text-xs text-gray-500">
                    💡 These photos will be visible to all clients in your
                    public profile
                  </p>
                </div>

                <Dropzone
                  onDrop={handleGalleryUpload}
                  accept={{ "image/*": [] }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploadingGallery
                          ? "Uploading..."
                          : "Click to upload gallery photos"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Drag & drop or click to select photos
                      </p>
                    </div>
                  )}
                </Dropzone>

                {user.gallery && user.gallery.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">
                        {user.gallery.length}/10 photos
                      </p>
                      <Button
                        type="button"
                        onClick={saveGallery}
                        disabled={saving}
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Photos"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {user.gallery.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo.url}
                            alt={`Gallery photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <Button
                            type="button"
                            onClick={() => deleteGalleryImage(photo._id)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            size="sm"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Videos */}
          <Card>
            <CardHeader>
              <CardTitle
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("videos")}
              >
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Videos
                </div>
                {expandedSections.videos ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>
            {expandedSections.videos && (
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Public Videos (Max 5 videos)
                  </p>
                  <p className="text-xs text-gray-500">
                    💡 These videos will be visible to all clients in your
                    public profile
                  </p>
                </div>

                <Dropzone onDrop={handleVideoUpload} accept={{ "video/*": [] }}>
                  {({ getRootProps, getInputProps }) => (
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploadingVideos
                          ? "Uploading..."
                          : "Click to upload videos"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Drag & drop or click to select videos
                      </p>
                    </div>
                  )}
                </Dropzone>

                {/* Progress bar for video upload */}
                {uploadingVideos && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Uploading video...
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        {videoUploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${videoUploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">
                      {user.videos ? user.videos.length : 0}/5 videos
                    </p>
                    <Button
                      type="button"
                      onClick={saveVideos}
                      disabled={saving}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Videos"}
                    </Button>
                  </div>
                  {user.videos && user.videos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.videos.map((video, index) => (
                        <div key={index} className="relative group">
                          <video
                            src={video.url}
                            controls
                            className="w-full rounded"
                          />
                          <Button
                            type="button"
                            onClick={() => deleteVideo(video._id)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            size="sm"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EscortProfileEdit;
