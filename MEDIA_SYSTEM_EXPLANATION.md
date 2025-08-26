# 🎯 SYSTÈME DES MÉDIAS - EXPLICATION COMPLÈTE

## 🏗️ **ARCHITECTURE GÉNÉRALE**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │      API        │    │   RENDER        │
│   (React)       │◄──►│   (Node.js)     │◄──►│   STORAGE       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 **TYPES DE MÉDIAS SUPPORTÉS**

### **1. 🖼️ AVATARS (Photos de Profil)**

- **Limite** : 1 par utilisateur
- **Dossier** : `/opt/render/project/src/uploads/avatars/`
- **Format** : JPG, PNG, GIF, WebP
- **Taille max** : 5MB

### **2. 🖼️ GALERIE (Photos Publiques)**

- **Limite** : 10 photos (basic) / 20 photos (verified)
- **Dossier** : `/opt/render/project/src/uploads/gallery/`
- **Format** : JPG, PNG, GIF, WebP
- **Taille max** : 10MB
- **Visibilité** : Publique (tous les clients)

### **3. 🎥 VIDÉOS (Vidéos Publiques)**

- **Limite** : 5 vidéos (basic) / 10 vidéos (verified)
- **Dossier** : `/opt/render/project/src/uploads/videos/`
- **Format** : MP4, AVI, MOV, WMV
- **Taille max** : 100MB
- **Visibilité** : Publique (tous les clients)

## 🔄 **FLUX D'UPLOAD COMPLET**

### **Étape 1: Sélection de Fichier (Frontend)**

```javascript
// L'utilisateur sélectionne un fichier
const file = event.target.files[0];

// Validation côté client
if (file.size > maxSize) {
  showError("Fichier trop volumineux");
  return;
}
```

### **Étape 2: Préparation de l'Upload (Frontend)**

```javascript
// Création du FormData
const formData = new FormData();
formData.append("images", file); // ou "avatar" ou "video"

// Envoi vers l'API
const response = await fetch("/api/escort/gallery/" + userId, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

### **Étape 3: Réception de Fichier (API)**

```javascript
// Middleware Multer traite le fichier
// Le fichier est temporairement stocké dans req.files
export const uploadGallery = asyncHandler(async (req, res, next) => {
  // Vérification des permissions
  if (id !== userId) {
    throw new ApiError(403, "Accès non autorisé");
  }

  // Vérification des limites
  const canUpload = escort.canUploadMedia("photo", escort.gallery.length);
  if (!canUpload) {
    throw new ApiError(403, "Limite d'upload atteinte");
  }
});
```

### **Étape 4: Traitement du Fichier (Service RenderStorage)**

```javascript
async uploadFile(file, folder = "gallery") {
  // 1. Génération d'un nom unique
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const fileName = `${timestamp}-${randomId}${path.extname(file.originalname)}`;

  // 2. Détermination du dossier de destination
  let uploadDir;
  switch (folder) {
    case "avatar": uploadDir = renderStorageConfig.directories.avatars; break;
    case "gallery": uploadDir = renderStorageConfig.directories.gallery; break;
    case "video": uploadDir = renderStorageConfig.directories.videos; break;
  }

  // 3. Création du dossier si nécessaire
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 4. Copie du fichier vers la destination finale
  const filePath = path.join(uploadDir, fileName);
  await fs.promises.copyFile(file.path, filePath);

  // 5. Génération de l'URL publique
  const publicUrl = renderStorageConfig.getFileUrl(filePath);

  // 6. Nettoyage du fichier temporaire
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  return { success: true, url: publicUrl, publicId: fileName, filePath };
}
```

### **Étape 5: Sauvegarde en Base de Données**

```javascript
// Création de l'objet média
const mediaItem = {
  url: result.url, // URL publique du fichier
  publicId: result.publicId, // Nom unique du fichier
  filePath: result.filePath, // Chemin sur le serveur
  caption: "", // Légende (optionnelle)
  isPrivate: false, // Visibilité
  order: escort.gallery.length, // Ordre dans la galerie
};

// Ajout à la galerie de l'escort
escort.gallery.push(mediaItem);

