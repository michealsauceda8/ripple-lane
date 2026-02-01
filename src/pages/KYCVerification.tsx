import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';

const documentTypes = [
  { id: 'passport', label: 'Passport', icon: FileText, description: 'International passport' },
  { id: 'drivers_license', label: "Driver's License", icon: Car, description: 'Valid driver license' },
  { id: 'national_id', label: 'National ID', icon: CreditCard, description: 'Government-issued ID' },
];

export default function KYCVerification() {
  const { 
    kycData, 
    loading, 
    refetch, 
    submitKYC,
    savePersonalInfo,
    saveAddressInfo,
    saveDocumentType,
    saveDocumentFront,
    saveDocumentBack,
  } = useKYC();
  
  const [step, setStep] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData | null>(null);
  const [addressInfo, setAddressInfo] = useState<AddressData | null>(null);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Restore progress from database
  useEffect(() => {
    if (kycData && kycData.status === 'not_started') {
      // Restore step
      const savedStep = kycData.kyc_step || 1;
      setStep(savedStep);

      // Restore personal info
      if (kycData.first_name || kycData.last_name) {
        setPersonalInfo({
          firstName: kycData.first_name || '',
          lastName: kycData.last_name || '',
          dateOfBirth: kycData.date_of_birth || '',
          phoneNumber: kycData.phone_number || '',
        });
      }

      // Restore address info
      if (kycData.address_line1) {
        setAddressInfo({
          addressLine1: kycData.address_line1 || '',
          addressLine2: kycData.address_line2 || '',
          city: kycData.city || '',
          state: kycData.state || '',
          postalCode: kycData.postal_code || '',
          country: kycData.country || 'US',
          ssn: kycData.ssn_encrypted || '',
        });
      }

      // Restore document type
      if (kycData.document_type) {
        setSelectedDocument(kycData.document_type);
      }

      // Restore document URLs
      if (kycData.document_front_url) {
        setFrontUrl(kycData.document_front_url);
      }
      if (kycData.document_back_url) {
        setBackUrl(kycData.document_back_url);
      }
      if (kycData.selfie_url) {
        setSelfieUrl(kycData.selfie_url);
      }
    }
  }, [kycData]);

  const handlePersonalInfoSubmit = async (data: PersonalInfoData) => {
    setPersonalInfo(data);
    await savePersonalInfo(data);
    setStep(2);
  };

  const handleAddressSubmit = async (data: AddressData) => {
    setAddressInfo(data);
    await saveAddressInfo(data);
    setStep(3);
  };

  const handleDocumentTypeSelect = async (docType: string) => {
    setSelectedDocument(docType);
    await saveDocumentType(docType);
    setStep(4);
  };

  const handleFrontUpload = async (url: string) => {
    setFrontUrl(url);
    await saveDocumentFront(url);
    setStep(5);
  };

  const handleBackUpload = async (url: string) => {
    setBackUrl(url);
    await saveDocumentBack(url);
    setStep(6);
  };

  const handleSubmit = async () => {
    if (!selfieUrl) {
      toast.error('Please take a selfie');
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitKYC(selfieUrl);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        await refetch();
        setStep(7);
        toast.success('KYC submitted successfully!');
      }
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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 md:py-12">
          <div className="inline-flex p-4 md:p-6 rounded-full bg-green-500/10 mb-4 md:mb-6">
            <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Identity Verified</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto px-4">
            Your identity has been successfully verified. You now have full access to all trading features.
          </p>
        </motion.div>
      );
    }

    if (status === 'pending') {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 md:py-12">
          <div className="inline-flex p-4 md:p-6 rounded-full bg-blue-500/10 mb-4 md:mb-6">
            <Clock className="w-12 h-12 md:w-16 md:h-16 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Verification In Progress</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-6 px-4">
            We're reviewing your documents. This usually takes 1-2 business days.
          </p>
        </motion.div>
      );
    }

    if (status === 'rejected') {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 md:py-12">
          <div className="inline-flex p-4 md:p-6 rounded-full bg-red-500/10 mb-4 md:mb-6">
            <XCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Verification Failed</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-4 px-4">
            {kycData?.rejection_reason || 'Please try again with valid documents.'}
          </p>
          <Button onClick={() => setStep(1)} className="bg-primary hover:bg-primary/90">Try Again</Button>
        </motion.div>
      );
    }

    return renderVerificationFlow();
  };

  const renderVerificationFlow = () => (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6 md:mb-8 overflow-x-auto pb-2 px-1">
        {[1, 2, 3, 4, 5, 6].map((s, idx) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0 text-sm md:text-base ${s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {s < step ? <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> : s}
            </div>
            {idx < 5 && <div className={`w-4 sm:w-8 md:w-12 h-1 mx-0.5 sm:mx-1 rounded transition-all ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
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
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Select Document Type</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">Choose the type of ID you'll use for verification.</p>
            <div className="space-y-3 md:space-y-4">
              {documentTypes.map((doc) => {
                const Icon = doc.icon;
                return (
                  <button key={doc.id} onClick={() => handleDocumentTypeSelect(doc.id)}
                    className={`w-full p-3 md:p-4 rounded-xl border transition-all flex items-center gap-3 md:gap-4 hover:border-primary/50 hover:bg-primary/5 ${selectedDocument === doc.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <div className="p-2 md:p-3 rounded-lg bg-primary/10"><Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" /></div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-foreground text-sm md:text-base">{doc.label}</div>
                      <div className="text-xs md:text-sm text-muted-foreground">{doc.description}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
            <Button variant="outline" onClick={() => setStep(2)} className="w-full mt-6 md:mt-8">Back</Button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Upload Document Front</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">Upload the front of your {selectedDocument?.replace('_', ' ')}.</p>
            <DocumentUpload label="Front of Document" onUpload={handleFrontUpload} uploadedUrl={frontUrl} />
            <Button variant="outline" onClick={() => setStep(3)} className="w-full mt-4">Back</Button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Upload Document Back</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">Upload the back of your document.</p>
            <DocumentUpload label="Back of Document" onUpload={handleBackUpload} uploadedUrl={backUrl} />
            <Button variant="outline" onClick={() => setStep(4)} className="w-full mt-4">Back</Button>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Take a Selfie</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">Take a clear selfie using your camera for identity verification.</p>
            <DocumentUpload label="Selfie" onUpload={setSelfieUrl} uploadedUrl={selfieUrl} isSelfie />
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
              <Button variant="outline" onClick={() => setStep(5)} className="flex-1">Back</Button>
              <Button onClick={handleSubmit} disabled={!selfieUrl || submitting} className="flex-1 bg-primary hover:bg-primary/90">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit for Review'}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 7 && (
          <motion.div key="step7" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 md:py-8">
            <div className="inline-flex p-4 md:p-6 rounded-full bg-green-500/10 mb-4 md:mb-6">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Documents Submitted!</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto px-4">We'll review them and notify you within 1-2 business days.</p>
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
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">KYC Verification</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">Complete identity verification to unlock all trading features.</p>
      </div>
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 md:p-8">
        {kycData?.status !== 'not_started' ? renderStatusView() : renderVerificationFlow()}
      </div>
    </DashboardLayout>
  );
}
