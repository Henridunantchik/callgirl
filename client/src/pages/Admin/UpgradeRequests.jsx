import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MessageCircle,
  Phone,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { upgradeAPI, messageAPI } from "../../services/api";
import { showToast } from "../../helpers/showToast";
import Loading from "../../components/Loading";
import { useAuth } from "../../contexts/AuthContext";

const UpgradeRequests = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalRevenue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickAction, setQuickAction] = useState(null);
  const [quickRequest, setQuickRequest] = useState(null);
  const [quickNotes, setQuickNotes] = useState("");

  // Fetch upgrade requests and stats
  useEffect(() => {
    fetchUpgradeRequests();
    fetchStats();
  }, []);

  const fetchUpgradeRequests = async () => {
    try {
      setLoading(true);
      const response = await upgradeAPI.getAllRequests({
        status: statusFilter !== "all" ? statusFilter : undefined,
        countryCode: countryFilter !== "all" ? countryFilter : undefined,
      });

      if (response.data?.data?.requests) {
        setRequests(response.data.data.requests);
      }
    } catch (error) {
      console.error("Error fetching upgrade requests:", error);
      showToast("error", "Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await upgradeAPI.getStats();
      if (response.data?.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest || !adminNotes.trim()) {
      showToast("error", "Veuillez ajouter des notes avant d'approuver");
      return;
    }

    try {
      setProcessing(true);
      await upgradeAPI.approveRequest(selectedRequest._id, adminNotes);
      showToast("success", "Demande approuvée avec succès");
      setShowModal(false);
      fetchUpgradeRequests();
      fetchStats();
    } catch (error) {
      console.error("Error approving request:", error);
      showToast("error", "Erreur lors de l'approbation");
    } finally {
      setProcessing(false);
    }
  };

  const handleSendPaymentInstructions = async () => {
    if (!selectedRequest || !paymentInstructions.trim()) {
      showToast("error", "Veuillez ajouter les instructions de paiement");
      return;
    }

    try {
      setProcessing(true);

      // 1. Update the upgrade request status
      await upgradeAPI.sendPaymentInstructions(selectedRequest._id, {
        paymentInstructions,
        paymentMethod,
      });

      // 2. Send payment instructions via internal messaging system
      const messageContent = `Hi ${
        selectedRequest.escortName
      }! Thank you for your ${selectedRequest.requestedPlan} upgrade request.

Payment Details:
- Amount: $${selectedRequest.paymentAmount}
- Method: ${
        paymentMethod === "mobile_money"
          ? "Mobile Money"
          : paymentMethod === "bank_transfer"
          ? "Bank Transfer"
          : "Cash"
      }
- Instructions: ${paymentInstructions}

Please complete payment within 48 hours and send us the receipt.

Best regards,
Admin Team`;

      await messageAPI.sendMessage({
        escortId: selectedRequest.escort,
        content: messageContent,
        type: "text",
      });

      showToast("success", "Instructions de paiement envoyées");
      setShowModal(false);
      setPaymentInstructions("");
      fetchUpgradeRequests();
      fetchStats();
    } catch (error) {
      console.error("Error sending payment instructions:", error);
      showToast("error", "Erreur lors de l'envoi des instructions");
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickApprove = (request) => {
    setQuickAction("approve");
    setQuickRequest(request);
    setQuickNotes("");
    setShowQuickModal(true);
  };

  const handleQuickReject = (request) => {
    setQuickAction("reject");
    setQuickRequest(request);
    setQuickNotes("");
    setShowQuickModal(true);
  };

  const handleQuickConfirmPayment = (request) => {
    setQuickAction("confirm_payment");
    setQuickRequest(request);
    setQuickNotes("");
    setShowQuickModal(true);
  };

  const handleQuickActionSubmit = async () => {
    if (!quickNotes.trim()) {
      showToast("error", "Admin notes are required");
      return;
    }

    try {
      setProcessing(true);
      console.log("Processing quick action:", quickAction);
      console.log("Request ID:", quickRequest._id);
      console.log("Admin notes:", quickNotes);

      if (quickAction === "approve") {
        console.log("Calling approveRequest API...");
        const response = await upgradeAPI.approveRequest(
          quickRequest._id,
          quickNotes
        );
        console.log("Approve response:", response);
        showToast("success", "Demande approuvée");
      } else if (quickAction === "confirm_payment") {
        console.log("Calling confirmPayment API...");
        const response = await upgradeAPI.confirmPayment(
          quickRequest._id,
          quickNotes
        );
        console.log("Confirm payment response:", response);
        showToast("success", "Paiement confirmé");
      } else if (quickAction === "reject") {
        console.log("Calling rejectRequest API...");
        const response = await upgradeAPI.rejectRequest(
          quickRequest._id,
          quickNotes
        );
        console.log("Reject response:", response);
        showToast("success", "Demande rejetée");
      }

      setShowQuickModal(false);
      setQuickNotes("");
      fetchUpgradeRequests();
      fetchStats();
    } catch (error) {
      console.error("Error processing request:", error);
      console.error("Error details:", error.response?.data);
      showToast(
        "error",
        `Erreur lors du traitement: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !adminNotes.trim()) {
      showToast("error", "Veuillez ajouter des notes avant de rejeter");
      return;
    }

    try {
      setProcessing(true);
      await upgradeAPI.rejectRequest(selectedRequest._id, adminNotes);
      showToast("success", "Demande rejetée");
      setShowModal(false);
      fetchUpgradeRequests();
      fetchStats();
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToast("error", "Erreur lors du rejet");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      payment_required: "bg-blue-100 text-blue-800",
      payment_confirmed: "bg-purple-100 text-purple-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getContactMethodIcon = (method) => {
    return method === "whatsapp" ? (
      <Phone className="w-4 h-4" />
    ) : (
      <MessageCircle className="w-4 h-4" />
    );
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.escortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.escortEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.escortPhone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesCountry =
      countryFilter === "all" || request.countryCode === countryFilter;

    return matchesSearch && matchesStatus && matchesCountry;
  });

  if (loading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>Gestion des Demandes d'Upgrade - Admin</title>
        <meta
          name="description"
          content="Gérer les demandes d'upgrade des escorts"
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestion des Demandes d'Upgrade
          </h1>
          <p className="text-gray-600">
            Approuvez ou rejetez les demandes d'upgrade des escorts
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <div className="text-sm text-gray-600">Total Demandes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <div className="text-sm text-gray-600">En Attente</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.approvedRequests}</div>
              <div className="text-sm text-gray-600">Approuvées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{stats.rejectedRequests}</div>
              <div className="text-sm text-gray-600">Rejetées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              <div className="text-sm text-gray-600">Revenus</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Rechercher
                  </label>
                  <Input
                    placeholder="Nom, email, téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Statut
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="payment_required">
                        Paiement requis
                      </SelectItem>
                      <SelectItem value="payment_confirmed">
                        Paiement confirmé
                      </SelectItem>
                      <SelectItem value="approved">Approuvées</SelectItem>
                      <SelectItem value="rejected">Rejetées</SelectItem>
                      <SelectItem value="expired">Expirées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Pays
                  </label>
                  <Select
                    value={countryFilter}
                    onValueChange={setCountryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="ug">Uganda</SelectItem>
                      <SelectItem value="ke">Kenya</SelectItem>
                      <SelectItem value="tz">Tanzania</SelectItem>
                      <SelectItem value="rw">Rwanda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setCountryFilter("all");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Demandes d'Upgrade ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune demande trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {request.escortName?.charAt(0).toUpperCase() || "E"}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {request.escortName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.escortEmail} • {request.escortPhone}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${request.paymentAmount}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Plan and Status Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                          <span className="text-sm font-medium text-gray-700">
                            {request.currentPlan}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm font-medium text-blue-600">
                            {request.requestedPlan}
                          </span>
                        </div>
                        {getContactMethodIcon(request.contactMethod)}
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {/* Payment Instructions Section */}
                    {request.status === "payment_required" &&
                      request.paymentInstructions && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-800">
                              Payment Instructions Sent
                            </span>
                          </div>
                          <div className="text-sm text-blue-700 mb-2 line-clamp-3">
                            {request.paymentInstructions}
                          </div>
                          {request.paymentDeadline && (
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <Clock className="w-3 h-3" />
                              <span>
                                Deadline:{" "}
                                {new Date(
                                  request.paymentDeadline
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                      {/* Pending status - View button */}
                      {request.status === "pending" && (
                        <Button
                          onClick={() => handleViewRequest(request)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      )}

                      {/* Payment required status - Confirm Payment/Reject buttons */}
                      {request.status === "payment_required" && (
                        <>
                          <Button
                            onClick={() => handleViewRequest(request)}
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            onClick={() => handleQuickConfirmPayment(request)}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Payment
                          </Button>
                          <Button
                            onClick={() => handleQuickReject(request)}
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {/* Payment confirmed status - Approve button */}
                      {request.status === "payment_confirmed" && (
                        <Button
                          onClick={() => handleViewRequest(request)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal for viewing/processing request */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Détails de la Demande</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <p className="text-gray-900">{selectedRequest.escortName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="text-gray-900">{selectedRequest.escortEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Téléphone
                  </label>
                  <p className="text-gray-900">{selectedRequest.escortPhone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Pays
                  </label>
                  <p className="text-gray-900">
                    {selectedRequest.countryCode?.toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Plan Actuel
                  </label>
                  <p className="text-gray-900">{selectedRequest.currentPlan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Plan Demandé
                  </label>
                  <p className="text-gray-900">
                    {selectedRequest.requestedPlan}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Montant
                  </label>
                  <p className="text-gray-900">
                    ${selectedRequest.paymentAmount}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Méthode de Contact
                  </label>
                  <p className="text-gray-900 flex items-center gap-1">
                    {getContactMethodIcon(selectedRequest.contactMethod)}
                    {selectedRequest.contactMethod}
                  </p>
                </div>
              </div>

              {selectedRequest.paymentProof && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Preuve de Paiement
                  </label>
                  <p className="text-gray-900 text-sm">
                    {selectedRequest.paymentProof}
                  </p>
                </div>
              )}

              {selectedRequest.paymentInstructions && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Instructions de Paiement
                  </label>
                  <p className="text-gray-900 text-sm">
                    {selectedRequest.paymentInstructions}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Méthode: {selectedRequest.paymentMethod}
                  </p>
                  {selectedRequest.paymentDeadline && (
                    <p className="text-xs text-gray-500">
                      Échéance:{" "}
                      {new Date(
                        selectedRequest.paymentDeadline
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Different actions based on status */}
              {selectedRequest.status === "pending" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Instructions de Paiement *
                    </label>
                    <Textarea
                      value={paymentInstructions}
                      onChange={(e) => setPaymentInstructions(e.target.value)}
                      placeholder="Entrez les instructions de paiement (méthode, numéro, etc.)..."
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Méthode de Paiement
                    </label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile_money">
                          Mobile Money
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          Virement Bancaire
                        </SelectItem>
                        <SelectItem value="cash">Espèces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSendPaymentInstructions}
                      disabled={processing || !paymentInstructions.trim()}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      {processing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      Envoyer Instructions
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={processing || !adminNotes.trim()}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Rejeter
                    </Button>
                    <Button
                      onClick={() => setShowModal(false)}
                      variant="outline"
                      disabled={processing}
                    >
                      Annuler
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.status === "payment_confirmed" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Notes Admin *
                    </label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ajoutez vos notes pour cette demande..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleApprove}
                      disabled={processing || !adminNotes.trim()}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      {processing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approuver
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={processing || !adminNotes.trim()}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Rejeter
                    </Button>
                    <Button
                      onClick={() => setShowModal(false)}
                      variant="outline"
                      disabled={processing}
                    >
                      Annuler
                    </Button>
                  </div>
                </>
              )}

              {(selectedRequest.status === "approved" ||
                selectedRequest.status === "rejected" ||
                selectedRequest.status === "expired") && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Modal */}
      {showQuickModal && quickRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {quickAction === "approve"
                  ? "Approve Request"
                  : quickAction === "confirm_payment"
                  ? "Confirm Payment"
                  : "Reject Request"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickModal(false)}
                disabled={processing}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Escort: {quickRequest.escortName}
                </div>
                <div className="text-sm text-gray-600">
                  {quickRequest.currentPlan} → {quickRequest.requestedPlan}
                </div>
                <div className="text-sm text-gray-600">
                  Amount: ${quickRequest.paymentAmount}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Admin Notes *
                </label>
                <Textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder={
                    quickAction === "approve"
                      ? "Add notes for approval..."
                      : quickAction === "confirm_payment"
                      ? "Add notes for payment confirmation..."
                      : "Add notes for rejection..."
                  }
                  rows={3}
                  disabled={processing}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleQuickActionSubmit}
                  disabled={processing || !quickNotes.trim()}
                  className={
                    quickAction === "approve"
                      ? "flex-1 bg-green-500 hover:bg-green-600"
                      : quickAction === "confirm_payment"
                      ? "flex-1 bg-blue-500 hover:bg-blue-600"
                      : "flex-1 bg-red-500 hover:bg-red-600"
                  }
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : quickAction === "approve" ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : quickAction === "confirm_payment" ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  {quickAction === "approve"
                    ? "Approve"
                    : quickAction === "confirm_payment"
                    ? "Confirm Payment"
                    : "Reject"}
                </Button>
                <Button
                  onClick={() => setShowQuickModal(false)}
                  variant="outline"
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpgradeRequests;
