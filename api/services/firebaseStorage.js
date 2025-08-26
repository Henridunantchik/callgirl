import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../config/firebase.js";

class FirebaseStorageService {
  constructor() {
    this.storage = storage;
  }

  // Upload simple d'un fichier
  async uploadFile(file, folder = "general", metadata = {}) {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.originalname
        ? file.originalname.split(".").pop()
        : file.name
        ? file.name.split(".").pop()
        : "jpg";

      const fileName = `${timestamp}-${randomId}.${fileExtension}`;
      const storagePath = `${folder}/${fileName}`;

      // Créer la référence Firebase
      const storageRef = ref(this.storage, storagePath);

      // Upload du fichier
      const snapshot = await uploadBytes(storageRef, file.buffer || file, {
        contentType: file.mimetype || file.type,
        ...metadata,
      });

      // Obtenir l'URL de téléchargement
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log(`✅ Fichier uploadé vers Firebase: ${storagePath}`);

      return {
        success: true,
        url: downloadURL,
        publicId: fileName,
        filePath: storagePath,
        size: file.size,
        mimetype: file.mimetype || file.type,
        storageRef: storagePath,
      };
    } catch (error) {
      console.error("❌ Erreur upload Firebase:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload avec progression (pour gros fichiers)
  uploadFileWithProgress(file, folder = "general", onProgress, metadata = {}) {
    return new Promise((resolve, reject) => {
      try {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.originalname
          ? file.originalname.split(".").pop()
          : file.name
          ? file.name.split(".").pop()
          : "jpg";

        const fileName = `${timestamp}-${randomId}.${fileExtension}`;
        const storagePath = `${folder}/${fileName}`;

        const storageRef = ref(this.storage, storagePath);
        const uploadTask = uploadBytesResumable(
          storageRef,
          file.buffer || file,
          {
            contentType: file.mimetype || file.type,
            ...metadata,
          }
        );

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(progress);
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                success: true,
                url: downloadURL,
                publicId: fileName,
                filePath: storagePath,
                size: file.size,
                mimetype: file.mimetype || file.type,
                storageRef: storagePath,
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  // Supprimer un fichier
  async deleteFile(storagePath) {
    try {
      const storageRef = ref(this.storage, storagePath);
      await deleteObject(storageRef);
      console.log(`✅ Fichier supprimé de Firebase: ${storagePath}`);
      return { success: true };
    } catch (error) {
      console.error("❌ Erreur suppression Firebase:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Lister tous les fichiers dans un dossier
  async listFiles(folderPath) {
    try {
      const folderRef = ref(this.storage, folderPath);
      const result = await listAll(folderRef);

      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url: url,
          };
        })
      );

      return {
        success: true,
        files: files,
      };
    } catch (error) {
      console.error("❌ Erreur liste fichiers Firebase:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Obtenir l'URL d'un fichier existant
  async getFileURL(storagePath) {
    try {
      const storageRef = ref(this.storage, storagePath);
      const url = await getDownloadURL(storageRef);
      return { success: true, url };
    } catch (error) {
      console.error("❌ Erreur récupération URL Firebase:", error);
      return { success: false, error: error.message };
    }
  }

  // Vérifier si un fichier existe
  async fileExists(storagePath) {
    try {
      const storageRef = ref(this.storage, storagePath);
      await getDownloadURL(storageRef);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Générer un nom de fichier unique
  generateUniqueFileName(originalName, userId = null) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split(".").pop();
    const prefix = userId ? `${userId}_` : "";
    return `${prefix}${timestamp}_${randomString}.${extension}`;
  }

  // Construire le chemin de stockage
  buildStoragePath(folder, fileName) {
    return `${folder}/${fileName}`;
  }
}

export default new FirebaseStorageService();
