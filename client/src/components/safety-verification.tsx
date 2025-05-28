import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Shield, Phone, User, Users, AlertCircle } from "lucide-react";

interface SafetyVerificationProps {
  user?: {
    phoneVerified?: boolean;
    linkedinVerified?: boolean;
    facebookVerified?: boolean;
    emergencyContactName?: string;
  };
  onVerificationUpdate?: () => void;
}

export function SafetyVerification({ user, onVerificationUpdate }: SafetyVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  
  // Emergency contact states
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContactName || "");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  
  // Reference states
  const [referrerName, setReferrerName] = useState("");
  const [referrerEmail, setReferrerEmail] = useState("");
  const [referenceType, setReferenceType] = useState("");
  const [relationship, setRelationship] = useState("");
  const [referenceComment, setReferenceComment] = useState("");

  const handleSendPhoneVerification = () => {
    if (phoneNumber) {
      setShowCodeInput(true);
      // In a real implementation, this would send an SMS
      console.log("Sending verification code to:", phoneNumber);
    }
  };

  const handleVerifyPhone = () => {
    if (verificationCode) {
      // In a real implementation, this would verify the code
      console.log("Verifying code:", verificationCode);
      onVerificationUpdate?.();
    }
  };

  const handleSocialVerification = (platform: 'linkedin' | 'facebook') => {
    const url = platform === 'linkedin' ? linkedinUrl : facebookUrl;
    if (url) {
      // In a real implementation, this would verify the social media profile
      console.log(`Verifying ${platform} profile:`, url);
      onVerificationUpdate?.();
    }
  };

  const handleSaveEmergencyContact = () => {
    if (emergencyName && emergencyPhone && emergencyRelation) {
      // In a real implementation, this would save the emergency contact
      console.log("Saving emergency contact:", { emergencyName, emergencyPhone, emergencyRelation });
      onVerificationUpdate?.();
    }
  };

  const handleSubmitReference = () => {
    if (referrerName && referrerEmail && referenceType && relationship && referenceComment) {
      // In a real implementation, this would submit the reference request
      console.log("Submitting reference:", { referrerName, referrerEmail, referenceType, relationship, referenceComment });
      onVerificationUpdate?.();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="mx-auto h-12 w-12 text-blue-600 mb-2" />
        <h2 className="text-2xl font-bold text-gray-900">Safety Verification</h2>
        <p className="text-gray-600">Build trust with fellow travelers through verified credentials</p>
      </div>

      {/* Phone Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Number Verification
            {user?.phoneVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
          </CardTitle>
          <CardDescription>
            Verify your phone number to show you're a real person
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user?.phoneVerified ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              
              {!showCodeInput ? (
                <Button onClick={handleSendPhoneVerification} className="w-full">
                  Send Verification Code
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                  <Button onClick={handleVerifyPhone} className="w-full">
                    Verify Phone Number
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Phone number verified</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Social Media Verification
            {(user?.linkedinVerified || user?.facebookVerified) && 
              <CheckCircle className="h-5 w-5 text-green-600" />}
          </CardTitle>
          <CardDescription>
            Link your social profiles to show your digital presence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
            <div className="flex gap-2">
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
              <Button 
                onClick={() => handleSocialVerification('linkedin')}
                variant="outline"
                disabled={user?.linkedinVerified}
              >
                {user?.linkedinVerified ? "Verified" : "Verify"}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook Profile URL</Label>
            <div className="flex gap-2">
              <Input
                id="facebook"
                placeholder="https://facebook.com/yourprofile"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
              />
              <Button 
                onClick={() => handleSocialVerification('facebook')}
                variant="outline"
                disabled={user?.facebookVerified}
              >
                {user?.facebookVerified ? "Verified" : "Verify"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Emergency Contact
            {user?.emergencyContactName && <CheckCircle className="h-5 w-5 text-green-600" />}
          </CardTitle>
          <CardDescription>
            Provide emergency contact information for peace of mind
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergency-name">Contact Name</Label>
            <Input
              id="emergency-name"
              placeholder="John Doe"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergency-phone">Contact Phone</Label>
            <Input
              id="emergency-phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergency-relation">Relationship</Label>
            <Select value={emergencyRelation} onValueChange={setEmergencyRelation}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="spouse">Spouse/Partner</SelectItem>
                <SelectItem value="friend">Close Friend</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleSaveEmergencyContact} className="w-full">
            Save Emergency Contact
          </Button>
        </CardContent>
      </Card>

      {/* Reference System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Travel References
          </CardTitle>
          <CardDescription>
            Request references from people who can vouch for your travel character
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referrer-name">Reference Name</Label>
            <Input
              id="referrer-name"
              placeholder="Jane Smith"
              value={referrerName}
              onChange={(e) => setReferrerName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="referrer-email">Reference Email</Label>
            <Input
              id="referrer-email"
              type="email"
              placeholder="jane@example.com"
              value={referrerEmail}
              onChange={(e) => setReferrerEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reference-type">Reference Type</Label>
            <Select value={referenceType} onValueChange={setReferenceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select reference type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travel_buddy">Travel Buddy</SelectItem>
                <SelectItem value="hotel_staff">Hotel Staff</SelectItem>
                <SelectItem value="host">Host/Accommodation Owner</SelectItem>
                <SelectItem value="roommate">Previous Roommate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="relationship">How do you know them?</Label>
            <Input
              id="relationship"
              placeholder="Traveled together to Paris in 2023"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reference-comment">Additional Context</Label>
            <Textarea
              id="reference-comment"
              placeholder="Tell us more about your relationship and why they would be a good reference..."
              value={referenceComment}
              onChange={(e) => setReferenceComment(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button onClick={handleSubmitReference} className="w-full">
            Request Reference
          </Button>
        </CardContent>
      </Card>

      {/* Verification Badge Summary */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>Your Safety Score</CardTitle>
          <CardDescription>
            Complete verifications to build trust with potential roommates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant={user?.phoneVerified ? "default" : "secondary"}>
              {user?.phoneVerified ? "✓" : "○"} Phone Verified
            </Badge>
            <Badge variant={user?.linkedinVerified ? "default" : "secondary"}>
              {user?.linkedinVerified ? "✓" : "○"} LinkedIn Verified
            </Badge>
            <Badge variant={user?.facebookVerified ? "default" : "secondary"}>
              {user?.facebookVerified ? "✓" : "○"} Facebook Verified
            </Badge>
            <Badge variant={user?.emergencyContactName ? "default" : "secondary"}>
              {user?.emergencyContactName ? "✓" : "○"} Emergency Contact
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}