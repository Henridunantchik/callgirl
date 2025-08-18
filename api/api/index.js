export default function handler(req, res) {
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
    res.status(200).end();
    return;
  }

  // Health check
  if (req.url === "/health" || req.url === "/") {
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
  res.status(404).json({
    success: false,
    message: "Route not found",
    url: req.url,
  });
}
