// Temporarily disabled to prevent API interference
// const CACHE_NAME = "callgirls-v1";
// const urlsToCache = [
//   "/",
//   "/static/js/bundle.js",
//   "/static/css/main.css",
//   "/manifest.json",
//   "/offline.html",
// ];

// // Install event - cache resources
// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       console.log("Opened cache");
//       return cache.addAll(urlsToCache);
//     })
//   );
// });

// // Helper to determine if request should be cached
// function isCacheableRequest(request) {
//   try {
//     const url = new URL(request.url);
//     // Ignore non-http(s) schemes (e.g., chrome-extension)
//     if (url.protocol !== "http:" && url.protocol !== "https:") {
//       return false;
//     }
//     // Do not cache API calls
//     if (url.pathname.startsWith("/api/")) {
//       return false;
//     }
//     // Only cache GET requests
//     if (request.method !== "GET") {
//       return false;
//     }
//     return true;
//   } catch (e) {
//     console.warn("Service Worker: Invalid URL", request.url, e);
//     return false;
//   }
// }

// // Fetch event - serve from cache when offline
// self.addEventListener("fetch", (event) => {
//   const { request } = event;

//   // Bypass caching for non-cacheable requests
//   if (!isCacheableRequest(request)) {
//     return;
//   }

//   event.respondWith(
//     caches
//       .match(request)
//       .then((response) => {
//         // Return cached version or fetch from network
//         return (
//           response ||
//           fetch(request).then((networkResponse) => {
//             // Only cache successful responses
//             if (networkResponse.ok) {
//               // Put a clone in cache for future use
//               const responseClone = networkResponse.clone();
//               caches
//                 .open(CACHE_NAME)
//                 .then((cache) => {
//                   try {
//                     return cache.put(request, responseClone);
//                   } catch (error) {
//                     console.warn("Service Worker: Failed to cache", request.url, error);
//                   }
//                 })
//                 .catch((error) => {
//                   console.warn("Service Worker: Cache error", error);
//                 });
//             }
//             return networkResponse;
//           })
//         );
//       })
//       .catch((error) => {
//         console.warn("Service Worker: Fetch error", error);
//         // Return offline page if both cache and network fail
//         if (request.destination === "document") {
//           return caches.match("/offline.html");
//         }
//       })
//   );
// });

// // Activate event - clean up old caches
// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheName !== CACHE_NAME) {
//             console.log("Deleting old cache:", cacheName);
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
// });

// // Background sync for offline actions
// self.addEventListener("sync", (event) => {
//   if (event.tag === "background-sync") {
//     event.waitUntil(doBackgroundSync());
//   }
// });

// // Push notifications
// self.addEventListener("push", (event) => {
//   const options = {
//     body: event.data ? event.data.text() : "New notification from CallGirls",
//     icon: "/icons/icon-192x192.png",
//     badge: "/icons/badge-72x72.png",
//     vibrate: [100, 50, 100],
//     data: {
//       dateOfArrival: Date.now(),
//       primaryKey: 1,
//     },
//     actions: [
//       {
//         action: "explore",
//         title: "View",
//         icon: "/icons/checkmark.png",
//       },
//       {
//         action: "close",
//         title: "Close",
//         icon: "/icons/xmark.png",
//       },
//     ],
//   };

//   event.waitUntil(self.registration.showNotification("CallGirls", options));
// });

// // Notification click
// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();

//   if (event.action === "explore") {
//     event.waitUntil(clients.openWindow("/"));
//   }
// });

// // Background sync function
// async function doBackgroundSync() {
//   try {
//     // Sync any pending data
//     const pendingData = await getPendingData();

//     for (const data of pendingData) {
//       await syncData(data);
//     }

//     console.log("Background sync completed");
//   } catch (error) {
//     console.error("Background sync failed:", error);
//   }
// }

// // Get pending data from IndexedDB
// async function getPendingData() {
//   // Implementation for getting pending data
//   return [];
// }

// // Sync data to server
// async function syncData(data) {
//   // Implementation for syncing data
//   return fetch("/api/sync", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
// }

// // Message handling
// self.addEventListener("message", (event) => {
//   if (event.data && event.data.type === "SKIP_WAITING") {
//     self.skipWaiting();
//   }
// });

// // Error handling
// self.addEventListener("error", (event) => {
//   console.error("Service Worker error:", event.error);
// });

// // Unhandled rejection
// self.addEventListener("unhandledrejection", (event) => {
//   console.error("Service Worker unhandled rejection:", event.reason);
// });

// Service Worker temporarily disabled to prevent API interference
console.log("Service Worker disabled for debugging");
