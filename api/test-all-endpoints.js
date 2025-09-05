#!/usr/bin/env node

import axios from "axios";
import express from "express";

// Import routers directly so we can enumerate their routes
import authRoutes from "./routes/Auth.route.js";
import userRoutes from "./routes/User.route.js";
import escortRoutes from "./routes/Escort.route.js";
import messageRoutes from "./routes/Message.route.js";
import statsRoutes from "./routes/Stats.route.js";
import upgradeRequestRoutes from "./routes/UpgradeRequest.route.js";
import reviewRoutes from "./routes/Review.route.js";
import favoriteRoutes from "./routes/Favorite.route.js";
import categoryRoutes from "./routes/Category.route.js";
import adminRoutes from "./routes/Admin.route.js";
import transportRoutes from "./routes/Transport.route.js";
import bookingRoutes from "./routes/Booking.route.js";
import blogRoutes from "./routes/Blog.route.js";

const argv = process.argv.slice(2);
const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const found = argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const BASE_URL = getArg(
  "base",
  process.env.BASE_URL || "http://localhost:5000"
);
const CONCURRENCY = Number(getArg("concurrency", process.env.CONCURRENCY || 8));

const objectId = "000000000000000000000000"; // 24 hex chars

function getSampleForParam(paramName) {
  const lower = paramName.toLowerCase();
  if (lower.includes("id")) return objectId;
  if (lower.includes("slug")) return "test-slug";
  if (lower.includes("country")) return "ug";
  if (lower.includes("page")) return "1";
  return "test";
}

function expandPathParams(pathPattern) {
  // Replace :param occurrences with reasonable samples
  return pathPattern.replace(/:([A-Za-z0-9_]+)/g, (_, name) =>
    getSampleForParam(name)
  );
}

function ensureQueryDefaults(method, fullPath) {
  // Add simple defaults for common list/search endpoints so they don't 500 on missing params
  if (method === "GET") {
    // Escort search expects 'query' param
    if (/\/api\/escort\/search$/.test(fullPath) && !fullPath.includes("?")) {
      return `${fullPath}?query=test`;
    }
    if (/\/search(\b|\/)/.test(fullPath) && !fullPath.includes("?")) {
      return `${fullPath}?query=test`; // generic search param
    }
    // Booking availability expects a date
    if (
      /\/booking\/escort\/.+\/availability$/.test(fullPath) &&
      !fullPath.includes("?")
    ) {
      const today = new Date().toISOString().slice(0, 10);
      return `${fullPath}?date=${today}`;
    }
    if (
      /\/stats(\b|\/)/.test(fullPath) &&
      !fullPath.includes("/global/") &&
      !fullPath.includes("?")
    ) {
      return fullPath; // typically no params needed except global/:countryCode handled by expandPathParams
    }
  }
  return fullPath;
}

function getRoutesFromRouter(prefix, router) {
  const routes = [];
  router.stack.forEach((layer) => {
    if (layer.route && layer.route.path) {
      const routePath = layer.route.path; // e.g. '/all', '/:id'
      const methods = Object.keys(layer.route.methods)
        .filter((m) => layer.route.methods[m])
        .map((m) => m.toUpperCase());
      methods.forEach((method) => {
        routes.push({ method, path: `${prefix}${routePath}` });
      });
    } else if (layer.name === "router" && layer.handle?.stack) {
      // Nested router (rare here), attempt to read nested routes
      layer.handle.stack.forEach((nested) => {
        if (nested.route && nested.route.path) {
          const methods = Object.keys(nested.route.methods)
            .filter((m) => nested.route.methods[m])
            .map((m) => m.toUpperCase());
          methods.forEach((method) => {
            routes.push({ method, path: `${prefix}${nested.route.path}` });
          });
        }
      });
    }
  });
  return routes;
}

