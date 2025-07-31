import React from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AlertTriangle, Shield, Users, FileText, Scale } from "lucide-react";

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Call Girls</title>
        <meta
          name="description"
          content="Our terms of service outline the rules and guidelines for using our platform."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">
                Important Notice
              </h4>
              <p className="text-sm text-yellow-800">
                By using our platform, you agree to these terms. Please read
                them carefully before proceeding.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              By accessing and using Call Girls (the "Platform"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by the above, please do not use this
              service.
            </p>

            <div>
              <h3 className="font-semibold mb-2">Eligibility Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>You must be at least 18 years old to use this platform</li>
                <li>
                  You must have the legal capacity to enter into agreements
                </li>
                <li>
                  You must comply with all applicable laws and regulations
                </li>
                <li>You must provide accurate and truthful information</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Prohibited Activities</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Posting false or misleading information</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Sharing explicit content without consent</li>
                <li>Attempting to circumvent age verification</li>
                <li>Using the platform for illegal activities</li>
                <li>Impersonating others or creating fake profiles</li>
                <li>Spamming or sending unsolicited messages</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Content Guidelines</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>All content must be legal and appropriate</li>
                <li>Respect intellectual property rights</li>
                <li>Do not post copyrighted material without permission</li>
                <li>Maintain professional and respectful communication</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Legal Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Local Laws</h3>
              <p className="text-gray-700 mb-4">
                Users are responsible for complying with all applicable local,
                state, and federal laws regarding adult services, prostitution,
                and related activities. Our platform does not facilitate illegal
                activities.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Age Verification</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>All users must verify they are 18 or older</li>
                <li>
                  Escorts may be required to provide additional verification
                </li>
                <li>We reserve the right to request identity documents</li>
                <li>
                  False age claims will result in immediate account termination
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Safety and Discretion</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Meet in public places initially</li>
                <li>Use protection and practice safe sex</li>
                <li>Trust your instincts and report suspicious activity</li>
                <li>Respect privacy and maintain discretion</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Platform Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Service Description</h3>
              <p className="text-gray-700 mb-4">
                Our platform provides a directory service for adult
                entertainment professionals and clients. We facilitate
                connections but do not provide or arrange adult services
                directly.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Payment and Fees</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Premium features require payment</li>
                <li>All fees are non-refundable unless otherwise stated</li>
                <li>Prices may change with notice</li>
                <li>Payment processing is handled by third-party providers</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Account Management</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>You are responsible for maintaining account security</li>
                <li>Do not share your login credentials</li>
                <li>Report suspicious activity immediately</li>
                <li>We may suspend or terminate accounts for violations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Disclaimers and Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Service Availability</h3>
              <p className="text-gray-700">
                We strive to maintain platform availability but do not guarantee
                uninterrupted service. We may perform maintenance or updates
                that temporarily affect availability.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">User Interactions</h3>
              <p className="text-gray-700">
                We are not responsible for the conduct of users or the quality
                of services provided. Users interact at their own risk and
                should exercise appropriate caution.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Limitation of Liability</h3>
              <p className="text-gray-700">
                Our liability is limited to the amount paid for our services. We
                are not liable for indirect, incidental, or consequential
                damages.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Termination</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>We may terminate accounts for terms violations</li>
                  <li>Users may close their accounts at any time</li>
                  <li>Termination does not affect accrued obligations</li>
                  <li>Some data may be retained for legal compliance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Effect of Termination</h3>
                <p className="text-gray-700">
                  Upon termination, your right to use the platform ceases
                  immediately. We may delete your account and associated data,
                  subject to legal requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Changes
              will be effective immediately upon posting. Continued use of the
              platform constitutes acceptance of modified terms. We will notify
              users of material changes via email or platform notification.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms of Service, please contact
              us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Email:</strong> legal@callgirls.com
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
            These terms are effective as of {new Date().toLocaleDateString()}.
            By using our platform, you acknowledge that you have read,
            understood, and agree to be bound by these terms.
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
