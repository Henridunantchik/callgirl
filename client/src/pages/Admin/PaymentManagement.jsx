import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
  Calendar,
  Users,
  Wallet,
  Eye
} from 'lucide-react';

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const transactions = [
    {
      id: 1,
      type: 'booking',
      amount: 250.00,
      currency: 'USD',
      status: 'completed',
      user: 'client123',
      escort: 'sarah@example.com',
      date: '2024-03-15',
      commission: 25.00,
      paymentMethod: 'credit_card'
    },
    {
      id: 2,
      type: 'subscription',
      amount: 99.99,
      currency: 'USD',
      status: 'pending',
      user: 'escort456',
      escort: null,
      date: '2024-03-14',
      commission: 0,
      paymentMethod: 'paypal'
    },
    {
      id: 3,
      type: 'featured_listing',
      amount: 49.99,
      currency: 'USD',
      status: 'failed',
      user: 'escort789',
      escort: null,
      date: '2024-03-13',
      commission: 0,
      paymentMethod: 'stripe'
    }
  ];

  const payouts = [
    {
      id: 1,
      escort: 'sarah@example.com',
      amount: 225.00,
      status: 'pending',
      requestDate: '2024-03-15',
      method: 'bank_transfer',
      account: '****1234'
    },
    {
      id: 2,
      escort: 'emma@example.com',
      amount: 180.50,
      status: 'completed',
      requestDate: '2024-03-14',
      method: 'paypal',
      account: 'emma@paypal.com'
    }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getTypeIcon = (type) => {
    const icons = {
      booking: <Calendar className="w-4 h-4" />,
      subscription: <Users className="w-4 h-4" />,
      featured_listing: <TrendingUp className="w-4 h-4" />
    };
    return icons[type] || <DollarSign className="w-4 h-4" />;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.escort?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = transactions.reduce((sum, t) => sum + t.commission, 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <Helmet>
        <title>Payment Management - Call Girls</title>
        <meta name="description" content="Manage payments, transactions, and financial reports." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
          <p className="text-gray-600">Manage payments, transactions, commissions, and financial reports</p>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">${totalCommission.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Platform Commission</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Wallet className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">${pendingPayouts.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Pending Payouts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CreditCard className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{transactions.length}</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transaction History</CardTitle>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced Filters
                  </Button>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Transaction</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Commission</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <div className="font-semibold">#{transaction.id}</div>
                              <div className="text-sm text-gray-600">
                                {transaction.user} → {transaction.escort || 'Platform'}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(transaction.type)}
                              <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold">${transaction.amount}</div>
                            <div className="text-sm text-gray-600">{transaction.currency}</div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold">${transaction.commission}</div>
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Escort Payouts</CardTitle>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Payouts
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{payout.escort}</h3>
                            <p className="text-sm text-gray-600">
                              {payout.method} • {payout.account}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">${payout.amount}</div>
                          {getStatusBadge(payout.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          {payout.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="text-green-600">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Revenue chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Payment methods chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Commission Rates</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Booking Commission</span>
                          <span className="text-sm text-gray-600">10%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Subscription Commission</span>
                          <span className="text-sm text-gray-600">5%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Featured Listing</span>
                          <span className="text-sm text-gray-600">0%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Payout Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Minimum Payout</span>
                          <span className="text-sm text-gray-600">$50</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Payout Schedule</span>
                          <span className="text-sm text-gray-600">Weekly</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Processing Time</span>
                          <span className="text-sm text-gray-600">2-3 days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Configure Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PaymentManagement; 