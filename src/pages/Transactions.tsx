import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTransactions } from '@/hooks/useTransactions';
import { motion } from 'framer-motion';
import { 
  History, 
  ArrowDownUp, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

const typeConfig = {
  buy: { icon: CreditCard, label: 'Buy', color: 'text-green-500', bg: 'bg-green-500/10' },
  swap: { icon: ArrowDownUp, label: 'Swap', color: 'text-primary', bg: 'bg-primary/10' },
  send: { icon: ArrowUpRight, label: 'Send', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  receive: { icon: ArrowDownLeft, label: 'Receive', color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string; animate?: boolean }> = {
  pending: { icon: Clock, label: 'Pending', color: 'text-amber-500' },
  processing: { icon: Loader2, label: 'Processing', color: 'text-blue-500', animate: true },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-500' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-red-500' },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-muted-foreground' },
};

export default function Transactions() {
  const { transactions, loading } = useTransactions();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <History className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        </div>
        <p className="text-muted-foreground">
          View your transaction history.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : transactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-12 text-center"
        >
          <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
            <History className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Transactions Yet</h3>
          <p className="text-muted-foreground">
            Your transaction history will appear here once you make your first trade.
          </p>
        </motion.div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => {
                  const type = typeConfig[tx.transaction_type];
                  const status = statusConfig[tx.status];
                  const TypeIcon = type.icon;
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${type.bg}`}>
                            <TypeIcon className={`w-4 h-4 ${type.color}`} />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{type.label}</div>
                            {tx.source_chain && (
                              <div className="text-xs text-muted-foreground">
                                {tx.source_chain} → XRP
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-foreground">
                          {tx.destination_amount?.toFixed(4)} XRP
                        </div>
                        {tx.fiat_amount && (
                          <div className="text-sm text-muted-foreground">
                            ${tx.fiat_amount.toFixed(2)} {tx.fiat_currency}
                          </div>
                        )}
                        {tx.source_amount && (
                          <div className="text-sm text-muted-foreground">
                            {tx.source_amount} {tx.source_token}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${status.animate ? 'animate-spin' : ''}`} />
                          {status.label}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {tx.tx_hash && (
                          <a
                            href={`https://xrpscan.com/tx/${tx.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                          >
                            View
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
