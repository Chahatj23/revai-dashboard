import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useOrders } from '../../contexts/OrderContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Package, AlertTriangle, ListChecks, RefreshCw, CheckCircle, ShoppingCart, DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { cn } from '../../lib/utils';
import SalesTrendChart from './SalesTrendChart';
import BestSellingProductsTable from './BestSellingProductsTable';
import { format } from 'date-fns';

const InventoryDashboard = () => {
  const { products, loading: productsLoading } = useProducts();
  const { sales, loading: salesLoading } = useOrders();

  const loading = productsLoading || salesLoading;

  // KPI Calculations
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockLevel, 0); 
  const lowStockProducts = products.filter(p => p.stockLevel <= p.reorderPoint);
  
  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, p) => {
      const price = p.discountPercentage > 0 
        ? p.price * (1 - p.discountPercentage / 100) 
        : p.price;
      return sum + (p.stockLevel * price);
    }, 0);
  }, [products]);

  const totalSalesValue = useMemo(() => {
    return sales
      .filter(s => s.paymentStatus === 'paid')
      .reduce((sum, s) => sum + s.grandTotal, 0);
  }, [sales]);

  // Sales Trend Data Transformation
  const salesTrendData = useMemo(() => {
    const daily = {};
    sales.filter(s => s.paymentStatus === 'paid').forEach(order => {
      const date = format(new Date(order.createdAt), 'yyyy-MM-dd');
      daily[date] = (daily[date] || 0) + order.grandTotal;
    });
    return Object.entries(daily)
      .map(([date, totalSales]) => ({ date, totalSales }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [sales]);

  // Best Sellers Transformation
  const bestSellers = useMemo(() => {
    const map = {};
    sales.filter(s => s.paymentStatus === 'paid').forEach(order => {
      order.items?.forEach(item => {
        if (!map[item.productId]) {
          map[item.productId] = { productId: item.productId, productName: item.productName, totalQuantitySold: 0, totalRevenueGenerated: 0 };
        }
        map[item.productId].totalQuantitySold += item.quantitySold;
        map[item.productId].totalRevenueGenerated += item.lineTotal;
      });
    });
    return Object.values(map).sort((a,b) => b.totalRevenueGenerated - a.totalRevenueGenerated).slice(0, 5);
  }, [sales]);

  return (
    <div className="crm-dashboard space-y-10 animate-in fade-in duration-700 pb-20 p-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">RevAI Inventory Control</h1>
          <p className="subtitle text-primary font-bold uppercase tracking-widest text-xs">Live System Control & Analytics</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="glass-panel border-primary/20 hover:border-primary/50 text-white font-bold h-14 px-8">
            <RefreshCw className="mr-2 h-5 w-5" /> Sync Logic
          </Button>
          <Button size="lg" asChild className="shadow-2xl shadow-primary/40 h-14 px-8 font-extrabold text-lg">
            <Link to="/inventory/manage">Master Control</Link>
          </Button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Products", val: totalProducts, icon: Package, sub: "Unique product lines", color: "text-blue-400" },
          { label: "Total Stock Volume", val: totalStockUnits.toLocaleString(), icon: ListChecks, sub: "Total items in network", color: "text-purple-400" },
          { label: "Inventory Value", val: `$${totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, sub: "Estimated stock worth", color: "text-emerald-400" },
          { label: "Sales Revenue", val: `$${totalSalesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, sub: "Total paid sales", color: "text-orange-400" },
        ].map((kpi, i) => (
          <Card key={i} className="glass-panel border-none shadow-2xl hover:translate-y-[-4px] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</CardTitle>
              <div className={cn("p-2 rounded-xl bg-background/50", kpi.color)}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-10 w-24" /> : <div className={cn("text-3xl font-black tracking-tighter", kpi.color)}>{kpi.val}</div>}
              <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-wider">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2">
          <SalesTrendChart data={salesTrendData} />
        </div>

        {/* Quick Stats Panel */}
        <div className="space-y-8">
          <Card className={cn(
            "glass-panel border-none shadow-2xl transition-all duration-300",
            !loading && lowStockProducts.length > 0 ? "border-destructive/50 ring-2 ring-destructive/20" : ""
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-black text-white">Stock Health</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase">Replenishment Logic</CardDescription>
              </div>
              {!loading && (
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  lowStockProducts.length > 0 ? "bg-destructive/20 text-destructive animate-pulse" : "bg-emerald-500/20 text-emerald-500"
                )}>
                  {lowStockProducts.length > 0 ? "Intervention Needed" : "Optimal"}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className={cn(
                  "text-6xl font-black tracking-tighter",
                  lowStockProducts.length > 0 ? "text-destructive" : "text-emerald-500"
                )}>
                  {lowStockProducts.length}
                </div>
                <div className="text-xs font-bold text-muted-foreground space-y-1 leading-tight">
                  <p>Products requiring immediate</p>
                  <p>restock intervention.</p>
                  {lowStockProducts.length > 0 && (
                    <Button variant="link" className="p-0 h-auto text-destructive text-[10px] font-black uppercase tracking-widest" asChild>
                      <Link to="/inventory/manage?filter=low">View Critical Nodes →</Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-none shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-black text-white">Quick Deployment</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Operation Shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <Button className="justify-start gap-4 h-12 font-bold" asChild>
                <Link to="/products/add"><Package className="h-4 w-4" /> New Product Node</Link>
              </Button>
              <Button variant="outline" className="justify-start gap-4 h-12 font-bold" asChild>
                <Link to="/orders"><ShoppingCart className="h-4 w-4" /> Record Trade Phase</Link>
              </Button>
              <Button variant="secondary" className="justify-start gap-4 h-12 font-bold" asChild>
                <Link to="/promotions"><TrendingUp className="h-4 w-4" /> Inject Promotion</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Best Sellers and Detailed Alerts */}
      <div className="grid gap-8 lg:grid-cols-2">
        <BestSellingProductsTable data={bestSellers} isLoading={loading} />
        
        <Card className="glass-panel border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-white">Inventory Alerts</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Real-time Threshold Monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>
            ) : lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 3).map(product => (
                  <div key={product.id} className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white group-hover:text-primary transition-colors">{product.name}</h4>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        CRITICAL: {product.stockLevel} / RECOMMENDED: {product.reorderPoint}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive font-black uppercase tracking-widest text-[10px] hover:bg-destructive/10" asChild>
                      <Link to="/orders">Deploy PO</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <CheckCircle className="text-emerald-500 w-10 h-10" />
                </div>
                <h4 className="font-black text-xl italic text-emerald-500/80 uppercase tracking-tighter">Network Optimized</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">All product nodes maintain safe volume</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InventoryDashboard;
