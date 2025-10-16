import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Building2 } from "lucide-react";

interface Ambiteca {
  id: string;
  name: string;
  is_active: boolean;
}

export default function AdminAmbitecas() {
  const router = useRouter();
  const [ambs, setAmbs] = useState<Ambiteca[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name:'', address:'', city:'San Luis', state:'Antioquia' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch('/api/admin/ambitecas');
      const d = await res.json();
      if (res.ok) setAmbs(d.ambitecas || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = ambs.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = async (id: string, is_active: boolean) => {
    const prev = ambs;
    setAmbs(prev.map(a => a.id===id? { ...a, is_active: !is_active } : a));
    const res = await fetch('/api/admin/ambitecas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id, is_active: !is_active }) });
    if (!res.ok) setAmbs(prev); // rollback
  };

  const createAmbiteca = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    const res = await fetch('/api/admin/ambitecas', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    const d = await res.json();
    if (res.ok) {
      setShowCreate(false);
      setForm({ name:'', address:'', city:'San Luis', state:'Antioquia' });
      setAmbs(prev => [{ id: d.id, name: form.name, is_active: true, address: form.address, city: form.city }, ...prev]);
    }
    setCreating(false);
  };

  return (
    <>
      <Head>
        <title>Admin · Ambitecas</title>
      </Head>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Building2 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Gestión de Ambitecas</h1>
                <p className="text-sm text-muted-foreground">{filtered.length} ambitecas</p>
              </div>
            </div>
            <div className="ml-auto">
              <Link href="/admin">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="flex gap-6">
            <AdminSidebar />
            <div className="flex-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Filtros</CardTitle>
                  <CardDescription>Busca y administra ambitecas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar ambiteca..." className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background" />
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Button size="sm" onClick={()=>setShowCreate(true)}>Nueva ambiteca</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {loading ? (
                <div className="h-40 grid place-items-center text-sm text-muted-foreground">Cargando…</div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                      <th className="text-left p-3 font-medium">Nombre</th>
                      <th className="text-left p-3 font-medium">Dirección</th>
                      <th className="text-left p-3 font-medium">Ciudad</th>
                        <th className="text-left p-3 font-medium">Estado</th>
                        <th className="text-right p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(a => (
                        <tr key={a.id} className="border-t">
                          <td className="p-3">{a.name}</td>
                          <td className="p-3 text-muted-foreground">{(a as any).address || '—'}</td>
                          <td className="p-3 text-muted-foreground">{(a as any).city || '—'}</td>
                          <td className="p-3">{a.is_active ? 'Activa' : 'Inactiva'}</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/ambitecas/${a.id}`} className="px-3 py-1 rounded border">Ver</Link>
                              <button onClick={async ()=>{ if(!confirm('¿Eliminar ambiteca?')) return; const res = await fetch('/api/admin/ambitecas', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: a.id }) }); if(res.ok) setAmbs(prev=>prev.filter(x=>x.id!==a.id)); }} className="px-3 py-1 rounded border text-red-600">Eliminar</button>
                              <button onClick={()=>toggleActive(a.id, a.is_active)} className="px-3 py-1 rounded border">{a.is_active? 'Desactivar':'Activar'}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length===0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No se encontraron ambitecas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center">
          <div className="bg-card rounded-md border w-full max-w-md p-4">
            <h3 className="text-lg font-semibold mb-3">Nueva ambiteca</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Nombre</label>
                <input value={form.name} onChange={e=>setForm(s=>({ ...s, name: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Dirección</label>
                <input value={form.address} onChange={e=>setForm(s=>({ ...s, address: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Ciudad</label>
                  <input value={form.city} onChange={e=>setForm(s=>({ ...s, city: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Estado/Departamento</label>
                  <input value={form.state} onChange={e=>setForm(s=>({ ...s, state: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-background" />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={()=>setShowCreate(false)}>Cancelar</Button>
              <Button size="sm" disabled={creating} onClick={createAmbiteca}>{creating? 'Creando…':'Crear'}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


