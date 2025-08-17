import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { 
  Car, 
  MapPin, 
  Phone, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  Download
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../helpers/showToast";

const TransportHistory = () => {
  const { user } = useAuth();
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchTransportHistory();
    fetchTransportStats();
  }, [filter]);

  const fetchTransportHistory = async () => {
    try {
      const response = await fetch(`/api/transport/history?status=${filter !== 'all' ? filter : ''}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setTransports(data.data.transports);
      } else {
        showToast(data.message || "Failed to fetch transport history", "error");
      }
    } catch (error) {
      console.error("Error fetching transport history:", error);
      showToast("Failed to fetch transport history", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransportStats = async () => {
    try {
      const response = await fetch("/api/transport/stats", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching transport stats:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      processing: { color: "bg-blue-100 text-blue-800", icon: AlertCircle },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      failed: { color: "bg-red-100 text-red-800", icon: XCircle },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Escort",
      "City",
      "Transport Amount",
      "Platform Commission",
      "PesaPal Commission",
      "Total Amount",
      "Escort Receives",
      "Status",
      "Pickup Location",
      "Destination Location",
    ];

    const csvData = transports.map(transport => [
      formatDate(transport.createdAt),
      `${transport.escort?.firstName} ${transport.escort?.lastName}`,
      transport.city,
      transport.transportAmount,
      transport.platformCommission,
      transport.pesapalCommission,
      transport.totalAmount,
      transport.escortAmount,
      transport.status,
      transport.pickupLocation,
      transport.destinationLocation,
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transport_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transport History</h1>
        <p className="text-gray-600">View all your transport money transactions</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transports</p>
                  <p className="text-2xl font-bold">{stats.summary.totalTransports}</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.summary.completedTransports}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.summary.completionRate}%</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actions</p>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <div className="flex gap-2">
          {["all", "pending", "processing", "completed", "failed"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Transport List */}
      <div className="space-y-4">
        {transports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transport transactions found</h3>
              <p className="text-gray-600">
                {filter === "all" 
                  ? "You haven't made any transport payments yet."
                  : `No ${filter} transport transactions found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          transports.map((transport) => (
            <Card key={transport._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={transport.escort?.profileImage || "/user.png"}
                      alt={transport.escort?.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">
                        {transport.escort?.firstName} {transport.escort?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{transport.city}</p>
                    </div>
                  </div>
                  {getStatusBadge(transport.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Locations</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>From:</strong> {transport.pickupLocation}</p>
                      <p><strong>To:</strong> {transport.destinationLocation}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Amount Breakdown</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Transport:</strong> {transport.transportAmount.toLocaleString()} UGX</p>
                      <p><strong>Platform Fee:</strong> {transport.platformCommission.toLocaleString()} UGX</p>
                      <p><strong>PesaPal Fee:</strong> {transport.pesapalCommission.toLocaleString()} UGX</p>
                      <p><strong>Total:</strong> {transport.totalAmount.toLocaleString()} UGX</p>
                      <p className="text-green-600 font-medium">
                        <strong>Escort Receives:</strong> {transport.escortAmount.toLocaleString()} UGX
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(transport.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {transport.senderPhone}
                    </div>
                  </div>
                  <div className="text-right">
                    <p>Payment Method: {transport.paymentMethod}</p>
                    {transport.completedAt && (
                      <p>Completed: {formatDate(transport.completedAt)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TransportHistory;
