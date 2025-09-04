# Guide de Suppression des Médias

Ce guide explique comment supprimer tous les médias (photos, avatars et vidéos) de votre base de données.

## ⚠️ ATTENTION

**Cette action est IRREVERSIBLE !** Tous les médias seront définitivement supprimés de votre base de données.

## 📁 Scripts Disponibles

### 1. `quick-delete-media.js` (RECOMMANDÉ)

- **Le plus rapide et simple**
- Supprime tous les médias en une seule opération MongoDB
- Ne supprime que les références dans la base de données
- **Les fichiers physiques restent dans le stockage**

```bash
node quick-delete-media.js
```

### 2. `delete-media-database-only.js`

- **Avec analyse préalable**
- Affiche les statistiques des médias avant suppression
- Supprime seulement les références dans la base de données
- **Les fichiers physiques restent dans le stockage**

```bash
# Analyser les médias
node delete-media-database-only.js

# Supprimer les médias
node delete-media-database-only.js --delete
```

### 3. `delete-all-media.js`

- **Suppression complète (base + fichiers)**
- Supprime les références ET tente de supprimer les fichiers physiques
- Plus lent mais plus complet
- **ATTENTION: Peut échouer si les fichiers n'existent plus**

```bash
# Suppression normale
node delete-all-media.js

# Suppression forcée (sans confirmation)
node delete-all-media.js --force
```

## 🚀 Utilisation Recommandée

### Étape 1: Vérifier la configuration

Assurez-vous que votre fichier `.env` contient la variable de connexion à MongoDB :

```env
MONGODB_CONN=mongodb://localhost:27017/votre_base
# ou
MONGODB_URI=mongodb://localhost:27017/votre_base
# ou
DATABASE_URL=mongodb://localhost:27017/votre_base
```

### Étape 2: Exécuter le script rapide

```bash
node quick-delete-media.js
```

### Étape 3: Vérifier le résultat

Le script affichera un résumé de la suppression.

## 📊 Ce qui sera supprimé

- ✅ **Avatars** - Photos de profil des utilisateurs
- ✅ **Galerie** - Toutes les photos de galerie des escorts
- ✅ **Vidéos** - Toutes les vidéos des escorts
- ✅ **Documents de vérification** - Documents d'identité
- ✅ **Documents d'identité** - Fichiers d'ID

## 🔍 Vérification Post-Suppression

Après la suppression, vous pouvez vérifier que les médias ont bien été supprimés :

```javascript
// Dans MongoDB Compass ou via un script
db.users.find(
  {},
  {
    avatar: 1,
    gallery: 1,
    videos: 1,
    "verification.documents": 1,
    idDocument: 1,
  }
);
```

## ⚡ Performance

- **`quick-delete-media.js`**: ~1-5 secondes
- **`delete-media-database-only.js`**: ~5-10 secondes
- **`delete-all-media.js`**: ~10-30 secondes (selon le nombre de fichiers)

## 🛡️ Sécurité

- Les scripts ne suppriment que les références dans la base de données
- Les fichiers physiques restent dans le stockage (sauf avec `delete-all-media.js`)
- Aucune donnée utilisateur n'est supprimée (nom, email, etc.)
- Seulement les médias sont affectés

## 🔧 En cas de problème

### Erreur de connexion MongoDB

```bash
❌ Erreur de connexion à MongoDB
```

**Solution**: Vérifiez votre variable `MONGODB_CONN` dans le fichier `.env`

### Erreur de permissions

```bash
❌ Access denied
```

**Solution**: Vérifiez que votre utilisateur MongoDB a les droits d'écriture

### Erreur de modèle

```bash
❌ Cannot find module './api/models/user.model.js'
```

**Solution**: Exécutez le script depuis la racine du projet

## 📝 Exemple de Sortie

```
🚀 Suppression rapide de tous les médias...
✅ Connecté à MongoDB
📊 Total des utilisateurs: 150

🎉 SUPPRESSION TERMINÉE !
📊 Résumé:
   • Utilisateurs modifiés: 150
   • Utilisateurs correspondants: 150

✅ Tous les médias ont été supprimés de la base de données !
🔌 Connexion à MongoDB fermée
```

## 🎯 Cas d'Usage

- **Nettoyage de base de données** avant migration
- **Suppression de contenu sensible**
- **Reset complet** des médias utilisateurs
- **Préparation** pour un nouveau déploiement

## 📞 Support

En cas de problème, vérifiez :

1. La connexion MongoDB
2. Les variables d'environnement
3. Les permissions de base de données
4. L'exécution depuis le bon répertoire
