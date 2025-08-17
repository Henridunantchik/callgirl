import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
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
  AlertCircle
} from "lucide-react";
import { upgradeAPI } from "../../services/api";
import { showToast } from "../../helpers/showToast";
import Loading from "../../components/Loading";

const UpgradeRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalRevenue: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

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
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getContactMethodIcon = (method) => {
    return method === "whatsapp" ? <Phone className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />;
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.escortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.escortEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.escortPhone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesCountry = countryFilter === "all" || request.countryCode === countryFilter;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  if (loading) return <Loading />;

  return (
    <>
      <Helmet>
        <title>Gestion des Demandes d'Upgrade - Admin</title>
        <meta name="description" content="Gérer les demandes d'upgrade des escorts" />
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
                      <SelectItem value="approved">Approuvées</SelectItem>
                      <SelectItem value="rejected">Rejetées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Pays
                  </label>
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
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
            <CardTitle>Demandes d'Upgrade ({filteredRequests.length})</CardTitle>
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {request.escortName?.charAt(0).toUpperCase() || "E"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.escortName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.escortEmail} • {request.escortPhone}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {request.currentPlan} → {request.requestedPlan}
                          </span>
                          <span className="text-xs text-gray-500">
                            ${request.paymentAmount}
                          </span>
                          {getContactMethodIcon(request.contactMethod)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          ${request.paymentAmount}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        {request.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                        )}
                      </div>
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
                  <label className="text-sm font-medium text-gray-700">Nom</label>
                  <p className="text-gray-900">{selectedRequest.escortName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedRequest.escortEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Téléphone</label>
                  <p className="text-gray-900">{selectedRequest.escortPhone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Pays</label>
                  <p className="text-gray-900">{selectedRequest.countryCode?.toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Plan Actuel</label>
                  <p className="text-gray-900">{selectedRequest.currentPlan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Plan Demandé</label>
                  <p className="text-gray-900">{selectedRequest.requestedPlan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Montant</label>
                  <p className="text-gray-900">${selectedRequest.paymentAmount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Méthode de Contact</label>
                  <p className="text-gray-900 flex items-center gap-1">
                    {getContactMethodIcon(selectedRequest.contactMethod)}
                    {selectedRequest.contactMethod}
                  </p>
                </div>
              </div>

              {selectedRequest.paymentProof && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Preuve de Paiement</label>
                  <p className="text-gray-900 text-sm">{selectedRequest.paymentProof}</p>
                </div>
              )}

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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpgradeRequests;
