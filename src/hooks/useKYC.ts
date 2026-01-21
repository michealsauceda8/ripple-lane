import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type KYCStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

interface KYCVerification {
  id: string;
  user_id: string;
  status: KYCStatus;
  document_type: string | null;
  document_front_url: string | null;
  document_back_url: string | null;
  selfie_url: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export function useKYC() {
  const { user } = useAuth();
  const [kycData, setKycData] = useState<KYCVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKYC = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setKycData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYC();
  }, [user]);

  const isKYCApproved = kycData?.status === 'approved';
  const canTrade = isKYCApproved;

  const submitKYC = async (documentType: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'pending',
          document_type: documentType,
          submitted_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchKYC();
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { kycData, loading, error, isKYCApproved, canTrade, submitKYC, refetch: fetchKYC };
}
