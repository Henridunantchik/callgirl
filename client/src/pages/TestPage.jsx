import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { escortAPI, authAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../helpers/showToast";

const TestPage = () => {
  const { user, loading } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [runningTest, setRunningTest] = useState(null);

  const runTest = async (testName, testFunction) => {
    setRunningTest(testName);
    try {
      console.log(`🧪 Running test: ${testName}`);
      const result = await testFunction();
      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        },
      }));
      console.log(`✅ Test passed: ${testName}`, result);
      showToast("success", `${testName} passed!`);
    } catch (error) {
      console.error(`❌ Test failed: ${testName}`, error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        },
      }));
      showToast("error", `${testName} failed: ${errorMessage}`);
    } finally {
      setRunningTest(null);
    }
  };

  const tests = [
    {
      name: "Authentication Status",
      function: () => Promise.resolve({ user, loading }),
      description: "Check if user is authenticated",
    },
    {
      name: "Get All Escorts",
      function: () => escortAPI.getAllEscorts(),
      description: "Fetch all escorts from API",
    },
    {
      name: "Search Escorts",
      function: () => escortAPI.searchEscorts({ q: "test" }),
      description: "Search escorts with query",
    },
    {
      name: "API Base URL",
      function: () =>
        Promise.resolve({
          baseURL:
            process.env.VITE_API_BASE_URL ||
            (window.location.hostname !== "localhost" &&
            window.location.hostname !== "127.0.0.1"
              ? "https://callgirls-api.onrender.com/api"
              : "http://localhost:5000/api"),
        }),
      description: "Check API base URL configuration",
    },
  ];

  const getTestStatus = (testName) => {
    const result = testResults[testName];
    if (!result) return "pending";
    return result.success ? "passed" : "failed";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "passed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "passed":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "⏳";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            API & Feature Test Page
          </h1>
          <p className="text-gray-600">
            Test all escort features and API endpoints
          </p>
        </div>

        {/* Authentication Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">User:</span>
                <span className={user ? "text-green-600" : "text-red-600"}>
                  {user ? user.name || user.email : "Not authenticated"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Loading:</span>
                <span
                  className={loading ? "text-yellow-600" : "text-green-600"}
                >
                  {loading ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Token:</span>
                <span
                  className={
                    localStorage.getItem("token")
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {localStorage.getItem("token") ? "Present" : "Missing"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Tests */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Endpoint Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test) => (
                <div
                  key={test.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{test.name}</span>
                      <Badge
                        variant={
                          getTestStatus(test.name) === "passed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {getStatusIcon(getTestStatus(test.name))}{" "}
                        {getTestStatus(test.name)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{test.description}</p>
                    {testResults[test.name] && (
                      <div className="mt-2 text-xs text-gray-500">
                        Last run:{" "}
                        {new Date(
                          testResults[test.name].timestamp
                        ).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => runTest(test.name, test.function)}
                    disabled={runningTest === test.name}
                    variant={
                      getTestStatus(test.name) === "passed"
                        ? "outline"
                        : "default"
                    }
                  >
                    {runningTest === test.name ? "Testing..." : "Run Test"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(testResults).map(([testName, result]) => (
                  <div key={testName} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <strong>{testName}</strong>
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? "PASSED" : "FAILED"}
                      </Badge>
                    </div>
                    {result.success ? (
                      <div className="text-sm text-gray-600">
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => (window.location.href = "/escort/registration")}
              >
                Test Escort Registration
              </Button>
              <Button onClick={() => (window.location.href = "/escort/list")}>
                Test Escort List
              </Button>
              <Button onClick={() => (window.location.href = "/signin")}>
                Test Authentication
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPage;
