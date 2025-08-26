# 🚀 GUIDE DE MIGRATION RENDER → FIREBASE STORAGE

## 🎯 **OBJECTIF**
Migrer complètement du système de stockage Render vers Firebase Storage pour une gestion fiable des médias.

## 📋 **ÉTAPES DE MIGRATION**

### **1. Configuration Firebase (DÉJÀ FAIT ✅)**

- ✅ `api/config/firebase.js` - Configuration Firebase
- ✅ `api/services/firebaseStorage.js` - Service de stockage Firebase
- ✅ Contrôleurs mis à jour pour utiliser Firebase

### **2. Variables d'Environnement**

Créez un fichier `.env` dans le dossier `api/` avec :

```bash
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=tusiwawasahau.firebaseapp.com
FIREBASE_PROJECT_ID=tusiwawasahau
FIREBASE_STORAGE_BUCKET=tusiwawasahau.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=404272240278
FIREBASE_APP_ID=1:404272240278:web:6fe4c3058ee8b63a9dd4b7

# MongoDB
MONGODB_URI=mongodb://localhost:27017/callgirls

# JWT
JWT_SECRET=your-jwt-secret-here

# Server
PORT=5000
NODE_ENV=development
```

### **3. Nettoyage Complet**

Exécutez le script de nettoyage :

```bash
node cleanup-render-migration-firebase.js
```

Ce script va :
- 🗑️ Supprimer tous les dossiers Render
- 🗑️ Nettoyer la base de données des anciennes URLs
- 🗑️ Supprimer les anciens fichiers de configuration
- ✅ Vérifier la configuration Firebase

### **4. Test de la Migration**

#### **Test d'Upload**
```bash
# Tester l'upload d'une image
curl -X POST http://localhost:5000/api/escort/upload-media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "media=@test-image.jpg" \
  -F "mediaType=photo"
```

#### **Test de Suppression**
```bash
# Tester la suppression d'un fichier
curl -X DELETE http://localhost:5000/api/media/delete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"filePath": "gallery/filename.jpg"}'
```

## 🔥 **AVANTAGES FIREBASE STORAGE**

### **✅ Fiabilité**
- Stockage permanent et fiable
- Pas de perte de données
- Sauvegarde automatique

### **✅ Performance**
- CDN global pour diffusion rapide
- Scalabilité illimitée
- Cache intelligent

### **✅ Coût**
- Tarification prévisible
- Pas de coûts cachés
- Gratuit pour petits projets

### **✅ Intégration**
- Déjà configuré côté client
- API simple et puissante
- Règles de sécurité configurables

## 🚨 **POINTS D'ATTENTION**

### **1. Règles de Sécurité Firebase**
Configurez les règles de sécurité dans Firebase Console :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Lecture publique
      allow write: if request.auth != null;  // Écriture authentifiée
    }
  }
}
```

### **2. Limites de Taille**
- **Images** : 10MB max
- **Vidéos** : 100MB max
- **Avatars** : 5MB max

### **3. Types de Fichiers Supportés**
- **Images** : JPG, PNG, GIF, WebP
- **Vidéos** : MP4, AVI, MOV, WMV
- **Documents** : PDF, DOC, DOCX

## 📊 **STRUCTURE DES DOSSIERS FIREBASE**

```
firebase-storage/
├── avatars/          # Photos de profil
├── gallery/          # Photos des escortes
├── videos/           # Vidéos des escortes
├── documents/        # Documents PDF, etc.
└── temp/             # Fichiers temporaires
```

## 🔧 **DÉPANNAGE**

### **Erreur : "Firebase not initialized"**
- Vérifiez que `FIREBASE_API_KEY` est configuré
- Redémarrez le serveur après modification du .env

### **Erreur : "Permission denied"**
- Vérifiez les règles de sécurité Firebase
- Assurez-vous que l'utilisateur est authentifié

### **Erreur : "File too large"**
- Vérifiez les limites de taille dans le code
- Compressez les fichiers si nécessaire

## 🎉 **MIGRATION TERMINÉE !**

Une fois le script de nettoyage exécuté :

1. ✅ **Firebase Storage** est opérationnel
2. ✅ **Tous les médias Render** sont supprimés
3. ✅ **Base de données** est nettoyée
4. ✅ **Nouveaux uploads** vont vers Firebase
5. ✅ **Performance** améliorée avec CDN global

## 📞 **SUPPORT**

En cas de problème :
1. Vérifiez les logs du serveur
2. Testez avec le script de nettoyage
3. Vérifiez la configuration Firebase
4. Consultez la documentation Firebase

---

**🔥 Votre système utilise maintenant Firebase Storage ! Plus de perte de médias !**
