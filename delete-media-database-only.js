import mongoose from "mongoose";
import User from "./api/models/user.model.js";
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

// Fonction principale pour supprimer tous les médias de la base de données
async function deleteAllMediaFromDatabase() {
  try {
    console.log(
      "🚀 Début de la suppression de tous les médias de la base de données..."
    );

    // Se connecter à la base de données
    await connectDB();

    // Récupérer tous les utilisateurs
    const users = await User.find({}).lean();
    console.log(`📊 ${users.length} utilisateur(s) trouvé(s)`);

    let totalUsersWithMedia = 0;
    let totalMediaItems = 0;

    // Compter les médias existants
    for (const user of users) {
      let userMediaCount = 0;
      if (user.avatar) userMediaCount++;
      if (user.gallery && user.gallery.length > 0)
        userMediaCount += user.gallery.length;
      if (user.videos && user.videos.length > 0)
        userMediaCount += user.videos.length;
      if (
        user.verification &&
        user.verification.documents &&
        user.verification.documents.length > 0
      ) {
        userMediaCount += user.verification.documents.length;
      }
      if (user.idDocument) userMediaCount++;

      if (userMediaCount > 0) {
        totalUsersWithMedia++;
        totalMediaItems += userMediaCount;
      }
    }

    console.log(`📸 Médias trouvés:`);
    console.log(`   • Utilisateurs avec médias: ${totalUsersWithMedia}`);
    console.log(`   • Total des médias: ${totalMediaItems}`);

    if (totalMediaItems === 0) {
      console.log("✅ Aucun média trouvé dans la base de données");
      return;
    }

    // Supprimer tous les médias de tous les utilisateurs
    const updateResult = await User.updateMany(
      {}, // Tous les utilisateurs
      {
        $set: {
          avatar: null,
          gallery: [],
          videos: [],
          "verification.documents": [],
          idDocument: null,
        },
      }
    );

    console.log(`\n🎉 SUPPRESSION TERMINÉE !`);
    console.log(`📊 Résumé:`);
    console.log(`   • Utilisateurs modifiés: ${updateResult.modifiedCount}`);
    console.log(
      `   • Médias supprimés de la base de données: ${totalMediaItems}`
    );
    console.log(
      `\n✅ Tous les médias ont été supprimés de la base de données !`
    );
    console.log(
      `⚠️  Note: Les fichiers physiques n'ont pas été supprimés du stockage`
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

// Fonction pour afficher les informations avant suppression
async function showMediaInfo() {
  try {
    console.log("🔍 Analyse des médias dans la base de données...");

    // Se connecter à la base de données
    await connectDB();

    // Récupérer tous les utilisateurs
    const users = await User.find({}).lean();

    let totalUsers = users.length;
    let usersWithAvatar = 0;
    let usersWithGallery = 0;
    let usersWithVideos = 0;
    let usersWithDocuments = 0;
    let totalGalleryImages = 0;
    let totalVideos = 0;
    let totalDocuments = 0;

    for (const user of users) {
      if (user.avatar) usersWithAvatar++;
      if (user.gallery && user.gallery.length > 0) {
        usersWithGallery++;
        totalGalleryImages += user.gallery.length;
      }
      if (user.videos && user.videos.length > 0) {
        usersWithVideos++;
        totalVideos += user.videos.length;
      }
      if (
        user.verification &&
        user.verification.documents &&
        user.verification.documents.length > 0
      ) {
        usersWithDocuments++;
        totalDocuments += user.verification.documents.length;
      }
    }

    console.log("\n📊 STATISTIQUES DES MÉDIAS:");
    console.log(`   • Total des utilisateurs: ${totalUsers}`);
    console.log(`   • Utilisateurs avec avatar: ${usersWithAvatar}`);
    console.log(
      `   • Utilisateurs avec galerie: ${usersWithGallery} (${totalGalleryImages} photos)`
    );
    console.log(
      `   • Utilisateurs avec vidéos: ${usersWithVideos} (${totalVideos} vidéos)`
    );
    console.log(
      `   • Utilisateurs avec documents: ${usersWithDocuments} (${totalDocuments} documents)`
    );
    console.log(
      `   • Total des médias: ${
        usersWithAvatar + totalGalleryImages + totalVideos + totalDocuments
      }`
    );

    if (process.argv.includes("--delete")) {
      console.log("\n🗑️  Suppression des médias...");
      await deleteAllMediaFromDatabase();
    } else {
      console.log("\n💡 Pour supprimer tous les médias, exécutez:");
      console.log("   node delete-media-database-only.js --delete");
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Démarrer le script
if (process.argv.includes("--delete")) {
  deleteAllMediaFromDatabase();
} else {
  showMediaInfo();
}
