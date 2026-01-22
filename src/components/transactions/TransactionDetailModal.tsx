import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  ShoppingCart, 
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: 'buy' | 'swap' | 'send' | 'receive';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  source_chain: string | null;
  source_token: string | null;
  source_amount: number | null;
  destination_chain: string | null;
  destination_token: string | null;
  destination_amount: number | null;
  destination_address: string | null;
  tx_hash: string | null;
  fee_amount: number | null;
  fee_currency: string | null;
  moonpay_transaction_id: string | null;
  fiat_currency: string | null;
  fiat_amount: number | null;
  created_at: string;
}

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const typeConfig = {
  buy: { icon: ShoppingCart, label: 'Purchase', color: 'text-green-500', bg: 'bg-green-500/10' },
  swap: { icon: RefreshCw, label: 'Swap', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  send: { icon: ArrowUpRight, label: 'Send', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  receive: { icon: ArrowDownLeft, label: 'Receive', color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

const statusConfig: Record<string, { icon: typeof Clock; label: string; variant: 'secondary' | 'default' | 'destructive' | 'outline'; animate?: boolean }> = {
  pending: { icon: Clock, label: 'Pending', variant: 'secondary' },
  processing: { icon: Loader2, label: 'Processing', variant: 'default', animate: true },
  completed: { icon: CheckCircle2, label: 'Completed', variant: 'default' },
  failed: { icon: XCircle, label: 'Failed', variant: 'destructive' },
  cancelled: { icon: AlertCircle, label: 'Cancelled', variant: 'outline' },
};

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  const typeInfo = typeConfig[transaction.transaction_type];
  const statusInfo = statusConfig[transaction.status];
  const TypeIcon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatAmount = (amount: number | null, symbol: string | null) => {
    if (amount === null) return '-';
    return `${amount.toLocaleString()} ${symbol || ''}`;
  };

  return (
    <Dialog open={!!transaction} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${typeInfo.bg}`}>
              <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
            </div>
            <div>
              <p className="font-semibold">{typeInfo.label} Transaction</p>
              <p className="text-sm text-muted-foreground font-normal">
                {format(new Date(transaction.created_at), 'PPpp')}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={statusInfo.variant} className="gap-1.5">
              <StatusIcon className={`h-3.5 w-3.5 ${statusInfo.animate ? 'animate-spin' : ''}`} />
              {statusInfo.label}
            </Badge>
          </div>

          <Separator />

          {/* Amount Section */}
          <div className="space-y-4">
            {transaction.transaction_type === 'buy' && transaction.fiat_amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Paid</span>
                <span className="font-medium">
                  {transaction.fiat_currency} {transaction.fiat_amount?.toLocaleString()}
                </span>
              </div>
            )}

            {transaction.source_amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">From</span>
                <span className="font-medium">
                  {formatAmount(transaction.source_amount, transaction.source_token)}
                  {transaction.source_chain && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({transaction.source_chain})
                    </span>
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {transaction.transaction_type === 'buy' ? 'Received' : 'To'}
              </span>
              <span className="font-semibold text-lg">
                {formatAmount(transaction.destination_amount, transaction.destination_token)}
              </span>
            </div>

            {transaction.fee_amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network Fee</span>
                <span className="text-sm">
                  {formatAmount(transaction.fee_amount, transaction.fee_currency)}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Details Section */}
          <div className="space-y-3">
            {transaction.destination_address && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Destination Address</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded truncate">
                    {transaction.destination_address}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(transaction.destination_address!, 'Address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {transaction.tx_hash && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded truncate">
                    {transaction.tx_hash}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(transaction.tx_hash!, 'Transaction hash')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(`https://xrpscan.com/tx/${transaction.tx_hash}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {transaction.moonpay_transaction_id && (
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">MoonPay Reference</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded truncate">
                    {transaction.moonpay_transaction_id}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(transaction.moonpay_transaction_id!, 'Reference')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Transaction ID</span>
              <div className="flex items-center gap-1">
                <code className="text-xs">{transaction.id.slice(0, 8)}...</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(transaction.id, 'Transaction ID')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Status-specific messages */}
          {transaction.status === 'processing' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-500">Transaction Processing</p>
                  <p className="text-xs text-muted-foreground">
                    This usually takes 1-5 minutes. The page will update automatically.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {transaction.status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-500">Transaction Complete</p>
                  <p className="text-xs text-muted-foreground">
                    Your transaction has been confirmed on the blockchain.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {transaction.status === 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
            >
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">Transaction Failed</p>
                  <p className="text-xs text-muted-foreground">
                    Please contact support if you need assistance.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
