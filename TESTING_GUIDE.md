# 🧪 Guide de Test - Système d'Upgrade

## 📋 Vue d'ensemble

Ce guide vous aide à tester le système d'upgrade des escorts de manière complète.

## 🚀 Préparation

### 1. Démarrer les serveurs

```bash
# Terminal 1 - Backend
cd api
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### 2. Vérifier la base de données

```bash
# Dans le dossier api
node scripts/testUpgradeSystem.js
```

## 🧪 Tests à effectuer

### Test 1: Système de Notifications d'Upgrade

**Objectif**: Vérifier que les notifications apparaissent pour les escorts Basic/Featured

**Étapes**:
1. Connectez-vous en tant qu'escort Basic ou Featured
2. Naviguez vers `/ug/escort/dashboard`
3. Attendez 5 minutes (ou modifiez le timer dans le code)
4. Vérifiez que la notification d'upgrade apparaît
5. Testez les boutons "Upgrade Maintenant" et "Plus tard"

**Résultat attendu**: 
- ✅ Notification apparaît après 5 minutes
- ✅ Bouton "Upgrade Maintenant" redirige vers `/ug/escort/upgrade`
- ✅ Bouton "Plus tard" ferme la notification

### Test 2: Page d'Upgrade Escort

**Objectif**: Vérifier que les escorts peuvent demander une upgrade

**Étapes**:
1. Connectez-vous en tant qu'escort
2. Allez sur `/ug/escort/upgrade`
3. Vérifiez l'affichage des 3 plans (Basic, Featured, Premium)
4. Cliquez sur "Devenir Featured" ou "Devenir Premium"
5. Remplissez le formulaire
6. Testez les deux méthodes de contact (WhatsApp et Messagerie)

**Résultat attendu**:
- ✅ Plans affichés correctement
- ✅ Modal d'upgrade s'ouvre
- ✅ Formulaire fonctionne
- ✅ WhatsApp redirige vers l'URL correcte
- ✅ Messagerie crée une demande en base

### Test 3: Dashboard Admin - Demandes d'Upgrade

**Objectif**: Vérifier que l'admin peut gérer les demandes d'upgrade

**Étapes**:
1. Connectez-vous en tant qu'admin
2. Allez sur `/ug/admin/upgrade-requests`
3. Vérifiez les statistiques en haut
4. Testez les filtres (recherche, statut, pays)
5. Cliquez sur "Voir" pour une demande en attente
6. Testez l'approbation et le rejet

**Résultat attendu**:
- ✅ Statistiques affichées correctement
- ✅ Filtres fonctionnent
- ✅ Modal de détails s'ouvre
- ✅ Approbation met à jour le statut de l'escort
- ✅ Rejet fonctionne

### Test 4: Messagerie Admin

**Objectif**: Vérifier que l'admin peut communiquer avec les escorts

**Étapes**:
1. Connectez-vous en tant qu'admin
2. Allez sur `/ug/admin/messages`
3. Vérifiez la liste des conversations
4. Sélectionnez une conversation
5. Envoyez un message
6. Testez la recherche de conversations

**Résultat attendu**:
- ✅ Conversations listées
- ✅ Messages envoyés et reçus
- ✅ Recherche fonctionne
- ✅ Indicateurs de frappe

### Test 5: Intégration Complète

**Objectif**: Tester le flux complet d'upgrade

**Étapes**:
1. Créez une demande d'upgrade en tant qu'escort
2. Connectez-vous en tant qu'admin
3. Approuvez la demande
4. Vérifiez que l'escort a bien été mis à jour
5. Testez les notifications qui ne doivent plus apparaître

**Résultat attendu**:
- ✅ Demande créée
- ✅ Demande approuvée
- ✅ Escort mis à jour (subscriptionTier, isVerified)
- ✅ Notifications arrêtées pour les escorts Premium

## 🔧 Tests Techniques

### Test des API

```bash
# Test des endpoints d'upgrade
curl -X GET http://localhost:8000/api/upgrade-request/all \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

curl -X GET http://localhost:8000/api/upgrade-request/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test de la Base de Données

```bash
# Vérifier les collections
mongo
use your_database_name
db.upgraderequests.find()
db.users.find({role: "escort"})
```

## 🐛 Dépannage

### Problèmes courants

1. **Notifications n'apparaissent pas**
   - Vérifiez que l'escort n'est pas Premium
   - Vérifiez les timers dans `useUpgradeNotifications.js`

2. **Demandes d'upgrade ne s'affichent pas**
   - Vérifiez que l'utilisateur est admin
   - Vérifiez les routes dans `App.jsx`

3. **Messagerie ne fonctionne pas**
   - Vérifiez la connexion Socket.IO
   - Vérifiez les tokens d'authentification

### Logs utiles

```javascript
// Dans la console du navigateur
console.log("User:", user);
console.log("Socket connected:", isConnected);

// Dans les logs du serveur
console.log("Upgrade request created:", request);
console.log("Admin action:", action);
```

## 📊 Métriques de Test

- **Temps de réponse**: < 2 secondes pour les pages
- **Notifications**: Apparaissent après 5 minutes
- **Messages**: Délivrés en temps réel
- **Upgrades**: Traitées en < 1 seconde

## ✅ Checklist de Validation

- [ ] Notifications d'upgrade fonctionnent
- [ ] Page d'upgrade escort complète
- [ ] Dashboard admin fonctionnel
- [ ] Messagerie admin opérationnelle
- [ ] API endpoints répondent
- [ ] Base de données mise à jour
- [ ] Flux complet testé
- [ ] Erreurs gérées
- [ ] Performance acceptable

## 🎯 Prochaines étapes

1. **Tests de charge**: Simuler plusieurs demandes simultanées
2. **Tests de sécurité**: Vérifier les permissions
3. **Tests de paiement**: Intégrer un vrai système de paiement
4. **Tests mobiles**: Vérifier la responsivité
5. **Tests d'accessibilité**: Vérifier l'accessibilité WCAG

---

**Note**: Ce guide doit être mis à jour à chaque modification du système d'upgrade.
