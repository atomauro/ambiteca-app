import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Search, Gift, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

export default function AdminRewards() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all'|'active'|'inactive'>('all');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', cost_plv: '', image_url: '', stock: '', price_cop: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/rewards');
    const data = await res.json();
    if (res.ok) setRewards(data.rewards || []);
    setLoading(false);
  };

  const filtered = useMemo(() => rewards.filter((r) => {
    const okS = !search || (r.title || '').toLowerCase().includes(search.toLowerCase());
    const okSt = status==='all' || (status==='active'? r.is_active : !r.is_active);
    return okS && okSt;
  }), [rewards, search, status]);

  const uploadImage = async (id: string, file: File) => {
    try {
      const sign = await fetch('/api/admin/rewards-sign-upload', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fileName: file.name }) });
      const signed = await sign.json();
      if (!sign.ok) throw new Error(signed?.error || 'No se pudo firmar');
      const put = await fetch(signed.uploadUrl, { method:'PUT', headers:{'Content-Type': file.type}, body: file });
      if (!put.ok) throw new Error('Fallo al subir');
      // guardar URL
      const res = await fetch('/api/admin/rewards', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, image_url: signed.publicUrl }) });
      if (!res.ok) throw new Error('Fallo al actualizar');
      setRewards(prev => prev.map(r => r.id===id? { ...r, image_url: signed.publicUrl }: r));
      toast.success('Imagen actualizada');
    } catch(e:any) {
      toast.error(e.message || 'No se pudo subir la imagen');
    }
  };

  const createReward = async () => {
    if (!form.title || !form.cost_plv) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/rewards', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, cost_plv: Number(form.cost_plv), stock: form.stock? Number(form.stock): null, price_cop: form.price_cop? Number(form.price_cop): null }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error');
      setForm({ title:'', description:'', cost_plv:'', image_url:'', stock:'', price_cop:'' });
      toast.success('Recompensa creada');
      await load();
    } catch(e:any) {
      toast.error(e.message || 'No se pudo crear');
    }
    setCreating(false);
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    const prev = rewards;
    setRewards(prev.map(r=>r.id===id? { ...r, is_active: !is_active }: r));
    const res = await fetch('/api/admin/rewards', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, is_active: !is_active })});
    if (!res.ok) setRewards(prev);
  };

  return (
    <>
      <Head><title>Admin · Recompensas</title></Head>
      <main className="min-h-screen bg-background p-6">
        <div className="flex gap-6">
          <AdminSidebar />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-extrabold">Recompensas</h1>
              <div className="ml-auto">
                <Link href="/admin" className="underline text-sm">Volver al panel</Link>
              </div>
            </div>

            {/* Crear */}
            <div className="rounded-lg border p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                <div>
                  <label className="text-xs text-muted-foreground">Título</label>
                  <input value={form.title} onChange={(e)=>setForm(f=>({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Costo (PPV)</label>
                  <input value={form.cost_plv} onChange={(e)=>setForm(f=>({ ...f, cost_plv: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Stock</label>
                  <input value={form.stock} onChange={(e)=>setForm(f=>({ ...f, stock: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Precio (COP)</label>
                  <input value={form.price_cop} onChange={(e)=>setForm(f=>({ ...f, price_cop: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Imagen (URL)</label>
                  <input value={form.image_url} onChange={(e)=>setForm(f=>({ ...f, image_url: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div>
                  <button onClick={createReward} disabled={creating} className="px-4 py-2 rounded bg-green-600 text-white text-sm disabled:opacity-60">{creating?'Creando…':'Crear recompensa'}</button>
                </div>
                <div className="sm:col-span-4">
                  <label className="text-xs text-muted-foreground">Descripción</label>
                  <textarea value={form.description} onChange={(e)=>setForm(f=>({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" rows={2} />
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="rounded-lg border mb-6 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar recompensa..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select value={status} onChange={(e)=> setStatus(e.target.value as any)} className="px-3 py-2 border border-input rounded-md bg-background">
                    <option value="all">Todas</option>
                    <option value="active">Activas</option>
                    <option value="inactive">Inactivas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla */}
            {loading ? (
              <div className="h-40 grid place-items-center text-sm text-muted-foreground">Cargando…</div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Recompensa</th>
                      <th className="text-left p-3 font-medium">Costo (PPV)</th>
                      <th className="text-left p-3 font-medium">Estado</th>
                      <th className="text-left p-3 font-medium">Stock</th>
                      <th className="text-left p-3 font-medium">Precio (COP)</th>
                      <th className="text-left p-3 font-medium">Imagen</th>
                      <th className="text-right p-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{r.title}</div>
                            {(r.stock === 0) && (<Badge variant="outline">Sin stock</Badge>)}
                          </div>
                          <div className="text-xs text-muted-foreground">{r.description || '—'}</div>
                        </td>
                        <td className="p-3">{Number(r.cost_plv).toFixed(0)}</td>
                        <td className="p-3">{r.is_active ? 'Activa' : 'Inactiva'}</td>
                        <td className="p-3">
                          <input defaultValue={r.stock ?? ''} onBlur={async (e)=>{ const v=e.target.value; const res = await fetch('/api/admin/rewards',{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id, stock: v===''? null: Number(v) }) }); if (res.ok) setRewards(prev=>prev.map(x=>x.id===r.id? { ...x, stock: v===''? null: Number(v) }: x)); }} className="w-20 rounded border px-2 py-1 text-sm" />
                        </td>
                        <td className="p-3">
                          <input defaultValue={r.price_cop ?? ''} onBlur={async (e)=>{ const v=e.target.value; const res = await fetch('/api/admin/rewards',{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id, price_cop: v===''? null: Number(v) }) }); if (res.ok) setRewards(prev=>prev.map(x=>x.id===r.id? { ...x, price_cop: v===''? null: Number(v) }: x)); }} className="w-28 rounded border px-2 py-1 text-sm" />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {r.image_url ? (<img src={r.image_url} alt="img" className="h-10 w-10 object-cover rounded" />) : (
                              <span className="text-xs text-muted-foreground">Sin imagen</span>
                            )}
                            <label className="text-xs underline cursor-pointer">
                              Subir
                              <input type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) uploadImage(r.id, f); }} />
                            </label>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={()=>toggleActive(r.id, r.is_active)} className="px-3 py-1 rounded border">{r.is_active? 'Desactivar':'Activar'}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length===0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">No se encontraron recompensas</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}


