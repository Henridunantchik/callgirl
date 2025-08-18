export default function handler(req, res) {
  console.log("🚀 Function called:", req.method, req.url);

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("📋 Preflight request handled");
    res.status(200).end();
    return;
  }

  // Health check
  if (req.url === "/health" || req.url === "/") {
    console.log("🏥 Health check requested");
    res.status(200).json({
      success: true,
      message: "API is running",
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method,
    });
    return;
  }

  // API routes
  if (req.url.startsWith("/api/")) {
    console.log("🔌 API route requested:", req.url);
    // For now, return a simple response
    res.status(200).json({
      success: true,
      message: "API endpoint reached",
      url: req.url,
      method: req.method,
      data: {
        escorts: [],
        stats: {
          totalEscorts: 0,
          featuredEscorts: 0,
          premiumEscorts: 0,
        },
      },
    });
    return;
  }

  // 404 for everything else
  console.log("❌ 404 - Route not found:", req.url);
  res.status(404).json({
    success: false,
    message: "Route not found",
    url: req.url,
  });
}