function enumerateAllRoutes() {
  // We do not need to mount to an app to enumerate; read each router directly
  const entries = [
    { prefix: "/api/auth", router: authRoutes },
    { prefix: "/api/user", router: userRoutes },
    { prefix: "/api/escort", router: escortRoutes },
    { prefix: "/api/message", router: messageRoutes },
    { prefix: "/api/stats", router: statsRoutes },
    { prefix: "/api/upgrade-request", router: upgradeRequestRoutes },
    { prefix: "/api/review", router: reviewRoutes },
    { prefix: "/api/favorite", router: favoriteRoutes },
    { prefix: "/api/category", router: categoryRoutes },
    { prefix: "/api/admin", router: adminRoutes },
    { prefix: "/api/transport", router: transportRoutes },
    { prefix: "/api/booking", router: bookingRoutes },
    { prefix: "/api/blog", router: blogRoutes },
  ];

  const routes = entries.flatMap(({ prefix, router }) =>
    getRoutesFromRouter(prefix, router)
  );

  // Add index-exposed endpoints
  routes.push(
    { method: "GET", path: "/health" },
    { method: "GET", path: "/api/status" },
    { method: "GET", path: "/api/performance" },
    { method: "GET", path: "/api/performance/health" },
    { method: "GET", path: "/api/storage/health" },
    { method: "POST", path: "/api/storage/sync" },
    { method: "GET", path: "/ping" },
    { method: "GET", path: "/debug/files" }
  );

  // De-duplicate
  const key = (r) => `${r.method} ${r.path}`;
  const unique = Array.from(new Map(routes.map((r) => [key(r), r])).values());
  return unique.sort((a, b) => key(a).localeCompare(key(b)));
}

function buildTestUrl(baseUrl, method, path) {
  let expanded = expandPathParams(path);
  expanded = ensureQueryDefaults(method, expanded);
  if (!baseUrl.endsWith("/") && !expanded.startsWith("/")) {
    return `${baseUrl}/${expanded}`;
  }
  return `${baseUrl}${expanded}`;
}

async function testSingleEndpoint(baseUrl, endpoint) {
  const url = buildTestUrl(baseUrl, endpoint.method, endpoint.path);
  const method = endpoint.method.toLowerCase();
  const isWrite = method !== "get";

  const payload = isWrite ? {} : undefined;
  try {
    const response = await axios({
      url,
      method,
      data: payload,
      validateStatus: () => true,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    const status = response.status;
    const ok = status < 500; // treat 2xx-4xx as working (no server error)
    const note =
      status === 401 || status === 403
        ? "protected"
        : status === 404
        ? "not-found"
        : "";

    return {
      ...endpoint,
      url,
      status,
      ok,
      note,
    };
  } catch (error) {
    return {
      ...endpoint,
      url,
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let current = 0;
  const workers = new Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(async () => {
      while (current < items.length) {
        const idx = current++;
        results[idx] = await worker(items[idx], idx);
      }
    });
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log(`\n🚀 Endpoint smoke test against: ${BASE_URL}`);
  const endpoints = enumerateAllRoutes();
  console.log(`🔍 Discovered endpoints: ${endpoints.length}`);

  const results = await runWithConcurrency(
    endpoints,
    async (ep) => await testSingleEndpoint(BASE_URL, ep),
    CONCURRENCY
  );

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  console.log(`\n📊 SUMMARY`);
  console.log(`✅ Passed (no 5xx): ${passed}/${results.length}`);
  console.log(`❌ Failed (5xx or network): ${failed.length}`);

  const protectedCount = results.filter((r) => r.note === "protected").length;
  if (protectedCount)
    console.log(`🔐 Protected responses (401/403): ${protectedCount}`);
  const notFoundCount = results.filter((r) => r.note === "not-found").length;
  if (notFoundCount)
    console.log(`🔎 Not-found responses (404): ${notFoundCount}`);

  if (failed.length) {
    console.log(`\n❗ Failing endpoints:`);
    failed.forEach((f) => {
      console.log(
        `- ${f.method} ${f.path} → ${f.status || f.error} (${f.url})`
      );
    });
  }

  // Exit code reflects failures
  process.exit(failed.length ? 1 : 0);
}

// Start
main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
