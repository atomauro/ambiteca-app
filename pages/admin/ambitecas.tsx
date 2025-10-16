import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase/client";

interface Ambiteca {
  id: string;
  name: string;
  is_active: boolean;
}

export default function AdminAmbitecas() {
  const [ambs, setAmbs] = useState<Ambiteca[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('ambitecas').select('id,name,is_active').order('name');
      if (!error) setAmbs(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = ambs.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = async (id: string, is_active: boolean) => {
    const prev = ambs;
    setAmbs(prev.map(a => a.id===id? { ...a, is_active: !is_active } : a));
    const { error } = await supabase.from('ambitecas').update({ is_active: !is_active }).eq('id', id);
    if (error) setAmbs(prev); // rollback
  };

  return (
    <>
      <Head>
        <title>Admin · Ambitecas</title>
      </Head>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Ambitecas</h1>
            </div>
            <div className="ml-auto">
              <Link href="/admin" className="underline text-sm">Volver al panel</Link>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="flex gap-6">
            <AdminSidebar />
            <div className="flex-1">
              <div className="rounded-lg border mb-6 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar ambiteca..." className="w-full sm:w-80 rounded border px-3 py-2 text-sm" />
                </div>
              </div>

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


