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
    if (!name.trim()) return;
    setCreating(true);
    const res = await fetch('/api/admin/ambitecas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) });
    const d = await res.json();
    if (res.ok) {
      setName("");
      setAmbs(prev => [{ id: d.id, name, is_active: true }, ...prev]);
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
                    <div className="flex items-end">
                      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nueva ambiteca" className="w-56 px-3 py-2 border rounded-md bg-background" />
                      <Button className="ml-2" size="sm" disabled={creating} onClick={createAmbiteca}>{creating? 'Creando…' : 'Crear'}</Button>
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
                        <th className="text-left p-3 font-medium">Estado</th>
                        <th className="text-right p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(a => (
                        <tr key={a.id} className="border-t">
                          <td className="p-3">{a.name}</td>
                          <td className="p-3">{a.is_active ? 'Activa' : 'Inactiva'}</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/ambitecas/${a.id}`} className="px-3 py-1 rounded border">Ver</Link>
                              <button onClick={()=>toggleActive(a.id, a.is_active)} className="px-3 py-1 rounded border">{a.is_active? 'Desactivar':'Activar'}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length===0 && (
                        <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No se encontraron ambitecas</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}


