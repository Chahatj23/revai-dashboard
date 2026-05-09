import React, { useState } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  ArrowLeft, 
  Upload, 
  DollarSign, 
  Layers, 
  CheckCircle2,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const { addProduct } = useProducts();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockLevel: '',
    reorderPoint: '',
    category: '',
    imageUrl: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Authentication session expired. Please re-log to authorize node deployment.");
      return;
    }
    setLoading(true);
    try {
      await addProduct({
        ...formData,
        price: parseFloat(formData.price) || 0,
        stockLevel: parseInt(formData.stockLevel) || 0,
        reorderPoint: parseInt(formData.reorderPoint) || 0,
        userId: currentUser.uid
      });
      setSuccess(true);
      setTimeout(() => navigate('/inventory'), 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to deploy product node. Registry mismatch.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-32">
      <header className="flex items-center gap-6">
        <Link to="/inventory">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl glass-panel border-white/5 text-white/40 hover:text-white">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="space-y-1">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 text-white/60">Inventory Operations</div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white">Deploy New Node</h1>
        </div>
      </header>

      {success ? (
        <Card className="glass-panel border-emerald-500/20 bg-emerald-500/5 p-10 flex flex-col items-center text-center animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Node Optimized</h2>
          <p className="text-muted-foreground font-bold italic">Persistence successful. Redirecting to Master Catalog...</p>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-panel border-none shadow-2xl bg-black/40 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> Identity & Categorization
                </CardTitle>
                <CardDescription>Define the core metadata for this product entity.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Product Designation</label>
                  <Input 
                    placeholder="e.g. Quantum Core Transceiver" 
                    className="h-14 glass-panel bg-white/5 border-white/5 px-6"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Technical Specification / Description</label>
                  <Input 
                    placeholder="Briefly describe the assets utility..." 
                    className="h-14 glass-panel bg-white/5 border-white/5 px-6"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Sector / Category</label>
                   <Input 
                    placeholder="e.g. Hardware, Software, Services" 
                    className="h-14 glass-panel bg-white/5 border-white/5 px-6"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-none shadow-2xl bg-black/40">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" /> Financials
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Base Unit Price</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="h-14 glass-panel bg-white/5 border-white/5 px-6"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-none shadow-2xl bg-black/40">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" /> Inventory State
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Initial Units</label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="h-14 glass-panel bg-white/5 border-white/5 px-6"
                    value={formData.stockLevel}
                    onChange={(e) => setFormData({...formData, stockLevel: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Reorder Threshold</label>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    className="h-14 glass-panel bg-white/5 border-white/5 px-6"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({...formData, reorderPoint: e.target.value})}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-none shadow-2xl bg-black/40 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" /> Media Layer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-40 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group">
                  <Upload className="h-8 w-8 text-white/20 group-hover:text-primary transition-colors" />
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Select Image for Cloud Deployment</p>
                </div>
                <Input 
                   placeholder="Or paste direct image URL..." 
                   className="mt-6 glass-panel h-12 text-xs" 
                   value={formData.imageUrl}
                   onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-6 pt-10 relative z-10">
            <Button variant="ghost" onClick={() => navigate('/inventory')} className="h-16 px-10 text-white/60 hover:text-white font-black uppercase tracking-widest text-[10px]">
              Discard Draft
            </Button>
            <Button disabled={loading} type="submit" className="h-16 px-16 shadow-2xl shadow-primary/30 font-black uppercase tracking-[0.2em] text-[10px]">
              {loading ? "Processing..." : "Authorize Deployment"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddProduct;
