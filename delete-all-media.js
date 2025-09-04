import mongoose from "mongoose";
import User from "./api/models/user.model.js";
import renderStorage from "./api/services/renderStorage.js";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données
const MONGODB_URI = process.env.MONGODB_CONN || process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error(
    "❌ MONGODB_CONN, MONGODB_URI ou DATABASE_URL non définie dans les variables d'environnement"
  );
  process.exit(1);
}

// Fonction pour se connecter à MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connecté à MongoDB");
  } catch (error) {
    console.error("❌ Erreur de connexion à MongoDB:", error);
    process.exit(1);
  }
}

// Fonction pour supprimer un fichier du stockage Render
async function deleteFileFromStorage(filePath) {
  if (!filePath) return;

  try {
    await renderStorage.deleteFile(filePath);
    console.log(`🗑️  Fichier supprimé du stockage: ${filePath}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la suppression du fichier ${filePath}:`,
      error.message
    );
    return false;
  }
}

// Fonction pour supprimer tous les médias d'un utilisateur
async function deleteUserMedia(user) {
  let deletedCount = 0;
  let errors = [];

  console.log(`\n👤 Traitement de l'utilisateur: ${user.name} (${user._id})`);

  // Supprimer l'avatar
  if (user.avatar) {
    console.log(`  📸 Avatar trouvé: ${user.avatar}`);

    // Essayer de supprimer du stockage si c'est un fichier local
    if (user.avatar.includes("/uploads/")) {
      const filePath = user.avatar.split("/uploads/")[1];
      if (filePath) {
        await deleteFileFromStorage(filePath);
      }
    }

    // Supprimer l'URL de l'avatar
    user.avatar = null;
    deletedCount++;
    console.log(`  ✅ Avatar supprimé`);
  }

  // Supprimer les photos de galerie
  if (user.gallery && user.gallery.length > 0) {
    console.log(`  🖼️  Galerie: ${user.gallery.length} photo(s) trouvée(s)`);

    for (const image of user.gallery) {
      try {
        // Supprimer du stockage si filePath existe
        if (image.filePath) {
          await deleteFileFromStorage(image.filePath);
        }

        // Supprimer du stockage si c'est un fichier local
        if (image.url && image.url.includes("/uploads/")) {
          const filePath = image.url.split("/uploads/")[1];
          if (filePath) {
            await deleteFileFromStorage(filePath);
          }
        }

        deletedCount++;
      } catch (error) {
        errors.push(
          `Erreur lors de la suppression de l'image ${image._id}: ${error.message}`
        );
      }
    }

    // Vider la galerie
    user.gallery = [];
    console.log(`  ✅ Galerie vidée`);
  }

  // Supprimer les vidéos
  if (user.videos && user.videos.length > 0) {
    console.log(`  🎥 Vidéos: ${user.videos.length} vidéo(s) trouvée(s)`);

    for (const video of user.videos) {
      try {
        // Supprimer du stockage si filePath existe
        if (video.filePath) {
          await deleteFileFromStorage(video.filePath);
        }

        // Supprimer du stockage si c'est un fichier local
        if (video.url && video.url.includes("/uploads/")) {
          const filePath = video.url.split("/uploads/")[1];
          if (filePath) {
            await deleteFileFromStorage(filePath);
          }
        }

        deletedCount++;
      } catch (error) {
        errors.push(
          `Erreur lors de la suppression de la vidéo ${video._id}: ${error.message}`
        );
      }
    }

    // Vider les vidéos
    user.videos = [];
    console.log(`  ✅ Vidéos supprimées`);
  }

  // Supprimer les documents de vérification
  if (
    user.verification &&
    user.verification.documents &&
    user.verification.documents.length > 0
  ) {
    console.log(
      `  📄 Documents de vérification: ${user.verification.documents.length} document(s) trouvé(s)`
    );

    for (const doc of user.verification.documents) {
      try {
        if (doc.filePath) {
          await deleteFileFromStorage(doc.filePath);
        }

        if (doc.url && doc.url.includes("/uploads/")) {
          const filePath = doc.url.split("/uploads/")[1];
          if (filePath) {
            await deleteFileFromStorage(filePath);
          }
        }

        deletedCount++;
      } catch (error) {
        errors.push(
          `Erreur lors de la suppression du document ${doc._id}: ${error.message}`
        );
      }
    }

    // Vider les documents
    user.verification.documents = [];
    console.log(`  ✅ Documents de vérification supprimés`);
  }

  // Supprimer le document d'identité
  if (user.idDocument) {
    console.log(`  🆔 Document d'identité trouvé: ${user.idDocument}`);

    if (user.idDocument.includes("/uploads/")) {
      const filePath = user.idDocument.split("/uploads/")[1];
      if (filePath) {
        await deleteFileFromStorage(filePath);
      }
    }

    user.idDocument = null;
    deletedCount++;
    console.log(`  ✅ Document d'identité supprimé`);
  }

  return { deletedCount, errors };
}

