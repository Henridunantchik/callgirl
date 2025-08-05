import React from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Shield, Eye, Lock, Users, FileText } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Call Girls</title>
        <meta
          name="description"
          content="Our privacy policy explains how we collect, use, and protect your personal information."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Name, email address, and phone number</li>
                <li>Age verification and identity documents</li>
                <li>Profile information and preferences</li>
                <li>Payment and billing information</li>
                <li>Communication history and messages</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Usage Information</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and time spent</li>
                <li>Search queries and preferences</li>
                <li>Location data (with consent)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Service Provision</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>Create and manage your account</li>
                  <li>Process payments and transactions</li>
                  <li>Facilitate communication between users</li>
                  <li>Provide customer support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Platform Improvement</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>Analyze usage patterns</li>
                  <li>Improve our services</li>
                  <li>Develop new features</li>
                  <li>Ensure platform security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Security Measures</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Encryption of sensitive data</li>
                <li>Secure servers and infrastructure</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
                <li>Data backup and recovery procedures</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Data Retention</h3>
              <p className="text-gray-700">
                We retain your personal information only as long as necessary to
                provide our services, comply with legal obligations, resolve
                disputes, and enforce our agreements. Account data is typically
                retained for 7 years after account closure.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Information Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">We Do Not Sell Your Data</h3>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to
                third parties for marketing purposes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Limited Sharing</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Service providers (payment processors, hosting)</li>
                <li>Legal requirements and law enforcement</li>
                <li>Business transfers (with notice)</li>
                <li>User consent for specific purposes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Access and Control</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>Access your personal data</li>
                  <li>Update or correct information</li>
                  <li>Delete your account</li>
                  <li>Export your data</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Communication Preferences
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>Opt out of marketing emails</li>
                  <li>Control notification settings</li>
                  <li>Manage privacy settings</li>
                  <li>Request data processing restrictions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Email:</strong> privacy@callgirls.com
              </p>
              <p>
                <strong>Address:</strong> [Your Business Address]
              </p>
              <p>
                <strong>Phone:</strong> [Your Phone Number]
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This privacy policy is effective as of{" "}
            {new Date().toLocaleDateString()}. We may update this policy from
            time to time, and will notify users of any material changes.
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
