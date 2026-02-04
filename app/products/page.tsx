'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type Product = {
  id: string;
  name: string;
  description: string;
  brandName: string;
  quantity: any;
  weight: any;
  createdAt?: string;
};

export default function ProductsPage() {
  const { user, loading } = useRequireAuth(['admin']);
  const [rows, setRows] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brandName, setBrandName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setErr(null);
    const data = await apiFetch<Product[]>('/api/products');
    setRows(data);
  }

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    load().catch((e: any) => setErr(e?.message || 'Failed to load products'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, description, brandName, quantity, weight }),
      });
      setId('');
      setName('');
      setDescription('');
      setBrandName('');
      setQuantity('');
      setWeight('');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Shell title="Products" subtitle="Admin can add products. All products are visible here.">
      {err ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {err}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Add product</CardTitle>
          <form onSubmit={add} className="mt-4 grid gap-3">
            <Input label="Product ID" value={id} onChange={(e) => setId(e.target.value)} required />
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <Input label="Brand name" value={brandName} onChange={(e) => setBrandName(e.target.value)} required />
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              <Input label="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <Button disabled={submitting} type="submit">
              {submitting ? 'Saving…' : 'Save product'}
            </Button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Products</CardTitle>
            <Button variant="ghost" onClick={() => load().catch(() => {})}>
              Refresh
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-bold text-black/50">
                  <th className="py-2">ID</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Brand</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Weight</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-black/5">
                    <td className="py-3 font-semibold">{p.id}</td>
                    <td className="py-3">{p.name}</td>
                    <td className="py-3 text-black/70">{p.brandName}</td>
                    <td className="py-3 text-black/70">{String(p.quantity)}</td>
                    <td className="py-3 text-black/70">{String(p.weight)}</td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td className="py-6 text-center text-black/60" colSpan={5}>
                      No products found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
