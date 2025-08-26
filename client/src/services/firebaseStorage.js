import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../helpers/firebase";

class FirebaseStorageService {
  constructor() {
    this.storage = storage;
  }

  // Upload simple d'un fichier
  async uploadFile(file, path, metadata = {}) {
    try {
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        url: downloadURL,
        path: path,
        size: file.size,
        type: file.type,
      };
    } catch (error) {
      console.error("Erreur upload Firebase:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload avec progression (pour gros fichiers)
  uploadFileWithProgress(file, path, onProgress, metadata = {}) {
    return new Promise((resolve, reject) => {
      const storageRef = ref(this.storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

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
              path: path,
              size: file.size,
              type: file.type,
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  // Supprimer un fichier
  async deleteFile(path) {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
      return { success: true };
    } catch (error) {
      console.error("Erreur suppression Firebase:", error);
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
      console.error("Erreur liste fichiers Firebase:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Générer un nom de fichier unique
  generateUniqueFileName(originalName, userId) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split(".").pop();
    return `${userId}_${timestamp}_${randomString}.${extension}`;
  }

  // Construire le chemin de stockage
  buildStoragePath(folder, fileName) {
    return `${folder}/${fileName}`;
  }
}

export default new FirebaseStorageService();
