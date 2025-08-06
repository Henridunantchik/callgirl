import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { escortAPI } from "../services/api";

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      console.log(`🧪 Running test: ${testName}`);
      const result = await testFunction();
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: true, data: result },
      }));
      console.log(`✅ Test passed: ${testName}`, result);
    } catch (error) {
      console.error(`❌ Test failed: ${testName}`, error);
      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          error: error.response?.data?.message || error.message,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: "Get All Escorts",
      function: () => escortAPI.getAllEscorts(),
    },
    {
      name: "Search Escorts",
      function: () => escortAPI.searchEscorts({ q: "test" }),
    },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.name}
              className="flex items-center justify-between p-3 border rounded"
            >
              <span className="font-medium">{test.name}</span>
              <div className="flex items-center gap-2">
                {testResults[test.name] && (
                  <span
                    className={`text-sm ${
                      testResults[test.name].success
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {testResults[test.name].success ? "✅ Passed" : "❌ Failed"}
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={() => runTest(test.name, test.function)}
                  disabled={loading}
                >
                  {loading ? "Testing..." : "Test"}
                </Button>
              </div>
            </div>
          ))}

          {Object.keys(testResults).length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Test Results:</h4>
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="text-sm">
                  <strong>{testName}:</strong>{" "}
                  {result.success ? "PASSED" : "FAILED"}
                  {!result.success && result.error && (
                    <div className="text-red-600 ml-4">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTest;
