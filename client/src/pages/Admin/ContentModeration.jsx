import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Flag, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Ban,
  MessageCircle,
  Image,
  User,
  Clock,
  Filter
} from 'lucide-react';

const ContentModeration = () => {
  const [activeTab, setActiveTab] = useState('reports');

  const reports = [
    {
      id: 1,
      type: 'inappropriate_content',
      title: 'Inappropriate Profile Photos',
      user: 'sarah@example.com',
      reportedBy: 'client123',
      status: 'pending',
      priority: 'high',
      date: '2 hours ago',
      description: 'Profile contains explicit content that violates community guidelines'
    },
    {
      id: 2,
      type: 'fake_profile',
      title: 'Suspected Fake Profile',
      user: 'mike@example.com',
      reportedBy: 'escort456',
      status: 'investigating',
      priority: 'medium',
      date: '4 hours ago',
      description: 'Profile appears to be using stolen photos and fake information'
    },
    {
      id: 3,
      type: 'harassment',
      title: 'Harassment in Messages',
      user: 'john@example.com',
      reportedBy: 'escort789',
      status: 'resolved',
      priority: 'high',
      date: '1 day ago',
      description: 'User sent inappropriate and threatening messages'
    }
  ];

  const flaggedContent = [
    {
      id: 1,
      type: 'profile',
      content: 'Profile description contains inappropriate language',
      user: 'user123',
      flaggedBy: 'automated',
      date: '1 hour ago',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'message',
      content: 'Message contains spam links',
      user: 'user456',
      flaggedBy: 'user789',
      date: '3 hours ago',
      severity: 'low'
    }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return <Badge className={variants[priority]}>{priority}</Badge>;
  };

  const getTypeIcon = (type) => {
    const icons = {
      inappropriate_content: <Image className="w-4 h-4" />,
      fake_profile: <User className="w-4 h-4" />,
      harassment: <MessageCircle className="w-4 h-4" />,
      spam: <Flag className="w-4 h-4" />
    };
    return icons[type] || <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <>
      <Helmet>
        <title>Content Moderation - Call Girls</title>
        <meta name="description" content="Moderate user-generated content and handle reports." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Moderation</h1>
          <p className="text-gray-600">Review and moderate user-generated content, reports, and flagged items</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Flag className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</div>
              <div className="text-sm text-gray-600">Pending Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{reports.filter(r => r.status === 'investigating').length}</div>
              <div className="text-sm text-gray-600">Under Investigation</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{reports.filter(r => r.status === 'resolved').length}</div>
              <div className="text-sm text-gray-600">Resolved Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{flaggedContent.length}</div>
              <div className="text-sm text-gray-600">Flagged Content</div>
            </CardContent>
          </Card>
        </div>

        {/* Moderation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
            <TabsTrigger value="automated">Automated Filters</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            {getTypeIcon(report.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{report.title}</h3>
                              {getPriorityBadge(report.priority)}
                              {getStatusBadge(report.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>User: {report.user}</span>
                              <span>Reported by: {report.reportedBy}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {report.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flagged" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flaggedContent.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold capitalize">{item.type}</h3>
                              <Badge className={item.severity === 'high' ? 'bg-red-100 text-red-800' : 
                                               item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                               'bg-green-100 text-green-800'}>
                                {item.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>User: {item.user}</span>
                              <span>Flagged by: {item.flaggedBy}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automated" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Filter Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Content Filters</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Profanity Filter</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Spam Detection</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Image Moderation</span>
                          <Badge className="bg-yellow-100 text-yellow-800">Learning</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Threshold Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Spam Score Threshold</span>
                          <span className="text-sm text-gray-600">0.7</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Content Risk Threshold</span>
                          <span className="text-sm text-gray-600">0.8</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Auto-Ban Threshold</span>
                          <span className="text-sm text-gray-600">0.9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Configure Filters
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

export default ContentModeration; 