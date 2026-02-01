import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type KYCStatus = 'not_started' | 'pending' | 'approved' | 'rejected';

interface KYCVerification {
  id: string;
  user_id: string;
  status: KYCStatus;
  kyc_step: number;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  phone_number: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  ssn_encrypted: string | null;
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
      setKycData(data as KYCVerification);
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

  const updateKYCStep = async (step: number, data?: Partial<KYCVerification>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const updateData: Record<string, any> = { kyc_step: step };
      
      if (data) {
        Object.assign(updateData, data);
      }

      const { error } = await supabase
        .from('kyc_verifications')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchKYC();
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const savePersonalInfo = async (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
  }) => {
    return updateKYCStep(2, {
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth,
      phone_number: data.phoneNumber,
    });
  };

  const saveAddressInfo = async (data: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    ssn?: string;
  }) => {
    return updateKYCStep(3, {
      address_line1: data.addressLine1,
      address_line2: data.addressLine2 || null,
      city: data.city,
      state: data.state,
      postal_code: data.postalCode,
      country: data.country,
      ssn_encrypted: data.ssn || null,
    });
  };

  const saveDocumentType = async (documentType: string) => {
    return updateKYCStep(4, { document_type: documentType });
  };

  const saveDocumentFront = async (url: string) => {
    return updateKYCStep(5, { document_front_url: url });
  };

  const saveDocumentBack = async (url: string) => {
    return updateKYCStep(6, { document_back_url: url });
  };

  const submitKYC = async (selfieUrl: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          selfie_url: selfieUrl,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          kyc_step: 7,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchKYC();
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { 
    kycData, 
    loading, 
    error, 
    isKYCApproved, 
    canTrade, 
    submitKYC, 
    refetch: fetchKYC,
    updateKYCStep,
    savePersonalInfo,
    saveAddressInfo,
    saveDocumentType,
    saveDocumentFront,
    saveDocumentBack,
  };
}
