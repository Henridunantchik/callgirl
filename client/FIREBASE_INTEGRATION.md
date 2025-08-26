# 🔥 Intégration Firebase - Guide Complet

## 📋 Vue d'ensemble

Ce guide vous explique comment utiliser Firebase dans votre application d'escorts avec :

- **Firebase Storage** : Upload et gestion des fichiers (photos, vidéos)
- **Firebase Firestore** : Messagerie en temps réel
- **Firebase Authentication** : Gestion des utilisateurs

## 🚀 Installation et Configuration

### 1. Variables d'Environnement

Créez un fichier `.env.local` dans le dossier `client/` :

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

### 2. Configuration Firebase

Votre fichier `src/helpers/firebase.js` est déjà configuré avec :

- Authentication
- Storage
- Firestore

## 📁 Structure des Fichiers

```
src/
├── helpers/
│   └── firebase.js              # Configuration Firebase
├── services/
│   ├── firebaseStorage.js       # Service de gestion des fichiers
│   └── firebaseMessaging.js     # Service de messagerie
└── components/
    ├── FirebaseFileUpload.jsx   # Composant d'upload
    ├── FirebaseMessaging.jsx    # Composant de messagerie
    └── EscortProfileWithFirebase.jsx # Exemple d'utilisation
```

## 🗄️ Firebase Storage

### Utilisation du Service

```javascript
import firebaseStorage from "../services/firebaseStorage";

// Upload simple
const result = await firebaseStorage.uploadFile(file, "avatars/user123.jpg");

// Upload avec progression
const result = await firebaseStorage.uploadFileWithProgress(
  file,
  "gallery/escort123/photo.jpg",
  (progress) => console.log(`Upload: ${progress}%`)
);

// Supprimer un fichier
await firebaseStorage.deleteFile("avatars/user123.jpg");

// Lister les fichiers
const files = await firebaseStorage.listFiles("gallery/escort123");
```

### Composant d'Upload

```jsx
import FirebaseFileUpload from "../components/FirebaseFileUpload";

<FirebaseFileUpload
  onUploadComplete={handleUploadComplete}
  folder="gallery"
  maxFiles={10}
  maxSize={5 * 1024 * 1024} // 5MB
  acceptedTypes={["image/*", "video/*"]}
  showPreview={true}
  multiple={true}
  userId="user123"
/>;
```

## 💬 Firebase Messaging

### Utilisation du Service

```javascript
import firebaseMessaging from "../services/firebaseMessaging";

// Créer une conversation
const conversation = await firebaseMessaging.createConversation([
  "user1",
  "user2",
]);

// Envoyer un message
await firebaseMessaging.sendMessage(conversationId, {
  senderId: "user1",
  content: "Bonjour !",
  type: "text",
});

// Obtenir les conversations
const conversations = await firebaseMessaging.getUserConversations("user1");

// Écouter en temps réel
const unsubscribe = firebaseMessaging.listenToConversation(
  conversationId,
  (messages) => console.log("Nouveaux messages:", messages)
);
```

### Composant de Messagerie

```jsx
import FirebaseMessaging from "../components/FirebaseMessaging";

<FirebaseMessaging
  currentUserId="user1"
  otherUserId="user2"
  otherUserName="Sophia"
  otherUserAvatar="https://example.com/avatar.jpg"
  onMessageSent={handleMessageSent}
  className="h-96"
/>;
```

## 🎯 Exemple Complet - Profil d'Escort

Le composant `EscortProfileWithFirebase.jsx` montre comment intégrer tout :

```jsx
import EscortProfileWithFirebase from "../components/EscortProfileWithFirebase";

<EscortProfileWithFirebase
  escortId="escort123"
  currentUserId="user456"
  escortData={{
    name: "Sophia",
    age: 25,
    location: "Paris, France",
    rating: 4.8,
    services: ["Massage", "Accompagnement"],
  }}
/>;
```

## 🔐 Règles de Sécurité

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }

    match /messages/{messageId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.uid == userId;
    }

    match /gallery/{escortId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.uid == escortId;
    }
  }
}
```

## 📊 Organisation des Fichiers

### Structure des Dossiers Storage

```
avatars/
├── user123/
│   ├── avatar1.jpg
│   └── avatar2.jpg

gallery/
├── escort123/
│   ├── photo1.jpg
│   ├── photo2.jpg
│   └── video1.mp4

videos/
├── escort123/
│   ├── preview1.mp4
│   └── preview2.mp4

messages/
├── message123/
│   ├── attachment1.jpg
│   └── attachment2.pdf

documents/
├── user123/
│   ├── id_card.pdf
│   └── verification.pdf
```

## 🎨 Personnalisation

### Thèmes et Styles

Tous les composants utilisent Tailwind CSS et peuvent être personnalisés :

```jsx
// Personnaliser l'apparence
<FirebaseFileUpload
  className="custom-upload-component"
  // ... autres props
/>

// CSS personnalisé
.custom-upload-component .dropzone {
  border-color: #your-color;
  background-color: #your-bg;
}
```

### Validation des Fichiers

```javascript
// Dans le composant d'upload
const validateFile = (file) => {
  const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Type de fichier non autorisé");
  }

  if (file.size > maxSize) {
    throw new Error("Fichier trop volumineux");
  }

  return true;
};
```

## 🚀 Déploiement

### 1. Build de Production

```bash
cd client
npm run build
```

### 2. Déploiement Firebase

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser le projet
firebase init

# Déployer
firebase deploy
```

## 📱 Responsive Design

Tous les composants sont responsifs et s'adaptent aux mobiles :

- **Desktop** : Affichage en colonnes multiples
- **Tablet** : Adaptation automatique
- **Mobile** : Interface optimisée tactile

## 🔍 Debug et Monitoring

### Console Firebase

- **Analytics** : Utilisation des composants
- **Performance** : Temps de chargement
- **Crashlytics** : Erreurs et bugs

### Logs Locaux

```javascript
// Activer les logs détaillés
console.log("Upload en cours:", file);
console.log("Progression:", progress);
console.log("Résultat:", result);
```

## 🆘 Dépannage

### Problèmes Courants

1. **Erreur de permissions**

   - Vérifier les règles Firestore/Storage
   - Vérifier l'authentification

2. **Fichiers non uploadés**

   - Vérifier la taille des fichiers
   - Vérifier les types acceptés

3. **Messages non reçus**
   - Vérifier la connexion Firestore
   - Vérifier les règles de sécurité

### Support

- [Documentation Firebase](https://firebase.google.com/docs)
- [Console Firebase](https://console.firebase.google.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

## 🎉 Conclusion

Firebase offre une solution complète et gratuite pour :

- ✅ **Stockage** : 5GB gratuit + CDN global
- ✅ **Messagerie** : Temps réel + pièces jointes
- ✅ **Authentification** : Sécurisé et simple
- ✅ **Scalabilité** : Évolue avec votre app

Votre application d'escorts est maintenant prête avec une infrastructure robuste et moderne !
