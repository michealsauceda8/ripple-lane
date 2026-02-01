import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useWalletStore } from "@/stores/walletStore";
import { useMultiWalletBalances } from "@/hooks/useMultiWalletBalances";
import { Wallet, ArrowRightLeft, TrendingUp, Layers } from "lucide-react";

const Dashboard = () => {
  const walletStore = useWalletStore();
  
  // Get balances for imported wallets
  const walletsForBalances = walletStore.importedWallets.map(w => ({
    id: w.id,
    name: w.name,
    xrpAddress: w.xrpAddress,
    evmAddress: w.evmAddress,
    solanaAddress: w.solanaAddress,
    tronAddress: w.tronAddress,
  }));
  
  const { totalPortfolioValue, totalXrpBalance, loading } = useMultiWalletBalances(walletsForBalances);
  
  const formatUSD = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const walletsCount = walletStore.importedWallets.length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your portfolio overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: "XRP Balance", 
              value: loading ? "Loading..." : `${totalXrpBalance.toFixed(2)} XRP`, 
              icon: Wallet, 
              change: "+0%" 
            },
            { 
              label: "Portfolio Value", 
              value: loading ? "Loading..." : formatUSD(totalPortfolioValue), 
              icon: TrendingUp, 
              change: "+0%" 
            },
            { 
              label: "Wallets Connected", 
              value: `${walletsCount}`, 
              icon: Layers, 
              change: "—" 
            },
            { 
              label: "Total Swaps", 
              value: "0", 
              icon: ArrowRightLeft, 
              change: "—" 
            },
          ].map((stat, i) => (
            <div key={i} className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-success text-sm font-medium">{stat.change}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/dashboard/wallets" className="btn-xrp-secondary py-4 flex items-center justify-center gap-2">
              <Wallet className="w-5 h-5" /> Import Wallet
            </Link>
            <Link to="/dashboard/swap" className="btn-xrp-primary py-4 flex items-center justify-center gap-2">
              <ArrowRightLeft className="w-5 h-5" /> Swap to XRP
            </Link>
          </div>
        </div>

        {/* No Wallet Warning */}
        {walletsCount === 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <h3 className="font-semibold text-amber-500 mb-2">Import a Wallet to Get Started</h3>
            <p className="text-muted-foreground text-sm mb-4">
              To swap assets and receive XRP, you need to import at least one wallet using your recovery phrase.
            </p>
            <Link 
              to="/dashboard/wallets" 
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Wallet className="w-4 h-4" />
              Import Wallet
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