// Sauvegarde en base
await escort.save();
```

### **Étape 6: Réponse à l'Utilisateur**

```javascript
return res.status(200).json(
  new ApiResponse(
    200,
    {
      escort: { gallery: escort.gallery },
      uploadedFiles,
      currentCount: escort.gallery.length,
    },
    "Gallery uploaded successfully"
  )
);
```

## 🌐 **SERVIE DES FICHIERS (Affichage)**

### **1. Génération d'URLs**

```javascript
// Dans renderStorageConfig.getFileUrl()
getFileUrl(filePath) {
  if (config.NODE_ENV === "production") {
    // Production: URL Render
    const relativePath = filePath.replace("/opt/render/project/src/uploads", "");
    return `https://callgirls-api.onrender.com/uploads${relativePath}`;
  } else {
    // Développement: URL locale
    return `http://localhost:5000/uploads${relativePath}`;
  }
}
```

### **2. Middleware de Servie des Fichiers**

```javascript
// Dans api/index.js
app.use(
  "/uploads",
  // 1. CORS headers
  corsMiddleware,

  // 2. Middleware de fallback intelligent
  fileFallbackMiddleware,

  // 3. Servie statique conditionnel
  config.NODE_ENV === "production"
    ? express.static("/opt/render/project/src/uploads")
    : express.static("./uploads")
);
```

### **3. Fallback Intelligent**

```javascript
// Si le fichier n'existe pas dans Render, essayer la sauvegarde locale
export const fileFallbackMiddleware = (req, res, next) => {
  const filePath = req.path.replace("/uploads/", "");

  // Essayer Render d'abord
  const renderPath = path.join("/opt/render/project/src/uploads", filePath);
  if (fs.existsSync(renderPath)) {
    return next(); // Fichier trouvé dans Render
  }

  // Essayer la sauvegarde locale
  const localPath = path.join(__dirname, "../uploads", filePath);
  if (fs.existsSync(localPath)) {
    // Servir depuis la sauvegarde locale
    const stream = fs.createReadStream(localPath);
    stream.pipe(res);
    return;
  }

  // Fichier non trouvé
  res.status(404).json({ error: "File not found" });
};
```

## 🔒 **SÉCURITÉ ET PERMISSIONS**

### **1. Authentification**

- ✅ Tous les uploads nécessitent un token JWT valide
- ✅ L'utilisateur ne peut uploader que sur son propre profil

### **2. Validation des Fichiers**

- ✅ Vérification du type MIME
- ✅ Vérification de la taille
- ✅ Vérification des extensions autorisées

### **3. Limites d'Upload**

```javascript
// Vérification des limites selon le niveau d'abonnement
const canUpload = escort.canUploadMedia("photo", escort.gallery.length);
if (!canUpload) {
  const limit = escort.subscriptionTier === "verified" ? 20 : 10;
  throw new ApiError(403, `Limite atteinte: ${limit} photos max`);
}
```

## 📊 **STRUCTURE DES DONNÉES**

### **1. Objet Média en Base**

```javascript
{
  _id: ObjectId,
  url: "https://callgirls-api.onrender.com/uploads/gallery/1234567890-abc123.jpg",
  publicId: "1234567890-abc123.jpg",
  filePath: "/opt/render/project/src/uploads/gallery/1234567890-abc123.jpg",
  caption: "Ma photo de profil",
  isPrivate: false,
  order: 0,
  createdAt: Date,
  updatedAt: Date
}
```

### **2. Galerie d'Escort**

```javascript
{
  _id: ObjectId,
  name: "Lola Lala",
  gallery: [
    // Photo 1
    {
      url: "https://callgirls-api.onrender.com/uploads/gallery/photo1.jpg",
      publicId: "photo1.jpg",
      caption: "Photo principale"
    },
    // Photo 2
    {
      url: "https://callgirls-api.onrender.com/uploads/gallery/photo2.jpg",
      publicId: "photo2.jpg",
      caption: "Photo secondaire"
    }
  ],
  videos: [
    // Vidéo 1
    {
      url: "https://callgirls-api.onrender.com/uploads/videos/video1.mp4",
      publicId: "video1.mp4",
      caption: "Ma vidéo"
    }
  ]
}
```

## 🚀 **AVANTAGES DU SYSTÈME**

### **1. Performance**

- ✅ Fichiers servis directement par Express (pas de base de données)
- ✅ URLs publiques optimisées
- ✅ Fallback intelligent pour la fiabilité

### **2. Scalabilité**

- ✅ Support de gros fichiers (jusqu'à 100MB)
- ✅ Gestion automatique des dossiers
- ✅ Noms de fichiers uniques (pas de conflits)

### **3. Fiabilité**

- ✅ Sauvegarde locale en cas de problème Render
- ✅ Nettoyage automatique des fichiers temporaires
- ✅ Gestion d'erreurs robuste

## 🔧 **MAINTENANCE ET MONITORING**

### **1. Endpoints de Debug**

- `/debug/files` - Configuration et statut du stockage
- `/api/storage/health` - Santé du système de fichiers

### **2. Logs Automatiques**

- ✅ Uploads réussis
- ✅ Erreurs d'upload
- ✅ Accès aux fichiers
- ✅ Problèmes de stockage

### **3. Nettoyage Automatique**

- ✅ Suppression des fichiers temporaires
- ✅ Gestion des erreurs d'upload
- ✅ Fallback vers les sauvegardes

---

**🎉 Ce système garantit que vos photos, vidéos et avatars sont uploadés, stockés et affichés de manière fiable et sécurisée !**
