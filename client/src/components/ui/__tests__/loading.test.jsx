import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  Spinner,
  LoadingOverlay,
  ProgressBar,
  LoadingButton,
  InfiniteScrollLoader,
  PageLoader,
  ContentLoader,
  UploadProgress,
  SearchLoader,
  FormLoader,
  ImageLoader,
  ActionLoader,
} from "../loading";

describe("Loading Components", () => {
  describe("Spinner", () => {
    it("renders with default size", () => {
      render(<Spinner data-testid="spinner" />);
      const spinner = screen.getByTestId("spinner");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass(
        "animate-spin",
        "rounded-full",
        "border-2",
        "border-gray-300",
        "border-t-blue-600",
        "w-6",
        "h-6"
      );
    });

    it("renders with custom size", () => {
      render(<Spinner size="xl" data-testid="spinner" />);
      const spinner = screen.getByTestId("spinner");
      expect(spinner).toHaveClass("w-12", "h-12");
    });

    it("renders with custom className", () => {
      render(<Spinner className="custom-class" data-testid="spinner" />);
      const spinner = screen.getByTestId("spinner");
      expect(spinner).toHaveClass("custom-class");
    });
  });

  describe("LoadingOverlay", () => {
    it("renders children when not loading", () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div data-testid="content">Content</div>
        </LoadingOverlay>
      );
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("renders overlay when loading", () => {
      render(
        <LoadingOverlay isLoading={true} message="Loading...">
          <div data-testid="content">Content</div>
        </LoadingOverlay>
      );
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });
  });

  describe("ProgressBar", () => {
    it("renders with default progress", () => {
      render(<ProgressBar data-testid="progress" />);
      const progress = screen.getByTestId("progress");
      expect(progress).toBeInTheDocument();
    });

    it("renders with custom progress", () => {
      render(<ProgressBar progress={50} data-testid="progress" />);
      const progress = screen.getByTestId("progress");
      const bar = progress.querySelector('div[style*="width"]');
      expect(bar).toHaveStyle("width: 50%");
    });

    it("clamps progress to 0-100", () => {
      render(<ProgressBar progress={150} data-testid="progress" />);
      const progress = screen.getByTestId("progress");
      const bar = progress.querySelector('div[style*="width"]');
      expect(bar).toHaveStyle("width: 100%");
    });
  });

  describe("LoadingButton", () => {
    it("renders button with children", () => {
      render(<LoadingButton>Click me</LoadingButton>);
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("shows spinner when loading", () => {
      render(<LoadingButton loading={true}>Click me</LoadingButton>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("is disabled when loading", () => {
      render(<LoadingButton loading={true}>Click me</LoadingButton>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("handles click when not loading", () => {
      const handleClick = vi.fn();
      render(<LoadingButton onClick={handleClick}>Click me</LoadingButton>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("InfiniteScrollLoader", () => {
    it("renders infinite scroll loader", () => {
      render(<InfiniteScrollLoader />);
      expect(screen.getByText("Loading more...")).toBeInTheDocument();
    });
  });

  describe("PageLoader", () => {
    it("renders page loader with default message", () => {
      render(<PageLoader />);
      expect(screen.getByText("Loading page...")).toBeInTheDocument();
    });

    it("renders page loader with custom message", () => {
      render(<PageLoader message="Custom loading..." />);
      expect(screen.getByText("Custom loading...")).toBeInTheDocument();
    });
  });

  describe("ContentLoader", () => {
    it("renders children when not loading", () => {
      render(
        <ContentLoader isLoading={false}>
          <div data-testid="content">Content</div>
        </ContentLoader>
      );
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("renders loading message when loading", () => {
      render(
        <ContentLoader isLoading={true}>
          <div data-testid="content">Content</div>
        </ContentLoader>
      );
      expect(screen.getByText("Loading content...")).toBeInTheDocument();
    });

    it("renders skeleton when provided", () => {
      const MockSkeleton = () => <div data-testid="skeleton">Skeleton</div>;
      render(
        <ContentLoader isLoading={true} skeleton={MockSkeleton}>
          <div data-testid="content">Content</div>
        </ContentLoader>
      );
      expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });
  });

  describe("UploadProgress", () => {
    it("renders upload progress", () => {
      render(<UploadProgress progress={50} fileName="test.jpg" />);
      expect(screen.getByText("test.jpg")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("shows cancel button when not complete", () => {
      const onCancel = vi.fn();
      render(
        <UploadProgress progress={50} fileName="test.jpg" onCancel={onCancel} />
      );
      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toBeInTheDocument();
      fireEvent.click(cancelButton);
      expect(onCancel).toHaveBeenCalled();
    });

    it("shows complete message when progress is 100", () => {
      render(<UploadProgress progress={100} fileName="test.jpg" />);
      expect(screen.getByText("Upload complete")).toBeInTheDocument();
    });
  });

  describe("SearchLoader", () => {
    it("renders search loader", () => {
      render(<SearchLoader />);
      expect(screen.getByText("Searching...")).toBeInTheDocument();
    });
  });

  describe("FormLoader", () => {
    it("renders form loader with default message", () => {
      render(<FormLoader />);
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    it("renders form loader with custom message", () => {
      render(<FormLoader message="Processing..." />);
      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });
  });

  describe("ImageLoader", () => {
    it("renders image with loading state", () => {
      render(<ImageLoader src="test.jpg" alt="Test" data-testid="image" />);
      const image = screen.getByTestId("image");
      expect(image).toBeInTheDocument();
    });

    it("shows error state when image fails to load", () => {
      render(<ImageLoader src="invalid.jpg" alt="Test" data-testid="image" />);
      const image = screen.getByTestId("image");
      fireEvent.error(image);
      expect(screen.getByText("Image not found")).toBeInTheDocument();
    });
  });

  describe("ActionLoader", () => {
    it("renders children when not loading", () => {
      render(
        <ActionLoader action="login" loading={false}>
          <div data-testid="content">Content</div>
        </ActionLoader>
      );
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("renders loading message for login action", () => {
      render(
        <ActionLoader action="login" loading={true}>
          <div data-testid="content">Content</div>
        </ActionLoader>
      );
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });

    it("renders loading message for register action", () => {
      render(
        <ActionLoader action="register" loading={true}>
          <div data-testid="content">Content</div>
        </ActionLoader>
      );
      expect(screen.getByText("Creating account...")).toBeInTheDocument();
    });

    it("renders default loading message for unknown action", () => {
      render(
        <ActionLoader action="unknown" loading={true}>
          <div data-testid="content">Content</div>
        </ActionLoader>
      );
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });
});
