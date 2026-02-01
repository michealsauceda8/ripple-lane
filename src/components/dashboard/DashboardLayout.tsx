import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Wallet, 
  ShieldCheck, 
  Receipt, 
  Settings, 
  LogOut,
  Menu,
  Moon,
  Sun
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useKYC } from "@/hooks/useKYC";
import BonusBanner from "@/components/promotional/BonusBanner";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Swap", href: "/dashboard/swap", icon: ArrowRightLeft },
  { name: "Wallets", href: "/dashboard/wallets", icon: Wallet },
  { name: "KYC Verification", href: "/dashboard/kyc", icon: ShieldCheck },
  { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { theme, setTheme } = useTheme();
  const { kycData } = useKYC();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/login");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-foreground" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-white">
              XRP<span className="text-primary">Vault</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-nav-item ${location.pathname === item.href ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <button onClick={handleLogout} className="sidebar-nav-item text-destructive hover:bg-destructive/10">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              {/* KYC Status Badge */}
              {kycData && (
                <div className={
                  kycData.status === 'approved' 
                    ? 'badge-success' 
                    : kycData.status === 'rejected'
                    ? 'badge-error'
                    : kycData.status === 'pending'
                    ? 'badge-warning'
                    : 'badge-info'
                }>
                  KYC {kycData.status === 'not_started' ? 'Not Started' : kycData.status.charAt(0).toUpperCase() + kycData.status.slice(1)}
                </div>
              )}
              
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          {children}
        </motion.main>
      </div>

      {/* Promotional Banner */}
      <BonusBanner trigger="dashboard" />
    </div>
  );
};

export default DashboardLayout;
