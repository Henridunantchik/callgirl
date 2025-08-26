import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Image,
  Video,
  File,
} from "lucide-react";
import firebaseStorage from "../services/firebaseStorage";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

const FirebaseFileUpload = ({
  onUploadComplete,
  folder = "uploads",
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ["image/*", "video/*"],
  showPreview = true,
  multiple = true,
  userId = null,
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: "pending", // pending, uploading, success, error
      progress: 0,
      url: null,
      error: null,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {}),
    maxFiles,
    maxSize,
    multiple,
  });

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadPromises = files
      .filter((f) => f.status === "pending")
      .map(async (fileObj) => {
        const { file, id } = fileObj;

        // Générer un nom de fichier unique
        const fileName = userId
          ? firebaseStorage.generateUniqueFileName(file.name, userId)
          : `${Date.now()}_${file.name}`;

        const path = firebaseStorage.buildStoragePath(folder, fileName);

        // Mettre à jour le statut
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: "uploading" } : f))
        );

        try {
          const result = await firebaseStorage.uploadFileWithProgress(
            file,
            path,
            (progress) => {
              setUploadProgress((prev) => ({ ...prev, [id]: progress }));
            },
            {
              contentType: file.type,
              customMetadata: {
                originalName: file.name,
                uploadedBy: userId || "anonymous",
                uploadedAt: new Date().toISOString(),
              },
            }
          );

          if (result.success) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id
                  ? {
                      ...f,
                      status: "success",
                      url: result.url,
                      progress: 100,
                    }
                  : f
              )
            );

            // Appeler le callback avec le fichier uploadé
            if (onUploadComplete) {
              onUploadComplete({
                ...result,
                originalFile: file,
                fileId: id,
              });
            }
          } else {
            throw new Error(result.error);
          }
        } catch (error) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id
                ? {
                    ...f,
                    status: "error",
                    error: error.message,
                  }
                : f
            )
          );
        }
      });

    await Promise.all(uploadPromises);
    setUploading(false);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (file.type.startsWith("video/")) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "uploading":
        return <Upload className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragActive
            ? "Déposez les fichiers ici"
            : "Glissez-déposez des fichiers ici"}
        </p>
        <p className="text-sm text-gray-500">
          ou cliquez pour sélectionner des fichiers
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Types acceptés: {acceptedTypes.join(", ")} | Taille max:{" "}
          {formatFileSize(maxSize)}
        </p>
      </div>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Fichiers sélectionnés ({files.length})
            </h3>
            <Button
              onClick={uploadFiles}
              disabled={uploading || files.every((f) => f.status !== "pending")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? "Upload en cours..." : "Uploader les fichiers"}
            </Button>
          </div>

          {files.map((fileObj) => (
            <div key={fileObj.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getFileIcon(fileObj.file)}
                  <div>
                    <p className="font-medium text-sm">{fileObj.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileObj.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusIcon(fileObj.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileObj.id)}
                    className="h-8 w-8 p-0 hover:bg-red-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Barre de progression */}
              {fileObj.status === "uploading" && (
                <Progress
                  value={uploadProgress[fileObj.id] || 0}
                  className="h-2"
                />
              )}

              {/* Statut et erreurs */}
              {fileObj.status === "error" && (
                <p className="text-sm text-red-600 mt-2">{fileObj.error}</p>
              )}

              {fileObj.status === "success" && (
                <p className="text-sm text-green-600 mt-2">
                  Upload réussi ! URL: {fileObj.url}
                </p>
              )}

              {/* Prévisualisation pour les images */}
              {showPreview && fileObj.file.type.startsWith("image/") && (
                <div className="mt-3">
                  <img
                    src={URL.createObjectURL(fileObj.file)}
                    alt={fileObj.file.name}
                    className="w-20 h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FirebaseFileUpload;
