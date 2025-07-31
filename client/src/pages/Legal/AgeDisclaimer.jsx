import React from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AlertTriangle, Shield, Users, Heart, Info } from "lucide-react";

const AgeDisclaimer = () => {
  return (
    <>
      <Helmet>
        <title>Age Disclaimer - Call Girls</title>
        <meta
          name="description"
          content="Important information about age requirements and legal compliance."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Age Disclaimer
          </h1>
          <p className="text-gray-600">
            Important legal information for all users
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">
                Critical Legal Notice
              </h4>
              <p className="text-red-800">
                This website contains adult content and is intended for
                individuals 18 years of age or older. By accessing this site,
                you confirm that you meet the minimum age requirement and are
                legally able to view adult content in your jurisdiction.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Age Verification Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Minimum Age Requirement</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>
                  You must be at least 18 years old to access this platform
                </li>
                <li>Some jurisdictions may require users to be 21 or older</li>
                <li>
                  False age claims are illegal and will result in immediate
                  account termination
                </li>
                <li>
                  We reserve the right to request identity verification at any
                  time
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Verification Process</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Initial age confirmation is required upon first visit</li>
                <li>Escorts may be required to provide government-issued ID</li>
                <li>
                  Additional verification may be requested for premium features
                </li>
                <li>All verification data is encrypted and securely stored</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Legal Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">
                Jurisdictional Requirements
              </h3>
              <p className="text-gray-700 mb-4">
                Users are responsible for ensuring compliance with all
                applicable local, state, and federal laws regarding adult
                content, adult services, and age restrictions. Laws vary
                significantly by location.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Prohibited Access</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>
                  Accessing from jurisdictions where adult content is illegal
                </li>
                <li>Using VPNs or proxies to circumvent age restrictions</li>
                <li>Sharing access with minors</li>
                <li>Attempting to bypass verification systems</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Reporting Requirements</h3>
              <p className="text-gray-700">
                We are legally required to report any suspected underage
                activity to appropriate authorities. This includes attempts to
                access the platform by minors or solicit services from minors.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Safety and Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Protecting Minors</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>We actively work to prevent underage access</li>
                <li>All content is reviewed for age-appropriate compliance</li>
                <li>
                  We cooperate with law enforcement on underage protection
                </li>
                <li>Parents and guardians can contact us for assistance</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Content Guidelines</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>No content featuring or targeting minors</li>
                <li>All models must be verified as 18 or older</li>
                <li>Explicit content is clearly labeled and restricted</li>
                <li>Regular audits ensure compliance with age requirements</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Parental Controls</h3>
              <p className="text-gray-700 mb-4">
                We recommend that parents and guardians use appropriate
                filtering software and parental controls to prevent underage
                access to adult content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Educational Resources</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Information about online safety for minors</li>
                <li>Resources for parents and educators</li>
                <li>Guidance on age-appropriate internet use</li>
                <li>Contact information for support organizations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Reporting Underage Activity
              </h3>
              <p className="text-gray-700">
                If you encounter underage activity or have concerns about age
                verification, please contact us immediately at
                safety@callgirls.com. All reports are taken seriously and
                investigated promptly.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              For questions about age requirements or to report concerns:
            </p>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Safety Concerns:</strong> safety@callgirls.com
              </p>
              <p>
                <strong>Legal Questions:</strong> legal@callgirls.com
              </p>
              <p>
                <strong>Parental Inquiries:</strong> parents@callgirls.com
              </p>
              <p>
                <strong>Emergency:</strong> [Emergency Contact Number]
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This disclaimer is effective as of {new Date().toLocaleDateString()}
            . We are committed to protecting minors and ensuring legal
            compliance in all jurisdictions.
          </p>
        </div>
      </div>
    </>
  );
};

export default AgeDisclaimer;
