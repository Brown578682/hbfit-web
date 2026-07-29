"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  inStock: boolean;
  sortOrder: number;
}

interface ProductForm {
  name: string;
  description: string;
  priceCents: string; // input as dollars string
  imageUrl: string;
  inStock: boolean;
  sortOrder: string;
}

const emptyForm: ProductForm = {
  name: "", description: "", priceCents: "", imageUrl: "", inStock: true, sortOrder: "0",
};

export default function KioskProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // id or "new"
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/kiosk/products");
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm(emptyForm); setEditing("new"); setError(""); };
  const startEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description ?? "",
      priceCents: (p.priceCents / 100).toFixed(2),
      imageUrl: p.imageUrl ?? "",
      inStock: p.inStock,
      sortOrder: String(p.sortOrder),
    });
    setEditing(p.id);
    setError("");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      priceCents: Math.round(parseFloat(form.priceCents) * 100),
      imageUrl: form.imageUrl.trim() || null,
      inStock: form.inStock,
      sortOrder: parseInt(form.sortOrder) || 0,
    };
    if (!body.name || isNaN(body.priceCents)) {
      setError("Name and price are required.");
      setSaving(false);
      return;
    }
    const url = editing === "new" ? "/api/admin/kiosk/products" : `/api/admin/kiosk/products/${editing}`;
    const method = editing === "new" ? "POST" : "PATCH";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { await load(); setEditing(null); }
    else { const d = await res.json(); setError(d.error ?? "Save failed"); }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/kiosk/products/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white font-montserrat uppercase tracking-widest">Kiosk Products</h1>
          <p className="text-white/40 text-sm">Items available for self-checkout at the kiosk</p>
        </div>
        <button type="button" onClick={startNew}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-all">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-white/30" size={28} /></div>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className={`border p-4 flex items-center gap-4 ${p.inStock ? "border-white/10" : "border-white/5 opacity-50"}`}>
              <div className="flex-1">
                <div className="text-white font-medium">{p.name}</div>
                {p.description && <div className="text-white/40 text-xs mt-0.5">{p.description}</div>}
                <div className="text-white/60 text-sm mt-1">${(p.priceCents / 100).toFixed(2)} {!p.inStock && <span className="text-red-400 text-xs ml-2">OUT OF STOCK</span>}</div>
              </div>
              <button type="button" onClick={() => startEdit(p)} className="text-white/30 hover:text-white transition-colors"><Pencil size={14} /></button>
              <button type="button" onClick={() => del(p.id)} className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
          {products.length === 0 && <p className="text-white/30 text-sm text-center py-12">No products yet.</p>}
        </div>
      )}

      {/* Edit / New modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold uppercase tracking-widest text-sm">{editing === "new" ? "New Product" : "Edit Product"}</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1">Price ($) *</label>
                <input type="number" step="0.01" min="0" value={form.priceCents}
                  onChange={e => setForm(f => ({ ...f, priceCents: e.target.value }))}
                  className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase tracking-wider block mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                  className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-wider block mb-1">Image URL</label>
              <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} className="accent-white" />
              <span className="text-white/70 text-sm">In Stock</span>
            </label>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="button" onClick={save} disabled={saving}
              className="w-full bg-white text-black py-3 font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
