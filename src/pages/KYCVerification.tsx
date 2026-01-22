import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useKYC } from '@/hooks/useKYC';
import { PersonalInfoForm, PersonalInfoData } from '@/components/kyc/PersonalInfoForm';
import { AddressForm, AddressData } from '@/components/kyc/AddressForm';
import { DocumentUpload } from '@/components/kyc/DocumentUpload';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  CreditCard,
  Car,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const documentTypes = [
  { id: 'passport', label: 'Passport', icon: FileText, description: 'International passport' },
  { id: 'drivers_license', label: "Driver's License", icon: Car, description: 'Valid driver license' },
  { id: 'national_id', label: 'National ID', icon: CreditCard, description: 'Government-issued ID' },
];

export default function KYCVerification() {
  const { kycData, loading, refetch } = useKYC();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData | null>(null);
  const [addressInfo, setAddressInfo] = useState<AddressData | null>(null);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePersonalInfoSubmit = (data: PersonalInfoData) => {
    setPersonalInfo(data);
    setStep(2);
  };

  const handleAddressSubmit = (data: AddressData) => {
    setAddressInfo(data);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!user || !personalInfo || !addressInfo || !selectedDocument || !frontUrl || !backUrl || !selfieUrl) {
      toast.error('Please complete all steps');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          first_name: personalInfo.firstName,
          last_name: personalInfo.lastName,
          date_of_birth: personalInfo.dateOfBirth,
          ssn_encrypted: personalInfo.ssn,
          phone_number: personalInfo.phoneNumber,
          address_line1: addressInfo.addressLine1,
          address_line2: addressInfo.addressLine2 || null,
          city: addressInfo.city,
          state: addressInfo.state,
          postal_code: addressInfo.postalCode,
          country: addressInfo.country,
          document_type: selectedDocument,
          document_front_url: frontUrl,
          document_back_url: backUrl,
          selfie_url: selfieUrl,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetch();
      setStep(7);
      toast.success('KYC submitted successfully!');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusView = () => {
    const status = kycData?.status;

    if (status === 'approved') {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <div className="inline-flex p-6 rounded-full bg-green-500/10 mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Identity Verified</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your identity has been successfully verified. You now have full access to all trading features.
          </p>
        </motion.div>
      );
    }

    if (status === 'pending') {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <div className="inline-flex p-6 rounded-full bg-blue-500/10 mb-6">
            <Clock className="w-16 h-16 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Verification In Progress</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We're reviewing your documents. This usually takes 1-2 business days.
          </p>
        </motion.div>
      );
    }

    if (status === 'rejected') {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <div className="inline-flex p-6 rounded-full bg-red-500/10 mb-6">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Verification Failed</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {kycData?.rejection_reason || 'Please try again with valid documents.'}
          </p>
          <Button onClick={() => setStep(1)} className="bg-primary hover:bg-primary/90">Try Again</Button>
        </motion.div>
      );
    }

    return renderVerificationFlow();
  };

  const renderVerificationFlow = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map((s, idx) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0 ${s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {s < step ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {idx < 5 && <div className={`w-8 md:w-12 h-1 mx-1 rounded transition-all ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <PersonalInfoForm key="step1" onSubmit={handlePersonalInfoSubmit} initialData={personalInfo || undefined} />
        )}

        {step === 2 && (
          <AddressForm key="step2" onSubmit={handleAddressSubmit} onBack={() => setStep(1)} initialData={addressInfo || undefined} />
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-foreground mb-2">Select Document Type</h2>
            <p className="text-muted-foreground mb-8">Choose the type of ID you'll use for verification.</p>
            <div className="space-y-4">
              {documentTypes.map((doc) => {
                const Icon = doc.icon;
                return (
                  <button key={doc.id} onClick={() => { setSelectedDocument(doc.id); setStep(4); }}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 hover:border-primary/50 hover:bg-primary/5 ${selectedDocument === doc.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <div className="p-3 rounded-lg bg-primary/10"><Icon className="w-6 h-6 text-primary" /></div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-foreground">{doc.label}</div>
                      <div className="text-sm text-muted-foreground">{doc.description}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
            <Button variant="outline" onClick={() => setStep(2)} className="w-full mt-8">Back</Button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-foreground mb-2">Upload Document Front</h2>
            <p className="text-muted-foreground mb-6">Upload the front of your {selectedDocument?.replace('_', ' ')}.</p>
            <DocumentUpload label="Front of Document" onUpload={(url) => { setFrontUrl(url); setStep(5); }} uploadedUrl={frontUrl} />
            <Button variant="outline" onClick={() => setStep(3)} className="w-full mt-4">Back</Button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-foreground mb-2">Upload Document Back</h2>
            <p className="text-muted-foreground mb-6">Upload the back of your document.</p>
            <DocumentUpload label="Back of Document" onUpload={(url) => { setBackUrl(url); setStep(6); }} uploadedUrl={backUrl} />
            <Button variant="outline" onClick={() => setStep(4)} className="w-full mt-4">Back</Button>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-foreground mb-2">Take a Selfie</h2>
            <p className="text-muted-foreground mb-6">Take a clear selfie holding your document.</p>
            <DocumentUpload label="Selfie" onUpload={setSelfieUrl} uploadedUrl={selfieUrl} isSelfie />
            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setStep(5)} className="flex-1">Back</Button>
              <Button onClick={handleSubmit} disabled={!selfieUrl || submitting} className="flex-1 bg-primary hover:bg-primary/90">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit for Review'}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="inline-flex p-6 rounded-full bg-green-500/10 mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Documents Submitted!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">We'll review them and notify you within 1-2 business days.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">KYC Verification</h1>
        </div>
        <p className="text-muted-foreground">Complete identity verification to unlock all trading features.</p>
      </div>
      <div className="bg-card rounded-2xl border border-border p-8">
        {kycData?.status !== 'not_started' ? renderStatusView() : renderVerificationFlow()}
      </div>
    </DashboardLayout>
  );
}
