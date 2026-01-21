import { useKYC, KYCStatus } from '@/hooks/useKYC';
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const statusConfig: Record<KYCStatus, { 
  label: string; 
  icon: typeof Shield; 
  className: string;
}> = {
  not_started: {
    label: 'Not Verified',
    icon: AlertTriangle,
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  pending: {
    label: 'Pending Review',
    icon: Clock,
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  approved: {
    label: 'Verified',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
};

export function KYCStatusBadge() {
  const { kycData, loading } = useKYC();

  if (loading) {
    return (
      <div className="h-6 w-24 bg-muted animate-pulse rounded-full"></div>
    );
  }

  const status = kycData?.status || 'not_started';
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
}
