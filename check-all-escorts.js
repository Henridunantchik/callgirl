#!/usr/bin/env node

import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://tusiwawasahau:tusiwawasahau.cd@cluster0.kkkt6.mongodb.net/tusiwawasahau?retryWrites=true&w=majority&appName=Cluster0";

// Modèle Escort simplifié
const EscortSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,
  gallery: Array,
  videos: Array,
  role: String,
  _id: String
});

const Escort = mongoose.model('Escort', EscortSchema);

async function checkAllEscorts() {
  try {
    console.log("🔧 Connexion à MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    console.log("✅ Connecté à MongoDB\n");

    // Compter tous les escorts
    console.log("🔍 Comptage des escorts...");
    const totalEscorts = await Escort.countDocuments();
    console.log(`📊 Total escorts dans la base: ${totalEscorts}\n`);

    if (totalEscorts === 0) {
      console.log("❌ AUCUN ESCORT TROUVÉ DANS LA BASE DE DONNÉES !");
      console.log("🚨 La base de données est COMPLÈTEMENT VIDE !");
      return;
    }

    // Lister tous les escorts
    console.log("📋 Liste de tous les escorts:");
    console.log("================================");
    
    const allEscorts = await Escort.find({}).select('name email avatar role _id');
    
    allEscorts.forEach((escort, index) => {
      console.log(`${index + 1}. ${escort.name || 'Sans nom'} (${escort.email || 'Sans email'})`);
      console.log(`   ID: ${escort._id}`);
      console.log(`   Role: ${escort.role || 'Non défini'}`);
      console.log(`   Avatar: ${escort.avatar ? '✅ Présent' : '❌ Absent'}`);
      console.log("");
    });

    // Chercher spécifiquement Lola Lala
    console.log("🔍 Recherche spécifique de Lola Lala...");
    console.log("=====================================");
    
    // Recherche par nom partiel
    const lolaByName = await Escort.find({ name: { $regex: /lola/i } });
    console.log(`🔍 Recherche par nom 'lola': ${lolaByName.length} résultats`);
    
    // Recherche par email partiel
    const lolaByEmail = await Escort.find({ email: { $regex: /hdchikuru7/i } });
    console.log(`🔍 Recherche par email 'hdchikuru7': ${lolaByEmail.length} résultats`);
    
    // Recherche par ID spécifique (si on l'a)
    const lolaById = await Escort.findById("67bca60f2a1df3d303d09bff");
    if (lolaById) {
      console.log("✅ Lola trouvée par ID spécifique!");
      console.log(`📊 Données:`, JSON.stringify(lolaById, null, 2));
    } else {
      console.log("❌ Lola non trouvée par ID spécifique");
    }

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Déconnecté de MongoDB");
  }
}

checkAllEscorts();
