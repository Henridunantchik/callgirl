#!/usr/bin/env node

import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://tusiwawasahau:tusiwawasahau.cd@cluster0.kkkt6.mongodb.net/tusiwawasahau?retryWrites=true&w=majority&appName=Cluster0";

// Modèle Escort simplifié
const EscortSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,
  gallery: [{
    url: String,
    publicId: String,
    caption: String,
    isPrivate: Boolean,
    order: Number
  }],
  videos: [{
    url: String,
    publicId: String,
    caption: String,
    isPrivate: Boolean,
    order: Number
  }]
});

const Escort = mongoose.model('Escort', EscortSchema);

async function fixLolaProfile() {
  try {
    console.log("🔧 Connexion à MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    console.log("✅ Connecté à MongoDB\n");

    // Chercher Lola Lala
    console.log("🔍 Recherche de Lola Lala...");
    const lola = await Escort.findOne({ name: "Lola Lala" });
    
    if (!lola) {
      console.log("❌ Lola Lala non trouvée dans la base de données");
      console.log("🔍 Recherche par email...");
      
      const lolaByEmail = await Escort.findOne({ email: "hdchikuru7@gmail.com" });
      if (lolaByEmail) {
        console.log(`✅ Trouvée par email: ${lolaByEmail.name}`);
        console.log(`📊 Données actuelles:`, JSON.stringify(lolaByEmail, null, 2));
      } else {
        console.log("❌ Aucun escort trouvé avec cet email");
        return;
      }
    } else {
      console.log("✅ Lola Lala trouvée");
      console.log(`📊 Données actuelles:`, JSON.stringify(lola, null, 2));
    }

    // Vérifier les URLs des photos
    console.log("\n🔍 Vérification des URLs des photos...");
    
    const avatarUrl = "https://callgirls-api.onrender.com/uploads/avatars/1756139363733-appg9nupzmb.jpg";
    const galleryUrls = [
      "https://callgirls-api.onrender.com/uploads/gallery/1756143767693-ry1drwpv28.HEIC"
    ];

    console.log(`🖼️ Avatar URL: ${avatarUrl}`);
    console.log(`📸 Gallery URLs: ${galleryUrls.join(', ')}`);

    // Mettre à jour le profil avec les bonnes URLs
    console.log("\n🔧 Mise à jour du profil...");
    
    const updateResult = await Escort.updateOne(
      { email: "hdchikuru7@gmail.com" },
      {
        $set: {
          name: "Lola Lala",
          avatar: avatarUrl,
          gallery: galleryUrls.map((url, index) => ({
            url: url,
            publicId: url.split('/').pop(),
            caption: "",
            isPrivate: false,
            order: index
          }))
        }
      }
    );

    if (updateResult.modifiedCount > 0) {
      console.log("✅ Profil mis à jour avec succès");
    } else {
      console.log("⚠️ Aucune modification effectuée");
    }

    // Vérifier le résultat
    console.log("\n🔍 Vérification du profil mis à jour...");
    const updatedLola = await Escort.findOne({ email: "hdchikuru7@gmail.com" });
    console.log(`📊 Profil mis à jour:`, JSON.stringify(updatedLola, null, 2));

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Déconnecté de MongoDB");
  }
}

fixLolaProfile();