// Fonction principale
async function deleteAllMedia() {
  try {
    console.log("🚀 Début de la suppression de tous les médias...");

    // Se connecter à la base de données
    await connectDB();

    // Récupérer tous les utilisateurs
    const users = await User.find({}).lean();
    console.log(`📊 ${users.length} utilisateur(s) trouvé(s)`);

    let totalDeleted = 0;
    let totalErrors = [];
    let processedUsers = 0;

    // Traiter chaque utilisateur
    for (const user of users) {
      try {
        const result = await deleteUserMedia(user);
        totalDeleted += result.deletedCount;
        totalErrors.push(...result.errors);
        processedUsers++;

        // Sauvegarder les modifications de l'utilisateur
        await User.findByIdAndUpdate(user._id, {
          $set: {
            avatar: null,
            gallery: [],
            videos: [],
            "verification.documents": [],
            idDocument: null,
          },
        });

        console.log(`  💾 Utilisateur mis à jour dans la base de données`);
      } catch (error) {
        console.error(
          `❌ Erreur lors du traitement de l'utilisateur ${user._id}:`,
          error.message
        );
        totalErrors.push(`Erreur utilisateur ${user._id}: ${error.message}`);
      }

      // Afficher la progression
      console.log(
        `📈 Progression: ${processedUsers}/${users.length} utilisateurs traités`
      );
    }

    // Résumé final
    console.log("\n🎉 SUPPRESSION TERMINÉE !");
    console.log(`📊 Résumé:`);
    console.log(`   • Utilisateurs traités: ${processedUsers}/${users.length}`);
    console.log(`   • Médias supprimés: ${totalDeleted}`);
    console.log(`   • Erreurs rencontrées: ${totalErrors.length}`);

    if (totalErrors.length > 0) {
      console.log("\n⚠️  Erreurs rencontrées:");
      totalErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log(
      "\n✅ Tous les médias ont été supprimés de la base de données !"
    );
  } catch (error) {
    console.error("❌ Erreur fatale:", error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log("🔌 Connexion à MongoDB fermée");
    process.exit(0);
  }
}

// Fonction pour confirmer l'action
async function confirmDeletion() {
  console.log(
    "⚠️  ATTENTION: Cette action va supprimer TOUS les médias de TOUS les utilisateurs !"
  );
  console.log("📸 Cela inclut:");
  console.log("   • Tous les avatars");
  console.log("   • Toutes les photos de galerie");
  console.log("   • Toutes les vidéos");
  console.log("   • Tous les documents de vérification");
  console.log("   • Tous les documents d'identité");
  console.log("\n🗑️  Cette action est IRREVERSIBLE !");

  // En mode automatique, on continue directement
  console.log("\n🚀 Démarrage automatique de la suppression...");
  await deleteAllMedia();
}

// Démarrer le script
if (process.argv.includes("--force")) {
  console.log("🔓 Mode force activé - suppression sans confirmation");
  deleteAllMedia();
} else {
  confirmDeletion();
}
