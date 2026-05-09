import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useCustomers } from '../../contexts/CustomerContext';
import { useOrders } from '../../contexts/OrderContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  UserPlus, Search, Mail, Phone, 
  Trash2, Edit, Download, Upload, 
  Globe, BadgeCheck, ShieldCheck, History, ShoppingCart
} from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/Table';

import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/Dialog';
import { useDebounce } from '../../hooks/useDebounce';

const CustomerManager = () => {
  const { customers, loading, addCustomer, deleteCustomer, updateCustomer, deleteMultipleCustomers, importCustomers } = useCustomers();
  const { sales } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: ''
  });

  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case 'salesforce': return <Globe className="h-3 w-3 text-blue-400" />;
      case 'csv': return <BadgeCheck className="h-3 w-3 text-emerald-400" />;
      default: return <ShieldCheck className="h-3 w-3 text-purple-400" />;
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
      } else {
        await addCustomer(formData);
        toast.success('New customer account created.');
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', address: '', company: '' });
    } catch (err) {
      toast.error("Persistence Error: " + (err.message || "Failed to save customer account."));
    }
  };

  const startEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      company: customer.company
    });
    setIsAdding(true);
  };



  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data.map(row => ({
            name: row.name || row.Name || '',
            email: row.email || row.Email || '',
            phone: row.phone || row.Phone || '',
            company: row.company || row.Company || '',
            address: row.address || row.Address || '',
            source: 'CSV'
          })).filter(c => c.name && c.email);

          if (parsedData.length === 0) {
            toast.error("No valid customers found in CSV.");
            return;
          }

          toast.info(`Importing ${parsedData.length} records...`);
          await importCustomers(parsedData);
          toast.success("CSV Ingestion Complete.");
        } catch (err) {
          toast.error("Failed to ingest CSV data.");
        }
      },
      error: () => toast.error("Error parsing the CSV file.")
    });
    e.target.value = '';
  };



  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 text-white/60">CRM Database</div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">Customer Accounts</h1>
          <p className="subtitle text-muted-foreground font-medium max-w-2xl">Manage your client relationships and purchase histories with professional precision.</p>
        </div>
        <div className="flex gap-4">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-14 px-6 glass-panel border-white/5 font-black uppercase tracking-widest text-[10px]">
             <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button variant="outline" className="h-14 px-6 glass-panel border-white/5 font-black uppercase tracking-widest text-[10px]">
             <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button 
            onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', email: '', phone: '', address: '', company: '' }); }} 
            className="h-14 px-8 shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-xs"
          >
            <UserPlus className="mr-3 h-5 w-5" /> New Account
          </Button>
        </div>
      </header>

      {isAdding && (
        <Card className="glass-panel border-primary/20 bg-primary/5 animate-in zoom-in-95 duration-300">
           <CardHeader>
              <CardTitle className="text-2xl font-black text-white">{editingId ? 'Edit Account' : 'New Customer Account'}</CardTitle>
              <CardDescription className="text-white/85">Initialize a new record for this client.</CardDescription>
           </CardHeader>
           <CardContent>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Input placeholder="Full Name" className="glass-panel h-14" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                 <Input placeholder="Email Address" type="email" className="glass-panel h-14" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                 <Input placeholder="Company" className="glass-panel h-14" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
                 <Input placeholder="Phone Number" className="glass-panel h-14" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                 <Input placeholder="Address" className="glass-panel h-14 lg:col-span-2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                 <div className="flex gap-4 lg:col-span-3">
                    <Button type="submit" className="px-10 h-14 font-black uppercase tracking-[0.2em] text-[10px]">
                      {editingId ? 'Save Changes' : 'Create Account'}
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => setIsAdding(false)} className="h-14 text-white/40 font-bold">Cancel</Button>
                 </div>
              </form>
           </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <div className="relative group max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Filter database by name, company, or email..." 
            className="pl-12 h-16 glass-panel border-white/5 bg-white/5 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Card className="glass-panel border-none shadow-3xl overflow-hidden bg-black/40">
          <Table>
            <TableHeader className="bg-white/5 border-b border-white/5 h-16">
              <TableRow>
                <TableHead className="w-12 pl-6">
                   <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Account Name</TableHead>
                <TableHead className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Organization</TableHead>
                <TableHead className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Source</TableHead>
                <TableHead className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Contact Details</TableHead>
                <TableHead className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Registration Date</TableHead>
                <TableHead className="text-right pr-8 text-white font-black uppercase tracking-[0.2em] text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse h-24 border-white/5"><TableCell colSpan={7} className="bg-white/5" /></TableRow>
                ))
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={7} className="p-20 text-center text-muted-foreground font-bold italic">No records found.</TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="group border-b border-white/5 hover:bg-white/[0.02] h-24">
                    <TableCell className="pl-6"><input type="checkbox" className="rounded" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-black text-primary border border-primary/10">{customer.name[0]}</div>
                        <div className="font-bold text-white text-sm">{customer.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-white/80">{customer.company || 'Private Entity'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                         {getSourceIcon(customer.source)}
                         {customer.source || "Direct Entry"}
                      </div>
                    </TableCell>
                    <TableCell className="space-y-1">
                      <div className="text-xs font-semibold text-white/85 flex items-center gap-2"><Mail className="h-3 w-3 text-primary/70" /> {customer.email}</div>
                      <div className="text-xs font-semibold text-white/85 flex items-center gap-2"><Phone className="h-3 w-3 text-primary/70" /> {customer.phone || 'N/A'}</div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-white/85">
                       {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedHistoryCustomer(customer); setHistoryOpen(true); }} className="w-9 h-9 rounded-lg hover:bg-white/10 text-primary"><History className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => startEdit(customer)} className="w-9 h-9 rounded-lg hover:bg-white/10"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteCustomer(customer.id)} className="w-9 h-9 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 className="h-4 w-4" /></Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
      {/* Transaction History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl glass-panel border-white/5 bg-black/90 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <History className="h-6 w-6 text-primary" />
              Sales History: {selectedHistoryCustomer?.name}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Cross-referencing customer email with transaction ledger
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            {sales.filter(o => o.customerEmail === selectedHistoryCustomer?.email).length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <ShoppingCart className="h-12 w-12 text-white/5 mx-auto mb-4" />
                <p className="text-muted-foreground font-bold italic">No transaction records found for this account.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sales.filter(o => o.customerEmail === selectedHistoryCustomer?.email).map(order => (
                  <div key={order.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                    <div className="space-y-1">
                      <div className="text-xs font-black uppercase tracking-widest text-primary">{order.orderNumber}</div>
                      <div className="text-lg font-bold text-white">${Number(order.totalAmount).toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} Items</div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      order.paymentStatus === 'paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {order.paymentStatus}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManager;
