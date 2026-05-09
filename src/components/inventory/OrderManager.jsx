import React, { useState } from 'react';
import { useOrders } from '../../contexts/OrderContext';
import { toast } from 'sonner';
import { useProducts } from '../../contexts/ProductContext';
import { useCustomers } from '../../contexts/CustomerContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Input } from '../ui/Input';
import { ShoppingCart, ExternalLink, Clock, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const OrderManager = () => {
  const { 
    sales, purchases, loading, 
    addSaleOrder, addPurchaseOrder, 
    updateSaleOrder, deleteSaleOrders, 
    updatePurchaseOrder, deletePurchaseOrders 
  } = useOrders();
  const { products } = useProducts();
  const { customers } = useCustomers();
  
  const [activeTab, setActiveTab] = useState('sales');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  // New Order Form State
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    items: [],
    paymentStatus: 'pending',
    grandTotal: 0
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const orders = activeTab === 'sales' ? sales : purchases;

  const handleAddItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    // Apply Active Promotions
    const finalPrice = product.price * (1 - (product.discountPercentage || 0) / 100);

    const newItem = {
      productId: product.id,
      productName: product.name,
      quantitySold: parseInt(quantity),
      pricePerUnit: finalPrice,
      totalPrice: finalPrice * parseInt(quantity),
      appliedDiscount: product.discountPercentage || 0
    };
    
    const newItems = [...formData.items, newItem];
    const newTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    setFormData({
      ...formData,
      items: newItems,
      grandTotal: newTotal
    });
    setSelectedProduct('');
    setQuantity(1);
  };

  const handleCommitOrder = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'sales') {
        const customer = customers.find(c => c.id === formData.customerId);
        await addSaleOrder({
          ...formData,
          customerName: customer?.name || "One-time Customer",
          customerEmail: customer?.email || ""
        });
      } else {
        await addPurchaseOrder({
          ...formData,
          supplierName: formData.customerId ? "Registered Supplier" : "One-time Supplier",
        });
      }
      toast.success(activeTab === 'sales' ? 'Sales transaction committed.' : 'Purchase order deployed.');
      setIsAdding(false);
      setFormData({ customerId: '', customerName: '', items: [], paymentStatus: 'pending', grandTotal: 0 });
    } catch (err) {
      toast.error("Transaction Error: " + (err.response?.data?.error || err.message || "Verify inventory levels and try again."));
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (activeTab === 'sales') {
        await updateSaleOrder(orderId, { paymentStatus: newStatus });
      } else {
        await updatePurchaseOrder(orderId, { paymentStatus: newStatus });
      }
      toast.success(`Order status updated to ${newStatus}. Inventory adjusted if applicable.`);
    } catch (err) {
      toast.error("Failed to update status. " + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Permanently decommission ${selectedOrders.length} records?`)) return;
    try {
      if (activeTab === 'sales') {
        await deleteSaleOrders(selectedOrders);
      } else {
        await deletePurchaseOrders(selectedOrders);
      }
      toast.success(`Successfully deleted ${selectedOrders.length} records.`);
      setSelectedOrders([]);
    } catch (err) {
      toast.error("Failed to delete records.");
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">Trade Operations</h1>
          <p className="subtitle text-primary font-bold uppercase tracking-widest text-xs">Sales & Supply Chain Management</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          size="lg" 
          className="shadow-2xl shadow-primary/40 h-14 px-8 font-extrabold text-lg"
        >
          <Plus className="mr-2 h-6 w-6" /> Create {activeTab === 'sales' ? 'Sales Order' : 'Purchase Order'}
        </Button>
      </header>

      {isAdding && (
        <Card className="glass-panel border-primary/20 bg-primary/5 animate-in zoom-in-95 duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black text-white">New {activeTab === 'sales' ? 'Sales' : 'Purchase'} Record</CardTitle>
              <CardDescription className="text-white/80">Input transaction details for the ledger.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white">
              <X size={24} />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCommitOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/60 tracking-widest">Select {activeTab === 'sales' ? 'Customer' : 'Supplier'}</label>
                  <select 
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold outline-none focus:border-primary transition-all"
                  >
                    <option value="" className="bg-background text-foreground">Select Profile</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id} className="bg-background text-foreground">{c.name} ({c.company})</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-white/60 tracking-widest">Payment Status</label>
                   <select 
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold outline-none focus:border-primary transition-all"
                  >
                    <option value="pending" className="bg-background text-foreground text-orange-400">Pending Authorization</option>
                    <option value="paid" className="bg-background text-foreground text-emerald-400">Processed / Paid</option>
                    <option value="cancelled" className="bg-background text-foreground text-red-400">Failed / Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/60 tracking-widest">Add Product to Ledger</label>
                    <select 
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white font-bold outline-none focus:border-primary"
                    >
                      <option value="">Choose Node</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ${(p.price * (1 - (p.discountPercentage || 0) / 100)).toFixed(2)} 
                          {p.discountPercentage > 0 ? ` (PROMO: ${p.discountPercentage}% OFF)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24 space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/60 tracking-widest">Qty</label>
                    <Input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)} 
                      className="h-12 glass-panel"
                    />
                  </div>
                  <Button type="button" onClick={handleAddItem} variant="secondary" className="h-12 px-6 font-bold uppercase tracking-widest text-[10px]">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{item.productName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Qty: {item.quantitySold} × ${item.pricePerUnit}</span>
                      </div>
                      <span className="font-black text-primary">${item.totalPrice}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">Transaction Total</p>
                  <h2 className="text-4xl font-extrabold text-white tracking-tighter">${formData.grandTotal.toFixed(2)}</h2>
                </div>
                <div className="flex gap-4">
                   <Button variant="ghost" type="button" onClick={() => setIsAdding(false)} className="h-14 px-8 font-bold">Discard</Button>
                   <Button type="submit" disabled={formData.items.length === 0} className="h-14 px-10 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs">Commit Transaction</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 p-1 bg-white/5 w-fit rounded-2xl border border-white/5">
        <button 
          onClick={() => setActiveTab('sales')}
          className={cn(
            "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
            activeTab === 'sales' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
          )}
        >
          Sales Ledger
        </button>
        <button 
          onClick={() => { setActiveTab('purchases'); setSelectedOrders([]); }}
          className={cn(
            "px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
            activeTab === 'purchases' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-white"
          )}
        >
          Purchase Ledger
        </button>
      </div>

      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-4 animate-in zoom-in duration-300">
          <span className="text-sm font-black text-primary uppercase tracking-widest">{selectedOrders.length} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="font-black uppercase tracking-widest py-4 px-6 h-12">
            Delete Selected Records
          </Button>
        </div>
      )}

      <Card className="glass-panel border-none shadow-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5 hover:bg-white/5 border-white/10">
              <TableHead className="w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-white/20 bg-transparent text-primary"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedOrders(orders.map(o => o.id));
                    else setSelectedOrders([]);
                  }}
                />
              </TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest w-[20%] text-white">Document ID</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest w-[25%] text-white">Entity</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-center text-white">Status</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-right text-white">Revenue/Cost</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><div className="h-14 bg-white/5 animate-pulse rounded-xl w-full" /></TableCell></TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id} className={cn("hover:bg-primary/5 border-white/5 transition-all group", selectedOrders.includes(order.id) && "bg-primary/10")}>
                  <TableCell>
                    <input 
                      type="checkbox" 
                      className="rounded border-white/20 bg-transparent text-primary"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        setSelectedOrders(prev => prev.includes(order.id) ? prev.filter(i => i !== order.id) : [...prev, order.id]);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background/50 text-primary">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-base">{order.orderNumber}</div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-white uppercase tracking-tighter">{order.customerName || order.supplierName || "Direct Transaction"}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{order.customerEmail || "No digital signature"}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      (order.paymentStatus === 'paid' || order.paymentStatus === 'received') ? "bg-emerald-500/20 text-emerald-500" :
                      order.paymentStatus === 'pending' ? "bg-orange-500/20 text-orange-500" :
                      "bg-destructive/20 text-destructive"
                    )}>
                      {(order.paymentStatus === 'paid' || order.paymentStatus === 'received') ? <CheckCircle2 className="h-3 w-3" /> : 
                       order.paymentStatus === 'pending' ? <Clock className="h-3 w-3" /> : 
                       <AlertCircle className="h-3 w-3" />}
                      {order.paymentStatus}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-black text-white text-xl">
                    ${order.grandTotal?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3 flex-wrap">
                      <select 
                        value={order.paymentStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-white/5 text-white/60 hover:text-white border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider outline-none focus:border-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <option value="pending" className="bg-background">Pending</option>
                        {activeTab === 'sales' && <option value="paid" className="bg-background">Paid</option>}
                        {activeTab === 'purchases' && <option value="received" className="bg-background">Received</option>}
                        <option value="cancelled" className="bg-background">Cancelled</option>
                      </select>
                      <Button variant="ghost" size="sm" className="hover:bg-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                  <p className="text-xl font-bold italic text-muted-foreground">No active {activeTab} records found in the system.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default OrderManager;
