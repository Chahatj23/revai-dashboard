import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import { Toaster, toast } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProductProvider } from "./contexts/ProductContext";
import { OrderProvider } from "./contexts/OrderContext";
import { PromotionProvider } from "./contexts/PromotionContext";
import { CustomerProvider } from "./contexts/CustomerContext";
import { LeadProvider } from "./contexts/LeadContext";
import { DealProvider } from "./contexts/DealContext";
import CRMDashboard from "./components/crm/CRMDashboard";
import LeadManager from "./components/crm/LeadManager";
import DealManager from "./components/crm/DealManager";
import ExecutiveReports from "./components/crm/ExecutiveReports";
import LeadDetailPage from "./components/crm/LeadDetailPage";
import InventoryDashboard from "./components/inventory/InventoryDashboard";
import InventoryManager from "./components/inventory/InventoryManager";
import OrderManager from "./components/inventory/OrderManager";
import PromotionManager from "./components/inventory/PromotionManager";
import AIRecommendations from "./components/inventory/AIRecommendations";
import AddProduct from "./components/inventory/AddProduct";
import RestockSimulator from "./components/inventory/RestockSimulator";
import ProductDetail from "./components/inventory/ProductDetail";
import CustomerManager from "./components/crm/CustomerManager";
import IntegrationHub from "./components/crm/IntegrationHub";
import SettingsPage from "./components/SettingsPage";
import OrganizationSelector from "./components/auth/OrganizationSelector";
import LoginPage from "./components/auth/LoginPage";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  ShoppingCart,
  Percent,
  Sparkles,
  Cable,
  Zap,
  ChevronRight,
  Building2,
  Target,
  BarChart3,
  Activity,
} from "lucide-react";
import { cn } from "./lib/utils";
import { Analytics } from "@vercel/analytics/react";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { orgId } = useParams();
  const { logout, currentUser } = useAuth();

  const navItems = [
    {
      group: "Strategic Insights",
      items: [
        {
          href: `/org/${orgId}/reports`,
          label: "Executive Reports",
          icon: BarChart3,
        },
        {
          href: `/org/${orgId}/inventory/recommendations`,
          label: "Inventory Analysis",
          icon: Sparkles,
        },
      ],
    },
    {
      group: "Revenue Pipeline",
      items: [
        { href: `/org/${orgId}/leads`, label: "Lead Reservoir", icon: Zap },
        { href: `/org/${orgId}/deals`, label: "Deal Matrix", icon: Target },
        {
          href: `/org/${orgId}/customers`,
          label: "Customer Accounts",
          icon: Users,
        },
        {
          href: `/org/${orgId}/`,
          label: "Revenue Health",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      group: "Operations",
      items: [
        {
          href: `/org/${orgId}/inventory`,
          label: "Master Inventory",
          icon: Package,
        },
        {
          href: `/org/${orgId}/orders`,
          label: "Trade Ledger",
          icon: ShoppingCart,
        },
        {
          href: `/org/${orgId}/inventory/simulate`,
          label: "Demand Simulator",
          icon: Activity,
        },
        {
          href: `/org/${orgId}/integrations`,
          label: "Systems Link",
          icon: Cable,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "bg-sidebar-background text-sidebar-foreground flex flex-col h-screen sticky top-0 z-50 border-r border-sidebar-border shadow-2xl transition-all duration-300",
        isOpen ? "w-72" : "w-20",
      )}
    >
      <div className="p-8 pb-4 flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-3",
            !isOpen && "justify-center w-full",
          )}
        >
          <div className="w-10 h-10 shrink-0 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-xl">🚀</span>
          </div>
          {isOpen && (
            <div className="animate-in fade-in duration-300 whitespace-nowrap overflow-hidden">
              <h1 className="text-xl font-bold tracking-tight text-white">
                RevAI
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                Intelligence Hub
              </p>
            </div>
          )}
        </div>
      </div>

      {isOpen && currentUser?.organizationName && (
        <div className="mx-8 mb-6 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-default animate-in fade-in duration-300 whitespace-nowrap overflow-hidden">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
              Active Account
            </p>
            <h3 className="text-sm font-bold text-white truncate max-w-[120px]">
              {currentUser.organizationName}
            </h3>
          </div>
          <div className="p-1.5 shrink-0 rounded-lg bg-primary/20 text-primary">
            <Building2 size={14} />
          </div>
        </div>
      )}

      <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((group) => (
          <div key={group.group} className="space-y-1">
            {isOpen && (
              <p className="px-4 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                {group.group}
              </p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                  location.pathname === item.href
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "hover:bg-sidebar-accent hover:text-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={18}
                    className={cn(
                      "shrink-0 transition-transform group-hover:scale-110",
                      location.pathname === item.href
                        ? "text-white"
                        : "text-primary/60",
                    )}
                  />
                  {isOpen && (
                    <span className="font-semibold text-sm whitespace-nowrap animate-in fade-in">
                      {item.label}
                    </span>
                  )}
                </div>
                {isOpen && location.pathname === item.href && (
                  <ChevronRight size={14} className="opacity-50 shrink-0" />
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-sidebar-border space-y-2 flex flex-col items-center">
        {isOpen ? (
          <Link
            to={`/org/${orgId}/settings`}
            className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-sidebar-accent rounded-xl text-sm font-semibold transition-all text-muted-foreground hover:text-white"
          >
            <Settings size={18} className="shrink-0" />
            <span className="whitespace-nowrap animate-in fade-in">
              System Settings
            </span>
          </Link>
        ) : (
          <Link
            to={`/org/${orgId}/settings`}
            className="flex justify-center p-3 w-full hover:bg-sidebar-accent rounded-xl text-muted-foreground hover:text-white"
          >
            <Settings size={18} />
          </Link>
        )}

        {isOpen ? (
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-400/10 rounded-xl text-sm font-bold transition-all relative z-[60]"
          >
            <LogOut size={18} className="shrink-0" />
            <span className="whitespace-nowrap animate-in fade-in">
              Terminate Session
            </span>
          </button>
        ) : (
          <button
            onClick={() => logout()}
            className="flex justify-center p-3 w-full text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mt-2 w-full flex justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground transition-all"
        >
          <ChevronRight
            size={16}
            className={cn(
              "transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </div>
    </aside>
  );
}

// Synchronizes our AuthContext state with the URL organization ID
function URLContextSynchronizer({ children }) {
  const { orgId } = useParams();
  const { currentUser, switchOrganization } = useAuth();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (currentUser && orgId && orgId !== currentUser.activeOrgId) {
      setSyncing(true);
      switchOrganization(orgId)
        .catch(() => toast.error("Unauthorized access to organization data."))
        .finally(() => setSyncing(false));
    }
  }, [orgId, currentUser, switchOrganization]);

  if (syncing) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-black/40 backdrop-blur-md z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
            Relocating Resources...
          </p>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Initialising Systems...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="dark min-h-screen bg-background text-foreground">
        <Toaster theme="dark" position="top-right" />
        {!currentUser ? (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : !currentUser.activeOrgId ? (
          <OrganizationSelector />
        ) : (
          <div className="flex min-h-screen">
            <Routes>
              {/* Parameterized Route Wrapper */}
              <Route
                path="/org/:orgId/*"
                element={
                  <URLContextSynchronizer>
                    <div className="flex w-full min-h-screen">
                      <Sidebar />
                      <main className="flex-1 overflow-x-auto relative min-w-0">
                        <LeadProvider>
                          <DealProvider>
                            <ProductProvider>
                              <OrderProvider>
                                <PromotionProvider>
                                  <CustomerProvider>
                                    <Routes>
                                      <Route
                                        path="/"
                                        element={<CRMDashboard />}
                                      />
                                      <Route
                                        path="/reports"
                                        element={<ExecutiveReports />}
                                      />
                                      <Route
                                        path="/leads"
                                        element={<LeadManager />}
                                      />
                                      <Route
                                        path="/leads/:id"
                                        element={<LeadDetailPage />}
                                      />
                                      <Route
                                        path="/deals"
                                        element={<DealManager />}
                                      />
                                      <Route
                                        path="/inventory"
                                        element={<InventoryDashboard />}
                                      />
                                      <Route
                                        path="/inventory/manage"
                                        element={<InventoryManager />}
                                      />
                                      <Route
                                        path="/inventory/simulate"
                                        element={<RestockSimulator />}
                                      />
                                      <Route
                                        path="/orders"
                                        element={<OrderManager />}
                                      />
                                      <Route
                                        path="/promotions"
                                        element={<PromotionManager />}
                                      />
                                      <Route
                                        path="/inventory/recommendations"
                                        element={<AIRecommendations />}
                                      />
                                      <Route
                                        path="/integrations"
                                        element={<IntegrationHub />}
                                      />
                                      <Route
                                        path="/customers"
                                        element={<CustomerManager />}
                                      />
                                      <Route
                                        path="/settings"
                                        element={<SettingsPage />}
                                      />
                                      <Route
                                        path="/pipeline"
                                        element={
                                          <CRMDashboard
                                            showPipelineOnly={true}
                                          />
                                        }
                                      />
                                      <Route
                                        path="/products/add"
                                        element={<AddProduct />}
                                      />
                                      <Route
                                        path="/products/:id"
                                        element={<ProductDetail />}
                                      />
                                      <Route
                                        path="*"
                                        element={<Navigate to="/" replace />}
                                      />
                                    </Routes>
                                  </CustomerProvider>
                                </PromotionProvider>
                              </OrderProvider>
                            </ProductProvider>
                          </DealProvider>
                        </LeadProvider>
                      </main>
                    </div>
                  </URLContextSynchronizer>
                }
              />
              {/* Default redirect for legacy links */}
              <Route
                path="*"
                element={
                  <Navigate to={`/org/${currentUser.activeOrgId}/`} replace />
                }
              />
            </Routes>
          </div>
        )}
        <Analytics />
      </div>
    </Router>
  );
}

// Wrap with providers at the very top level for App
function AppWithProviders() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithProviders;
