import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Wallet, ArrowRightLeft, CreditCard, TrendingUp } from "lucide-react";

const Dashboard = () => {
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
            { label: "XRP Balance", value: "0.00 XRP", icon: Wallet, change: "+0%" },
            { label: "Portfolio Value", value: "$0.00", icon: TrendingUp, change: "+0%" },
            { label: "Total Swaps", value: "0", icon: ArrowRightLeft, change: "—" },
            { label: "Total Purchases", value: "$0.00", icon: CreditCard, change: "—" },
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
        <div className="glass-card dark:bg-card dark:border-border p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/dashboard/buy" className="btn-xrp-primary py-4 flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" /> Buy XRP
            </Link>
            <Link to="/dashboard/swap" className="btn-xrp-secondary py-4 flex items-center justify-center gap-2">
              <ArrowRightLeft className="w-5 h-5" /> Swap to XRP
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
