import mongoose from "mongoose";
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

// Fonction principale pour supprimer rapidement tous les médias
async function quickDeleteAllMedia() {
  try {
    console.log("🚀 Suppression rapide de tous les médias...");

    // Se connecter à la base de données
    await connectDB();

    // Récupérer la collection des utilisateurs
    const db = mongoose.connection.db;
    const userCollection = db.collection("users");

    // Compter les utilisateurs
    const totalUsers = await userCollection.countDocuments();
    console.log(`📊 Total des utilisateurs: ${totalUsers}`);

    // Supprimer tous les médias en une seule opération
    const result = await userCollection.updateMany(
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
    console.log(`   • Utilisateurs modifiés: ${result.modifiedCount}`);
    console.log(`   • Utilisateurs correspondants: ${result.matchedCount}`);
    console.log(
      `\n✅ Tous les médias ont été supprimés de la base de données !`
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

// Démarrer le script
quickDeleteAllMedia();
