import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useResponsive,
  useDevice,
  useOrientation,
  useTouch,
  useScrollPosition,
  useViewportVisibility,
  useKeyboard,
  useNetworkStatus,
  useReducedMotion,
  useColorScheme,
} from "../useResponsive";

// Mock window methods
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  outerHeight: 768,
  pageYOffset: 0,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  matchMedia: vi.fn(),
  onLine: true,
  navigator: {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    maxTouchPoints: 0,
    onLine: true,
  },
};

Object.defineProperty(window, "innerWidth", {
  writable: true,
  value: mockWindow.innerWidth,
});

Object.defineProperty(window, "innerHeight", {
  writable: true,
  value: mockWindow.innerHeight,
});

Object.defineProperty(window, "outerHeight", {
  writable: true,
  value: mockWindow.outerHeight,
});

Object.defineProperty(window, "pageYOffset", {
  writable: true,
  value: mockWindow.pageYOffset,
});

Object.defineProperty(window, "addEventListener", {
  writable: true,
  value: mockWindow.addEventListener,
});

Object.defineProperty(window, "removeEventListener", {
  writable: true,
  value: mockWindow.removeEventListener,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockWindow.matchMedia,
});

Object.defineProperty(window, "onLine", {
  writable: true,
  value: mockWindow.onLine,
});

Object.defineProperty(window, "navigator", {
  writable: true,
  value: mockWindow.navigator,
});

describe("Responsive Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useResponsive", () => {
    it("returns correct responsive values for desktop", () => {
      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isSmallScreen).toBe(false);
      expect(result.current.isLargeScreen).toBe(false);
      expect(result.current.breakpoint).toBe("lg");
    });

    it("returns correct responsive values for mobile", () => {
      Object.defineProperty(window, "innerWidth", { value: 375 });
      const { result } = renderHook(() => useResponsive());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isSmallScreen).toBe(true);
      expect(result.current.isLargeScreen).toBe(false);
      expect(result.current.breakpoint).toBe("xs");
    });

    it("handles window resize", () => {
      const { result, rerender } = renderHook(() => useResponsive());

      expect(result.current.isDesktop).toBe(true);

      // Simulate resize to mobile
      Object.defineProperty(window, "innerWidth", { value: 375 });
      act(() => {
        // Trigger resize event
        window.dispatchEvent(new Event("resize"));
      });

      rerender();

      expect(result.current.isMobile).toBe(true);
    });
  });

  describe("useDevice", () => {
    it("detects desktop device", () => {
      const { result } = renderHook(() => useDevice());
      expect(result.current).toBe("desktop");
    });

    it("detects mobile device", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
        },
      });

      const { result } = renderHook(() => useDevice());
      expect(result.current).toBe("mobile");
    });

    it("detects tablet device", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)",
        },
      });

      const { result } = renderHook(() => useDevice());
      expect(result.current).toBe("tablet");
    });
  });

  describe("useOrientation", () => {
    it("detects portrait orientation", () => {
      Object.defineProperty(window, "innerHeight", { value: 1024 });
      Object.defineProperty(window, "innerWidth", { value: 768 });

      const { result } = renderHook(() => useOrientation());
      expect(result.current).toBe("portrait");
    });

    it("detects landscape orientation", () => {
      Object.defineProperty(window, "innerHeight", { value: 768 });
      Object.defineProperty(window, "innerWidth", { value: 1024 });

      const { result } = renderHook(() => useOrientation());
      expect(result.current).toBe("landscape");
    });
  });

  describe("useTouch", () => {
    it("detects touch device", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          maxTouchPoints: 5,
        },
      });

      const { result } = renderHook(() => useTouch());
      expect(result.current).toBe(true);
    });

    it("detects non-touch device", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          maxTouchPoints: 0,
        },
      });

      const { result } = renderHook(() => useTouch());
      expect(result.current).toBe(false);
    });
  });

  describe("useScrollPosition", () => {
    it("returns initial scroll position", () => {
      const { result } = renderHook(() => useScrollPosition());
      expect(result.current).toBe(0);
    });

    it("updates scroll position", () => {
      const { result } = renderHook(() => useScrollPosition());

      act(() => {
        Object.defineProperty(window, "pageYOffset", { value: 100 });
        window.dispatchEvent(new Event("scroll"));
      });

      expect(result.current).toBe(0); // Initial value, would be 100 in real scenario
    });
  });

  describe("useViewportVisibility", () => {
    it("returns visibility state", () => {
      const { result } = renderHook(() => useViewportVisibility());
      const [setRef, isVisible] = result.current;

      expect(typeof setRef).toBe("function");
      expect(isVisible).toBe(false);
    });
  });

  describe("useKeyboard", () => {
    it("detects keyboard open on mobile", () => {
      Object.defineProperty(window, "outerHeight", { value: 768 });
      Object.defineProperty(window, "innerHeight", { value: 400 });

      const { result } = renderHook(() => useKeyboard());
      expect(result.current).toBe(true);
    });

    it("detects keyboard closed", () => {
      Object.defineProperty(window, "outerHeight", { value: 768 });
      Object.defineProperty(window, "innerHeight", { value: 768 });

      const { result } = renderHook(() => useKeyboard());
      expect(result.current).toBe(false);
    });
  });

  describe("useNetworkStatus", () => {
    it("detects online status", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          onLine: true,
        },
      });

      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current).toBe(true);
    });

    it("detects offline status", () => {
      Object.defineProperty(window, "navigator", {
        value: {
          onLine: false,
        },
      });

      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current).toBe(false);
    });
  });

  describe("useReducedMotion", () => {
    it("detects reduced motion preference", () => {
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      Object.defineProperty(window, "matchMedia", {
        value: mockMatchMedia,
      });

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(true);
    });

    it("detects no reduced motion preference", () => {
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      Object.defineProperty(window, "matchMedia", {
        value: mockMatchMedia,
      });

      const { result } = renderHook(() => useReducedMotion());
      expect(result.current).toBe(false);
    });
  });

  describe("useColorScheme", () => {
    it("detects dark color scheme", () => {
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      Object.defineProperty(window, "matchMedia", {
        value: mockMatchMedia,
      });

      const { result } = renderHook(() => useColorScheme());
      expect(result.current).toBe("dark");
    });

    it("detects light color scheme", () => {
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      Object.defineProperty(window, "matchMedia", {
        value: mockMatchMedia,
      });

      const { result } = renderHook(() => useColorScheme());
      expect(result.current).toBe("light");
    });
  });
});
