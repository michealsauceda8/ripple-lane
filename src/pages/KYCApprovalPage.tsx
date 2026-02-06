import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, Download, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface KYCData {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  status: string;
  document_type?: string;
  document_front_url?: string;
  document_back_url?: string;
  selfie_url?: string;
  created_at?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  submitted_at?: string;
}

export default function KYCApprovalPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [documentUrls, setDocumentUrls] = useState<{name: string; url: string}[]>([]);

  useEffect(() => {
    const fetchKYCData = async () => {
      if (!userId) {
        toast.error('User ID not provided');
        navigate('/');
        return;
      }

      try {
        // Fetch KYC verification data
        const { data: kycRecord, error: kycError } = await supabase
          .from('kyc_verifications')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (kycError) {
          console.error('KYC Fetch Error:', kycError);
          toast.error(`KYC record not found. Please check the link.`);
          navigate('/');
          return;
        }

        if (!kycRecord) {
          toast.error('KYC record not found');
          navigate('/');
          return;
        }

        setKycData(kycRecord);

        // Generate signed URLs for documents stored in the KYC record
        const docs: {name: string; url: string}[] = [];
        
        if (kycRecord.document_front_url) {
          const { data: frontUrl } = await supabase.storage
            .from('kyc-documents')
            .createSignedUrl(kycRecord.document_front_url, 3600);
          if (frontUrl?.signedUrl) {
            docs.push({ name: 'Document Front', url: frontUrl.signedUrl });
          }
        }
        
        if (kycRecord.document_back_url) {
          const { data: backUrl } = await supabase.storage
            .from('kyc-documents')
            .createSignedUrl(kycRecord.document_back_url, 3600);
          if (backUrl?.signedUrl) {
            docs.push({ name: 'Document Back', url: backUrl.signedUrl });
          }
        }
        
        if (kycRecord.selfie_url) {
          const { data: selfieUrl } = await supabase.storage
            .from('kyc-documents')
            .createSignedUrl(kycRecord.selfie_url, 3600);
          if (selfieUrl?.signedUrl) {
            docs.push({ name: 'Selfie', url: selfieUrl.signedUrl });
          }
        }
        
        setDocumentUrls(docs);
      } catch (error) {
        console.error('Error fetching KYC data:', error);
        toast.error('Failed to load KYC data');
      } finally {
        setLoading(false);
      }
    };

    fetchKYCData();
  }, [userId, navigate]);

  const handleApprove = async () => {
    if (!userId || !kycData) return;

    setApproving(true);
    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        toast.error(`Failed to approve: ${error.message}`);
        return;
      }

      toast.success('✅ KYC approved successfully!');
      setKycData({ ...kycData, status: 'approved' });

      // Redirect after 2 seconds
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error approving KYC:', error);
      toast.error('Error approving KYC');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!userId || !kycData) return;

    setRejecting(true);
    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'rejected',
          rejection_reason: 'Rejected via approval page',
          reviewed_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        toast.error(`Failed to reject: ${error.message}`);
        return;
      }

      toast.success('❌ KYC rejected');
      setKycData({ ...kycData, status: 'rejected' });

      // Redirect after 2 seconds
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error rejecting KYC:', error);
      toast.error('Error rejecting KYC');
    } finally {
      setRejecting(false);
    }
  };

  const downloadDocument = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Document downloaded');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading KYC details...</p>
        </div>
      </div>
    );
  }

  if (!kycData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">KYC Not Found</h1>
          <p className="text-muted-foreground mt-2">Unable to load KYC verification data</p>
        </div>
      </div>
    );
  }

  const statusColor = {
    approved: 'text-green-600 bg-green-50',
    rejected: 'text-red-600 bg-red-50',
    pending: 'text-yellow-600 bg-yellow-50',
  };

  const statusBgColor = {
    approved: 'bg-green-100 border-green-300',
    rejected: 'bg-red-100 border-red-300',
    pending: 'bg-yellow-100 border-yellow-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">KYC Approval Portal</h1>
          <p className="text-muted-foreground">Review and approve/reject KYC verification</p>
        </div>

        {/* Status Card */}
        <Card className={`mb-6 border-2 ${statusBgColor[kycData.status as keyof typeof statusBgColor]}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {kycData.status === 'approved' && <CheckCircle className="h-6 w-6 text-green-600" />}
              {kycData.status === 'rejected' && <XCircle className="h-6 w-6 text-red-600" />}
              {kycData.status === 'pending' && <AlertCircle className="h-6 w-6 text-yellow-600" />}
              <div>
                <p className={`text-lg font-semibold capitalize ${statusColor[kycData.status as keyof typeof statusColor]}`}>
                  Status: {kycData.status}
                </p>
                {kycData.reviewed_at && (
                  <p className="text-sm text-muted-foreground">
                    Reviewed: {new Date(kycData.reviewed_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">User ID</label>
              <p className="text-foreground font-mono text-sm">{kycData.user_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-foreground">
                {kycData.first_name || kycData.last_name 
                  ? `${kycData.first_name || ''} ${kycData.last_name || ''}`.trim()
                  : 'Not provided'}
              </p>
            </div>
            {kycData.phone_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-foreground">{kycData.phone_number}</p>
              </div>
            )}
            {kycData.date_of_birth && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <p className="text-foreground">{kycData.date_of_birth}</p>
              </div>
            )}
            {kycData.country && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Country</label>
                <p className="text-foreground">{kycData.country}</p>
              </div>
            )}
            {kycData.document_type && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Document Type</label>
                <p className="text-foreground capitalize">{kycData.document_type.replace('_', ' ')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        {(kycData.address_line1 || kycData.city || kycData.state) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Address Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kycData.address_line1 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="text-foreground">{kycData.address_line1}</p>
                  {kycData.address_line2 && <p className="text-foreground">{kycData.address_line2}</p>}
                </div>
              )}
              {kycData.city && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <p className="text-foreground">{kycData.city}</p>
                </div>
              )}
              {kycData.state && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">State</label>
                  <p className="text-foreground">{kycData.state}</p>
                </div>
              )}
              {kycData.postal_code && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Postal Code</label>
                  <p className="text-foreground">{kycData.postal_code}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documents with Images */}
        {documentUrls.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documentUrls.map((doc) => (
                  <div key={doc.name} className="border rounded-lg overflow-hidden bg-muted/50">
                    <div className="aspect-square relative">
                      <img 
                        src={doc.url} 
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <p className="font-medium text-foreground text-sm">{doc.name}</p>
                      <button
                        onClick={() => downloadDocument(doc.url, `${doc.name}.jpg`)}
                        className="flex items-center gap-1 px-2 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-sm transition"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {documentUrls.length === 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No documents uploaded yet.</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {kycData.status === 'pending' && (
          <Card className="border-2 border-border">
            <CardContent className="pt-6">
              <div className="flex gap-4 flex-col sm:flex-row">
                <Button
                  onClick={handleApprove}
                  disabled={approving || rejecting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                >
                  {approving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Approve KYC
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={approving || rejecting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                >
                  {rejecting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      Reject KYC
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {kycData.status !== 'pending' && (
          <Card className="border-2 border-border">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-4">
                This KYC has already been {kycData.status}
              </p>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-muted hover:bg-muted/80 text-foreground py-6 text-lg"
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
