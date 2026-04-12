import { useState, useMemo, useRef } from "react";
import Papa from "papaparse";
import { useProducts } from "../../contexts/ProductContext";
import { toast } from "sonner";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import {
  Package,
  Search,
  Trash2,
  Download,
  Upload,
  Plus,
  ChevronRight,
  Edit3,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";

const InventoryManager = () => {
  const {
    products,
    loading,
    deleteProduct,
    bulkDeleteProducts,
    importProducts,
  } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const fileInputRef = useRef(null);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (p.category?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  const toggleSelect = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Delete ${selectedProducts.length} items? This cannot be undone.`,
      )
    ) {
      try {
        await bulkDeleteProducts(selectedProducts);
        setSelectedProducts([]);
        toast.success(
          `Successfully decommissioned ${selectedProducts.length} product nodes.`,
        );
      } catch (err) {
        toast.error(
          err.response?.data?.error || "Failed to bulk delete products.",
        );
      }
    }
  };

  const handleExport = () => {
    window.open(
      `http://localhost:5000/api/inventory/products/export`,
      "_blank",
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data
            .map((row) => ({
              name: row.name || row.Name || "",
              category: row.category || row.Category || "Uncategorized",
              description: row.description || row.Description || "",
              price: Number(row.price || row.Price || 0),
              stockLevel: Number(row.stockLevel || row.StockLevel || 0),
              reorderPoint: Number(row.reorderPoint || row.ReorderPoint || 0),
              discountPercentage: Number(
                row.discountPercentage || row.DiscountPercentage || 0,
              ),
            }))
            .filter((p) => p.name); // valid name required

          if (parsedData.length === 0) {
            toast.error(
              "No valid products found in CSV (Requires Name column).",
            );
            return;
          }

          toast.info(`Importing ${parsedData.length} products...`);
          await importProducts(parsedData);
          toast.success("CSV Ingestion Complete.");
        } catch (err) {
          toast.error("Failed to ingest CSV product data.");
        }
      },
      error: () => toast.error("Error parsing the CSV file."),
    });
    e.target.value = ""; // Reset input
  };

  return (
    <div className="p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/inventory"
              className="text-primary hover:underline text-xs font-black uppercase tracking-widest"
            >
              Inventory Hub
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground text-xs font-black uppercase tracking-widest">
              Master Inventory
            </span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">
            Inventory Ledger
          </h1>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="glass-panel border-primary/20 h-12 font-bold px-6"
          >
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="glass-panel border-primary/20 h-12 font-bold px-6"
          >
            <Download className="mr-2 h-4 w-4" /> Export All
          </Button>
          <Button
            className="shadow-2xl shadow-primary/40 h-12 px-8 font-extrabold"
            asChild
          >
            <Link to="/products/add">
              <Plus className="mr-2 h-5 w-5" /> Add New Product
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search catalog by name or category..."
            className="pl-12 h-14 glass-panel border-none font-medium text-lg focus-visible:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-4 animate-in zoom-in duration-300">
            <span className="text-sm font-black text-primary uppercase tracking-widest">
              {selectedProducts.length} items selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="font-black uppercase tracking-widest py-4 px-6 h-12"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete selected
            </Button>
          </div>
        )}
      </div>

      <Card className="glass-panel border-none shadow-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5 hover:bg-white/5 border-white/10">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="rounded border-white/20 bg-transparent text-primary focus:ring-primary/50"
                  checked={
                    selectedProducts.length === filteredProducts.length &&
                    filteredProducts.length > 0
                  }
                  onChange={(e) => {
                    if (e.target.checked)
                      setSelectedProducts(filteredProducts.map((p) => p.id));
                    else setSelectedProducts([]);
                  }}
                />
              </TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-white">
                Product Detail
              </TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-center text-white">
                Stock Status
              </TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-right text-white">
                List Price
              </TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-center text-white">
                Availability
              </TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-14 w-full rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className={cn(
                    "hover:bg-primary/5 border-white/5 transition-all group",
                    selectedProducts.includes(product.id) && "bg-primary/10",
                  )}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-white/20 bg-transparent text-primary"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-primary border border-white/5 group-hover:scale-110 transition-transform">
                        {product.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">
                          {product.name}
                        </div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                          {product.category}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        product.stockLevel <= product.reorderPoint
                          ? "bg-destructive/20 text-destructive"
                          : "bg-emerald-500/20 text-emerald-500",
                      )}
                    >
                      {product.stockLevel <= product.reorderPoint
                        ? "Low Stock"
                        : "In Stock"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-black text-white text-lg flex items-center justify-end gap-2">
                      {product.discountPercentage > 0 && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full line-through opacity-50">
                          ${product.price?.toFixed(2)}
                        </span>
                      )}
                      $
                      {(
                        product.price *
                        (1 - (product.discountPercentage || 0) / 100)
                      ).toFixed(2)}
                    </div>
                    {product.discountPercentage > 0 && (
                      <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mt-1">
                        {product.discountPercentage}% OFF Active Promo
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-black text-xl text-primary">
                      {product.stockLevel}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Units
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="hover:bg-primary/20 text-primary"
                      >
                        <Link to={`/products/${product.id}`}>
                          <Edit3 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (window.confirm("Delete this product?")) {
                            try {
                              await deleteProduct(product.id);
                              toast.success("Product node decommissioned.");
                            } catch (err) {
                              toast.error(
                                err.response?.data?.error ||
                                  "Failed to delete product.",
                              );
                            }
                          }
                        }}
                        className="hover:bg-destructive/20 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground font-bold italic underline decoration-primary/50 decoration-2">
                    No product nodes matched your search parameters.
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default InventoryManager;
