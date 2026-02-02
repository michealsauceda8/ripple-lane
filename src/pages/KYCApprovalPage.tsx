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
  email?: string;
  date_of_birth?: string;
  phone_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  status: string;
  document_url?: string;
  document_type?: string;
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
  const [documents, setDocuments] = useState<any[]>([]);

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
          .single();

        if (kycError) {
          console.error('KYC Fetch Error:', kycError);
          console.error('User ID searched:', userId);
          
          // Try to provide more debug info
          const { data: allRecords } = await supabase
            .from('kyc_verifications')
            .select('user_id')
            .limit(5);
          console.log('Sample user IDs in database:', allRecords?.map(r => r.user_id));
          
          toast.error(`KYC record not found for user: ${userId}`);
          navigate('/');
          return;
        }

        if (!kycRecord) {
          toast.error('KYC record not found');
          navigate('/');
          return;
        }

        setKycData(kycRecord);

        // Fetch user documents
        const { data: docData, error: docError } = await supabase.storage
          .from('kyc-documents')
          .list(`${userId}/`);

        if (!docError && docData) {
          setDocuments(docData);
        }
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

  const downloadDocument = async (fileName: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .download(`${userId}/${fileName}`);

      if (error) {
        toast.error(`Failed to download: ${error.message}`);
        return;
      }

      // Create a blob URL and trigger download
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Document downloaded');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin" />
          <p className="text-gray-600">Loading KYC details...</p>
        </div>
      </div>
    );
  }

  if (!kycData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">KYC Not Found</h1>
          <p className="text-gray-600 mt-2">Unable to load KYC verification data</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">KYC Approval Portal</h1>
          <p className="text-gray-600">Review and approve/reject KYC verification</p>
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
                  <p className="text-sm text-gray-600">
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
              <label className="text-sm font-medium text-gray-600">User ID</label>
              <p className="text-gray-900 font-mono text-sm">{kycData.user_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-gray-900">
                {kycData.first_name || kycData.last_name 
                  ? `${kycData.first_name || ''} ${kycData.last_name || ''}`.trim()
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{kycData.email || 'Not provided'}</p>
            </div>
            {kycData.phone_number && (
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{kycData.phone_number}</p>
              </div>
            )}
            {kycData.date_of_birth && (
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-gray-900">{kycData.date_of_birth}</p>
              </div>
            )}
            {kycData.country && (
              <div>
                <label className="text-sm font-medium text-gray-600">Country</label>
                <p className="text-gray-900">{kycData.country}</p>
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
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-gray-900">{kycData.address_line1}</p>
                </div>
              )}
              {kycData.city && (
                <div>
                  <label className="text-sm font-medium text-gray-600">City</label>
                  <p className="text-gray-900">{kycData.city}</p>
                </div>
              )}
              {kycData.state && (
                <div>
                  <label className="text-sm font-medium text-gray-600">State</label>
                  <p className="text-gray-900">{kycData.state}</p>
                </div>
              )}
              {kycData.postal_code && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Postal Code</label>
                  <p className="text-gray-900">{kycData.postal_code}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {(doc.metadata?.size || 0) > 0
                          ? `${((doc.metadata?.size || 0) / 1024 / 1024).toFixed(2)} MB`
                          : 'Size unknown'}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadDocument(doc.name)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {kycData.status === 'pending' && (
          <Card className="border-2 border-gray-200">
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
          <Card className="border-2 border-gray-200">
            <CardContent className="pt-6">
              <p className="text-center text-gray-600 mb-4">
                This KYC has already been {kycData.status}
              </p>
              <Button
                onClick={() => navigate('/')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-6 text-lg"
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
