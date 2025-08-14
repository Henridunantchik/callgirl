import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Skeleton,
  EscortCardSkeleton,
  ProfileCardSkeleton,
  BlogCardSkeleton,
  FormSkeleton,
  TableSkeleton,
  NavigationSkeleton,
  DashboardSkeleton,
  GallerySkeleton,
  SearchResultsSkeleton,
  SubscriptionSkeleton,
} from "../skeleton";

describe("Skeleton Components", () => {
  describe("Skeleton", () => {
    it("renders with default props", () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass("animate-pulse", "bg-gray-200", "rounded");
    });

    it("renders with custom className", () => {
      render(<Skeleton className="custom-class" data-testid="skeleton" />);
      const skeleton = screen.getByTestId("skeleton");
      expect(skeleton).toHaveClass("custom-class");
    });
  });

  describe("EscortCardSkeleton", () => {
    it("renders escort card skeleton", () => {
      render(<EscortCardSkeleton />);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("has correct structure", () => {
      render(<EscortCardSkeleton />);
      const container = screen.getByRole("generic");
      expect(container).toHaveClass(
        "bg-white",
        "rounded-lg",
        "shadow-md",
        "overflow-hidden"
      );
    });
  });

  describe("ProfileCardSkeleton", () => {
    it("renders profile card skeleton", () => {
      render(<ProfileCardSkeleton />);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("has avatar and content areas", () => {
      render(<ProfileCardSkeleton />);
      const container = screen.getByRole("generic");
      expect(container).toHaveClass(
        "bg-white",
        "rounded-lg",
        "shadow-md",
        "p-6"
      );
    });
  });

  describe("BlogCardSkeleton", () => {
    it("renders blog card skeleton", () => {
      render(<BlogCardSkeleton />);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("has image and content areas", () => {
      render(<BlogCardSkeleton />);
      const container = screen.getByRole("generic");
      expect(container).toHaveClass(
        "bg-white",
        "rounded-lg",
        "shadow-md",
        "overflow-hidden"
      );
    });
  });

  describe("FormSkeleton", () => {
    it("renders form skeleton", () => {
      render(<FormSkeleton />);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("has form structure", () => {
      render(<FormSkeleton />);
      const container = screen.getByRole("generic");
      expect(container).toHaveClass(
        "bg-white",
        "rounded-lg",
        "shadow-md",
        "p-6"
      );
    });
  });

  describe("TableSkeleton", () => {
    it("renders table skeleton", () => {
      render(<TableSkeleton />);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("has table structure with rows", () => {
      render(<TableSkeleton />);
      const container = screen.getByRole("generic");
      expect(container).toHaveClass(
        "bg-white",
        "rounded-lg",
        "shadow-md",
        "overflow-hidden"
      );
    });
  });

  describe("NavigationSkeleton", () => {
    it("renders navigation skeleton", () => {
      render(<NavigationSkeleton />);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("has navigation structure", () => {
      render(<NavigationSkeleton />);
      const container = screen.getByRole("generic");
      expect(container).toHaveClass("bg-white", "shadow-md");
    });
  });

  describe("DashboardSkeleton", () => {
    it("renders dashboard skeleton", () => {
      render(<DashboardSkeleton />);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("has dashboard grid structure", () => {
      render(<DashboardSkeleton />);
      const container = screen.getByRole("generic");
      expect(container).toHaveClass("space-y-6");
    });
  });

  describe("GallerySkeleton", () => {
    it("renders gallery skeleton", () => {
      render(<GallerySkeleton />);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("has grid structure", () => {
      render(<GallerySkeleton />);
      const container = screen.getByRole("generic");
      expect(container).toHaveClass(
        "grid",
        "grid-cols-2",
        "md:grid-cols-3",
        "lg:grid-cols-4"
      );
    });
  });

  describe("SearchResultsSkeleton", () => {
    it("renders search results skeleton", () => {
      render(<SearchResultsSkeleton />);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("has search results structure", () => {
      render(<SearchResultsSkeleton />);
      const container = screen.getByRole("generic");
      expect(container).toHaveClass("space-y-4");
    });
  });

  describe("SubscriptionSkeleton", () => {
    it("renders subscription skeleton", () => {
      render(<SubscriptionSkeleton />);
      expect(screen.getByRole("generic")).toBeInTheDocument();
    });

    it("has subscription grid structure", () => {
      render(<SubscriptionSkeleton />);
      const container = screen.getByRole("generic");
      expect(container).toHaveClass("grid", "grid-cols-1", "md:grid-cols-3");
    });
  });
});
