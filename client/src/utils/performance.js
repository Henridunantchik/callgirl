// Performance optimization utilities

// Debounce function to prevent excessive API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit API call frequency
export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Preload critical resources
export const preloadResources = () => {
  // Preload critical API endpoints
  const criticalEndpoints = [
    "/api/escort/all",
    "/api/category/all-category",
    "/api/stats/dashboard",
  ];

  criticalEndpoints.forEach((endpoint) => {
    // Create a link element for preloading
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = `${window.location.origin}${endpoint}`;
    document.head.appendChild(link);
  });
};

// Optimize images
export const optimizeImage = (src, width = 400, quality = 80) => {
  // If using a CDN or image optimization service, add parameters here
  return `${src}?w=${width}&q=${quality}&f=auto`;
};

// Cache management
export const cacheManager = {
  set: (key, data, ttl = 300000) => {
    // 5 minutes default
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get: (key) => {
    try {
      const item = JSON.parse(localStorage.getItem(key));
      if (!item) return null;

      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return item.data;
    } catch (e) {
      return null;
    }
  },

  clear: () => {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("cache_") || key.includes(":")) {
        localStorage.removeItem(key);
      }
    });
  },
};

// Performance monitoring
export const performanceMonitor = {
  start: (name) => {
    performance.mark(`${name}-start`);
  },

  end: (name) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const measure = performance.getEntriesByName(name)[0];
    console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);

    return measure.duration;
  },
};
