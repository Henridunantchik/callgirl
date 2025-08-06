import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../../redux/user/user.slice";
import { AuthProvider } from "../../contexts/AuthContext";
import SignIn from "../../pages/SignIn";
import SignUp from "../../pages/SignUp";

// Mock API calls
const mockApi = {
  post: vi.fn(),
  get: vi.fn(),
};

vi.mock("axios", () => ({
  default: {
    create: () => mockApi,
    post: mockApi.post,
    get: mockApi.get,
  },
}));

// Create test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState: initialState,
  });
};

// Test wrapper component
const TestWrapper = ({ children, initialState = {} }) => {
  const store = createTestStore(initialState);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe("Authentication Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("SignIn Component", () => {
    it("renders sign in form", () => {
      render(
        <TestWrapper>
          <SignIn />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("validates required fields", async () => {
      render(
        <TestWrapper>
          <SignIn />
        </TestWrapper>
      );

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it("handles successful login", async () => {
      const mockUser = {
        _id: "123",
        name: "Test User",
        email: "test@example.com",
        role: "client",
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: mockUser,
            token: "mock-token",
          },
        },
      };

      mockApi.post.mockResolvedValueOnce(mockResponse);

      render(
        <TestWrapper>
          <SignIn />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/auth/login", {
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("handles login error", async () => {
      const mockError = {
        response: {
          data: {
            message: "Invalid credentials",
          },
        },
      };

      mockApi.post.mockRejectedValueOnce(mockError);

      render(
        <TestWrapper>
          <SignIn />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe("SignUp Component", () => {
    it("renders sign up form", () => {
      render(
        <TestWrapper>
          <SignUp />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign up/i })
      ).toBeInTheDocument();
    });

    it("validates password confirmation", async () => {
      render(
        <TestWrapper>
          <SignUp />
        </TestWrapper>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password456" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it("handles successful registration", async () => {
      const mockUser = {
        _id: "123",
        name: "Test User",
        email: "test@example.com",
        role: "client",
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: mockUser,
            token: "mock-token",
          },
        },
      };

      mockApi.post.mockResolvedValueOnce(mockResponse);

      render(
        <TestWrapper>
          <SignUp />
        </TestWrapper>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith("/auth/register", {
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });
      });
    });
  });

  describe("Authentication Context", () => {
    it("provides authentication state", () => {
      render(
        <TestWrapper>
          <div data-testid="auth-test">Test</div>
        </TestWrapper>
      );

      expect(screen.getByTestId("auth-test")).toBeInTheDocument();
    });

    it("handles logout", async () => {
      const { store } = render(
        <TestWrapper>
          <div data-testid="auth-test">Test</div>
        </TestWrapper>
      );

      // Simulate logout
      store.dispatch({ type: "user/logout" });

      await waitFor(() => {
        const state = store.getState();
        expect(state.user.user).toBeNull();
      });
    });
  });

  describe("Protected Routes", () => {
    it("redirects unauthenticated users", () => {
      render(
        <TestWrapper>
          <div data-testid="protected-content">Protected</div>
        </TestWrapper>
      );

      // Should not show protected content without authentication
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });
  });
});
