# 🔥 Configuration Firebase - Règles de Sécurité

## 📋 Prérequis

1. Avoir un projet Firebase créé
2. Activer Authentication, Storage et Firestore
3. Configurer les variables d'environnement

## 🔐 Règles Firestore (Database)

### Collection `conversations`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;

      allow create: if request.auth != null &&
        request.auth.uid in request.resource.data.participants;
    }

    // Règles pour les messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants;

      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.senderId;
    }
  }
}
```

## 🗄️ Règles Storage

### Dossier `avatars/`

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Règles pour les avatars
    match /avatars/{userId}/{fileName} {
      allow read: if true; // Tout le monde peut voir les avatars
      allow write: if request.auth != null &&
        request.auth.uid == userId;
    }

    // Règles pour les galeries d'escorts
    match /gallery/{escortId}/{fileName} {
      allow read: if true; // Tout le monde peut voir les galeries
      allow write: if request.auth != null &&
        request.auth.uid == escortId;
    }

    // Règles pour les vidéos
    match /videos/{escortId}/{fileName} {
      allow read: if true; // Tout le monde peut voir les vidéos
      allow write: if request.auth != null &&
        request.auth.uid == escortId;
    }

    // Règles pour les messages avec pièces jointes
    match /messages/{messageId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Règles pour les documents
    match /documents/{userId}/{fileName} {
      allow read: if request.auth != null &&
        request.auth.uid == userId;
      allow write: if request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

## 🌐 Variables d'Environnement

### Fichier `.env.local`

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

## ⚙️ Configuration Console Firebase

### 1. Authentication

- Activer l'authentification par email/mot de passe
- Activer l'authentification Google (optionnel)
- Configurer les domaines autorisés

### 2. Storage

- Créer les dossiers : `avatars/`, `gallery/`, `videos/`, `messages/`, `documents/`
- Configurer les règles de sécurité ci-dessus
- Activer le CDN global

### 3. Firestore

- Créer les collections : `conversations`, `messages`
- Configurer les règles de sécurité ci-dessus
- Activer l'indexation automatique

### 4. Hosting (optionnel)

- Configurer le domaine personnalisé
- Activer HTTPS automatique

## 🚀 Déploiement

### 1. Installer Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Se connecter

```bash
firebase login
```

### 3. Initialiser le projet

```bash
firebase init
```

### 4. Déployer les règles

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 📊 Monitoring et Coûts

### Limites Gratuites

- **Storage** : 5GB
- **Transfert** : 1GB/mois
- **Firestore** : 1GB + 50,000 lectures + 20,000 écritures/mois

### Surveillance

- Activer les alertes de quota
- Monitorer l'utilisation dans la console Firebase
- Configurer les notifications par email

## 🔒 Sécurité Supplémentaire

### 1. Validation des Types de Fichiers

```javascript
// Dans le composant d'upload
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
const maxFileSize = 10 * 1024 * 1024; // 10MB

if (!allowedTypes.includes(file.type) || file.size > maxFileSize) {
  throw new Error("Type de fichier non autorisé ou taille trop importante");
}
```

### 2. Scan Antivirus (optionnel)

- Intégrer un service de scan de fichiers
- Bloquer les fichiers suspects
- Logs de sécurité

### 3. Rate Limiting

```javascript
// Limiter le nombre d'uploads par utilisateur
const userUploads = await getUserUploadCount(userId);
if (userUploads > 100) {
  throw new Error("Limite d'upload atteinte");
}
```

## 🆘 Support et Dépannage

### Problèmes Courants

1. **Erreur de permissions** : Vérifier les règles Firestore/Storage
2. **Quota dépassé** : Vérifier l'utilisation dans la console
3. **Fichiers non accessibles** : Vérifier les règles de sécurité
4. **Authentification échoue** : Vérifier la configuration Auth

### Ressources

- [Documentation Firebase](https://firebase.google.com/docs)
- [Console Firebase](https://console.firebase.google.com)
- [Support Firebase](https://firebase.google.com/support)
