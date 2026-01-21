import { ReactNode } from 'react';
import { useKYC } from '@/hooks/useKYC';
import { AlertTriangle, Clock, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface KYCGateProps {
  children: ReactNode;
  feature?: string;
}

export function KYCGate({ children, feature = 'this feature' }: KYCGateProps) {
  const { kycData, loading, canTrade } = useKYC();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (canTrade) {
    return <>{children}</>;
  }

  const statusConfig = {
    not_started: {
      icon: Shield,
      title: 'KYC Verification Required',
      description: `To access ${feature}, you need to complete identity verification.`,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    pending: {
      icon: Clock,
      title: 'Verification In Progress',
      description: 'Your documents are being reviewed. This usually takes 1-2 business days.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    rejected: {
      icon: XCircle,
      title: 'Verification Failed',
      description: kycData?.rejection_reason || 'Your verification was rejected. Please try again with valid documents.',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    approved: {
      icon: CheckCircle,
      title: 'Verified',
      description: 'Your identity has been verified.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  };

  const status = kycData?.status || 'not_started';
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${config.borderColor} ${config.bgColor} p-8 max-w-lg mx-auto text-center`}
    >
      <div className={`inline-flex p-4 rounded-full ${config.bgColor} mb-6`}>
        <Icon className={`w-12 h-12 ${config.color}`} />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-3">{config.title}</h2>
      <p className="text-muted-foreground mb-6">{config.description}</p>
      
      {(status === 'not_started' || status === 'rejected') && (
        <Button
          onClick={() => navigate('/dashboard/kyc')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Start Verification
        </Button>
      )}
      
      {status === 'pending' && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="animate-pulse w-2 h-2 rounded-full bg-blue-500"></div>
          Processing your documents...
        </div>
      )}
    </motion.div>
  );
}
