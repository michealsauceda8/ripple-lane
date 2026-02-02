import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function KYCDebugPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch all KYC records
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        toast.error(`Error: ${error.message}`);
        console.error(error);
      } else {
        setRecords(data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">KYC Debug Page</h1>

      {/* Current User Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current User</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> <code className="bg-gray-100 p-2 rounded">{currentUser.id}</code></p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <button
                onClick={() => copyToClipboard(currentUser.id)}
                className="text-blue-600 hover:underline flex items-center gap-2"
              >
                <Copy className="h-4 w-4" /> Copy User ID
              </button>
            </div>
          ) : (
            <p className="text-red-600">Not logged in</p>
          )}
        </CardContent>
      </Card>

      {/* KYC Records */}
      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>KYC Records ({records.length})</CardTitle>
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">No KYC records found</p>
                <p className="text-sm text-yellow-800">
                  Submit a KYC form first at /dashboard/kyc
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">User ID</p>
                      <p className="font-mono text-sm">{record.user_id}</p>
                      <button
                        onClick={() => copyToClipboard(record.user_id)}
                        className="text-blue-600 hover:underline text-xs flex items-center gap-1 mt-1"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Status</p>
                      <p className={`font-semibold text-sm ${
                        record.status === 'approved' ? 'text-green-600' :
                        record.status === 'rejected' ? 'text-red-600' :
                        record.status === 'pending' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {record.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p>{record.first_name} {record.last_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p>{record.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p>{new Date(record.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p>{record.submitted_at ? new Date(record.submitted_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>

                  {/* Approval Link */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                    <p className="text-xs font-semibold text-blue-900 mb-2">Approval Link:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`http://localhost:5173/kyc-approval/${record.user_id}`}
                        readOnly
                        className="flex-1 text-xs bg-white border rounded p-2 font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(`http://localhost:5173/kyc-approval/${record.user_id}`)}
                        className="bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <a href={`/kyc-approval/${record.user_id}`} target="_blank" rel="noopener noreferrer">
                      Visit Approval Page →
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>1. Submit KYC:</strong> Go to <code className="bg-gray-100 px-2 py-1 rounded">/dashboard/kyc</code> and complete the form
          </p>
          <p>
            <strong>2. Check Records:</strong> Refresh this page to see the new KYC record
          </p>
          <p>
            <strong>3. Copy User ID:</strong> Click "Copy User ID" next to any record
          </p>
          <p>
            <strong>4. Visit Approval Page:</strong> Click "Visit Approval Page" or copy the URL and visit it
          </p>
          <p>
            <strong>5. Debug:</strong> If you get "KYC record not found", check the User ID matches here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
