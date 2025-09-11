// Composants Firebase pour remplacer Cloudinary et Render
export { default as FirebaseImageDisplay } from "../FirebaseImageDisplay";
export { default as FirebaseGallery } from "../FirebaseGallery";
export { default as FirebasePremiumAvatar } from "../FirebasePremiumAvatar";
export { default as FirebaseEscortCard } from "../FirebaseEscortCard";
export { default as FirebaseNavbarAvatar } from "../FirebaseNavbarAvatar";
export { default as FirebaseFeaturedEscorts } from "../FirebaseFeaturedEscorts";
export { default as FirebaseEscortList } from "../FirebaseEscortList";
export { default as FirebaseMessaging } from "../FirebaseMessaging";

// Services Firebase (messaging/auth only)
export { default as firebaseMessaging } from "../../services/firebaseMessaging";

// Configuration Firebase (auth only needed for Google login)
export { auth } from "../../helpers/firebase";
