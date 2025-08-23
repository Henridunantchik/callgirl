import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  HardDrive,
} from "lucide-react";

const PerformanceDashboard = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const [metricsRes, healthRes] = await Promise.all([
        fetch("/api/performance"),
        fetch("/api/performance/health"),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.data);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData.data);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPerformanceData();
      const interval = setInterval(fetchPerformanceData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPerformanceScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="text-blue-600" />
              Performance Dashboard
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPerformanceData}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Health Status */}
          {health && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge className={getStatusColor(health.status)}>
                    {health.status.toUpperCase()}
                  </Badge>
                  {health.issues.length > 0 && (
                    <span className="text-sm text-red-600">
                      {health.issues.length} issue(s) detected
                    </span>
                  )}
                </div>

                {health.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-700">Issues:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {health.issues.map((issue, index) => (
                        <li key={index} className="text-red-600">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {health.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-blue-700">
                      Recommendations:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {health.recommendations.map((rec, index) => (
                        <li key={index} className="text-blue-600">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          {metrics && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Avg Response</p>
                        <p className="text-2xl font-bold">
                          {metrics.performance?.avgResponseTime || 0}ms
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Performance Score
                        </p>
                        <p
                          className={`text-2xl font-bold ${getPerformanceScoreColor(
                            metrics.performance?.performanceScore || 0
                          )}`}
                        >
                          {metrics.performance?.performanceScore || 0}/100
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Active Requests</p>
                        <p className="text-2xl font-bold">
                          {metrics.requests?.current || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Requests</p>
                        <p className="text-2xl font-bold">
                          {metrics.requests?.total || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-gray-600" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Memory Usage</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              metrics.system?.memory
                                ? (metrics.system.memory.used /
                                    metrics.system.memory.total) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {metrics.system?.memory?.used || 0}MB /{" "}
                        {metrics.system?.memory?.total || 0}MB
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Uptime</p>
                      <p className="text-lg font-semibold">
                        {Math.floor((metrics.system?.uptime || 0) / 3600)}h{" "}
                        {Math.floor(
                          ((metrics.system?.uptime || 0) % 3600) / 60
                        )}
                        m
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Peak Requests
                      </p>
                      <p className="text-lg font-semibold">
                        {metrics.requests?.peak || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endpoint Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600" />
                    Endpoint Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.endpoints?.map((endpoint, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {endpoint.endpoint}
                          </p>
                          <p className="text-xs text-gray-500">
                            {endpoint.count} requests • Last:{" "}
                            {endpoint.lastRequest
                              ? new Date(
                                  endpoint.lastRequest
                                ).toLocaleTimeString()
                              : "Never"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {endpoint.avgDuration}ms
                          </p>
                          <p className="text-xs text-gray-500">
                            {endpoint.minDuration}ms - {endpoint.maxDuration}ms
                          </p>
                        </div>
                        {endpoint.errors > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {endpoint.errors} errors
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Slow Queries */}
              {metrics.slowQueries && metrics.slowQueries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Slow Queries (Last 10)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {metrics.slowQueries.map((query, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {query.method} {query.url}
                              </p>
                              <p className="text-xs text-gray-500">
                                User: {query.userId} • IP: {query.ip}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-red-600">
                                {query.duration}ms
                              </p>
                              <p className="text-xs text-gray-500">
                                {query.timestamp
                                  ? new Date(
                                      query.timestamp
                                    ).toLocaleTimeString()
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!metrics && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No performance data available</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-500 mt-2">Loading performance data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
